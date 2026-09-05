import Stripe from "stripe";
import db from "../../db/connection"
import { type FulfillOrderResult, type OrderItemMetadata,  } from "../utils/types";
import { notifyMe } from "../utils/utils";
export const fulfillOrder = async (
  fullSession: Stripe.Session,
): Promise<FulfillOrderResult> => {
  const shippingDetails = fullSession.collected_information?.shipping_details;
  const shippingAddress = shippingDetails?.address;
  const customerEmail = fullSession.customer_details?.email;
  const rawMetadataItems = fullSession.metadata?.items;

  if (
    !customerEmail ||
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.postal_code ||
    !shippingAddress?.country ||
    !rawMetadataItems
  ) {
    throw new Error(
      `Incomplete session data for fulfillment: session ${fullSession.id}`,
    );
  }

  let items: OrderItemMetadata[];
  try {
    items = JSON.parse(rawMetadataItems);
  } catch {
    throw new Error(
      `Failed to parse order metadata for session ${fullSession.id}`,
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No order items found for session ${fullSession.id}`);
  }

  const lineItems = fullSession.line_items?.data;
  if (!lineItems || lineItems.length !== items.length) {
    throw new Error(`Line item count mismatch for session ${fullSession.id}`);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Idempotency guard: Stripe retries on failure, so don't double-insert
    const existing = await client.query(
      `SELECT order_id FROM orders WHERE stripe_session_id = $1`,
      [fullSession.id],
    );

    if (existing.rows.length > 0) {
      console.log(
        `Order for session ${fullSession.id} already exists, skipping.`,
      );
      await client.query("ROLLBACK");
      return { status: "duplicate" };
    }

    const orderResult = await client.query(
      `INSERT INTO orders (
        stripe_session_id, payment_intent, currency, customer_email,
        shipping_address_line1, shipping_address_line2, shipping_city,
        shipping_postcode, shipping_country, amount_total, amount_subtotal,
        payment_status, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING order_id`,
      [
        fullSession.id,
        fullSession.payment_intent as string,
        fullSession.currency,
        customerEmail,
        shippingAddress.line1,
        shippingAddress.line2 ?? null,
        shippingAddress.city,
        shippingAddress.postal_code,
        shippingAddress.country,
        fullSession.amount_total,
        fullSession.amount_subtotal,
        fullSession.payment_status,
        "not shipped",
      ],
    );

    const orderId = orderResult.rows[0].order_id;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const unitAmount = lineItems[i].price?.unit_amount ?? 0;

      await client.query(
        `INSERT INTO order_products (
          order_id, product_id, bundle_id, quantity, price_at_purchase
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          item.type === "product" ? item.id : null,
          item.type === "bundle" ? item.id : null,
          item.quantity,
          unitAmount,
        ],
      );
    }

    await client.query("COMMIT");
    notifyMe(fullSession.id);
    return {
      status: "created",
      order: {
        id: orderId,
        customerEmail,
        shippingDetails: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 ?? null,
          city: shippingAddress.city,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country,
        },
        items,
        amountTotal: fullSession.amount_total,
        currency: fullSession.currency,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
