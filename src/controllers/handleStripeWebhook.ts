import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import { fulfillOrder } from "../models/fulfillOrder";
import { sendOrderConfirmationEmail } from "../utils/utils";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (endpointSecret) {
        const signature = req.headers["stripe-signature"];

        if (typeof signature !== "string") {
            return res.sendStatus(400);
        }

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                endpointSecret,
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.log(`webhook signature verification failed.`, message);
            return res.sendStatus(400);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as { id: string };

            try {
                const fullSession = await stripe.checkout.sessions.retrieve(
                    session.id,
                    {
                        expand: [
                            "line_items",
                            "line_items.data.price.product",
                            "customer_details",
                        ],
                    },
                );

                const result = await fulfillOrder(fullSession);
                if (result.status === "created") {
                    try {
                        await sendOrderConfirmationEmail(result.order);
                    } catch (emailErr) {
                        console.error(
                            `Failed to send confirmation email for session ${session.id}:`,
                            emailErr,
                        );
                    }
                }
            } catch (err: unknown) {
                console.error(`FULFILLMENT FAILED for session ${session.id}:`, err);
                next(err);
                return;
            }
        }
    }
    res.status(200).json({ received: true });
};
