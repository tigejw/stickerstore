import request from "supertest";
const app = require("../../src/app");
import seed from "../../db/seeds/seed";
import db from "../../db/connection";
import Stripe from "stripe";
import { stripe } from "../../src/controller";

beforeEach(() => {
    return seed();
});

afterAll(() => {
    return db.end();
});

const buildSignedPayload = (payload: object) => {
    const payloadString = JSON.stringify(payload);
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string;

    const stripeForSigning = new Stripe("sk_test_placeholder");

    const header = stripeForSigning.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret,
    });

    return { payloadString, header };
};

describe("POST /handle-stripe-webhook", () => {
    test("200: valid signed checkout.session.completed payload persists an order and order_products", () => {
        const mockSession = {
            id: "cs_test_mock_valid_1",
            payment_intent: "pi_mock_valid_1",
            currency: "eur",
            amount_total: 899,
            amount_subtotal: 899,
            payment_status: "paid",
            status: "complete",
            customer_details: { email: "test@example.com" },
            collected_information: {
                shipping_details: {
                    address: {
                        line1: "42 Test Street",
                        line2: null,
                        city: "Essen",
                        postal_code: "45127",
                        country: "DE",
                    },
                },
            },
            metadata: {
                items: JSON.stringify([{ type: "product", id: 1, quantity: 2 }]),
            },
            line_items: {
                data: [{ price: { unit_amount: 899 } }],
            },
        };

        jest
            .spyOn(stripe.checkout.sessions, "retrieve")
            .mockResolvedValueOnce(mockSession as any);

        const { payloadString, header } = buildSignedPayload({
            id: "evt_mock_1",
            type: "checkout.session.completed",
            data: { object: { id: mockSession.id } },
        });

        return request(app)
            .post("/handle-stripe-webhook")
            .set("stripe-signature", header)
            .set("Content-Type", "application/json")
            .send(payloadString)
            .expect(200)
            .then(async () => {
                const orderResult = await db.query(
                    `SELECT * FROM orders WHERE stripe_session_id = $1`,
                    [mockSession.id],
                );
                expect(orderResult.rows).toHaveLength(1);
                expect(orderResult.rows[0]).toEqual(
                    expect.objectContaining({
                        customer_email: "test@example.com",
                        shipping_city: "Essen",
                        payment_status: "paid",
                    }),
                );

                const itemsResult = await db.query(
                    `SELECT * FROM order_products WHERE order_id = $1`,
                    [orderResult.rows[0].order_id],
                );
                expect(itemsResult.rows).toHaveLength(1);
                expect(itemsResult.rows[0]).toEqual(
                    expect.objectContaining({
                        product_id: 1,
                        bundle_id: null,
                        quantity: 2,
                        price_at_purchase: 899,
                    }),
                );
            });
    });

    test("400: rejects a request with an invalid signature", () => {
        const payloadString = JSON.stringify({
            id: "evt_mock_bad_sig",
            type: "checkout.session.completed",
            data: { object: { id: "cs_test_bad_sig" } },
        });

        return request(app)
            .post("/handle-stripe-webhook")
            .set("stripe-signature", "t=12345,v1=invalidsignature")
            .set("Content-Type", "application/json")
            .send(payloadString)
            .expect(400);
    });

    test("200: a non-checkout.session.completed event is acknowledged but does not create an order", () => {
        const { payloadString, header } = buildSignedPayload({
            id: "evt_mock_other",
            type: "payment_intent.created",
            data: { object: { id: "pi_mock_other" } },
        });

        return request(app)
            .post("/handle-stripe-webhook")
            .set("stripe-signature", header)
            .set("Content-Type", "application/json")
            .send(payloadString)
            .expect(200)
            .then(async () => {
                const result = await db.query(
                    `SELECT * FROM orders WHERE payment_intent = $1`,
                    ["pi_mock_other"],
                );
                expect(result.rows).toHaveLength(0);
            });
    });

    test("idempotency: processing the same session twice only creates one order", () => {
        const mockSession = {
            id: "cs_test_mock_dupe",
            payment_intent: "pi_mock_dupe",
            currency: "eur",
            amount_total: 899,
            amount_subtotal: 899,
            payment_status: "paid",
            status: "complete",
            customer_details: { email: "dupe@example.com" },
            collected_information: {
                shipping_details: {
                    address: {
                        line1: "1 Dupe Street",
                        line2: null,
                        city: "Essen",
                        postal_code: "45127",
                        country: "DE",
                    },
                },
            },
            metadata: {
                items: JSON.stringify([{ type: "product", id: 1, quantity: 1 }]),
            },
            line_items: { data: [{ price: { unit_amount: 899 } }] },
        };

        jest
            .spyOn(stripe.checkout.sessions, "retrieve")
            .mockResolvedValue(mockSession as any);

        const { payloadString, header } = buildSignedPayload({
            id: "evt_mock_dupe",
            type: "checkout.session.completed",
            data: { object: { id: mockSession.id } },
        });

        const sendRequest = () =>
            request(app)
                .post("/handle-stripe-webhook")
                .set("stripe-signature", header)
                .set("Content-Type", "application/json")
                .send(payloadString)
                .expect(200);

        return sendRequest()
            .then(() => sendRequest())
            .then(async () => {
                const result = await db.query(
                    `SELECT * FROM orders WHERE stripe_session_id = $1`,
                    [mockSession.id],
                );
                expect(result.rows).toHaveLength(1);
            });
    });
});