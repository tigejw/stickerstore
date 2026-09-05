import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import { selectCheckoutItems } from "../models/selectCheckoutItems";
import { type CheckoutItemInput, type LineItem } from "../utils/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createWebhookSession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { items } = req.body as { items?: CheckoutItemInput[] };

  if (!Array.isArray(items) || items.length === 0) {
    next({ status: 400, msg: "Invalid request!" });
    return;
  }

  const hasInvalidItem = items.some((item) => {
    if (
      !item ||
      (item.type !== "product" && item.type !== "bundle") ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return true;
    }

    return false;
  });

  if (hasInvalidItem) {
    next({ status: 400, msg: "Invalid request!" });
    return;
  }

  selectCheckoutItems(items)
    .then(async (checkoutItems) => {
      const line_items: LineItem[] = checkoutItems.map((item) => {
        if (item.type === "product") {
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: item.product.name,
                images: [item.product.thumbnail_url],
              },
              unit_amount: item.product.price,
            },
            quantity: item.quantity,
          };
        }

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.bundle.name,
              images: [item.bundle.thumbnail_url],
            },
            unit_amount: item.bundle.price,
          },
          quantity: item.quantity,
        };
      });

      const orderMetadata = checkoutItems.map((item) => ({
        type: item.type,
        id:
          item.type === "product"
            ? item.product.product_id
            : item.bundle.bundle_id,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cart",
        shipping_address_collection: {
          allowed_countries: ["DE", "FR", "GB"],
        },
        customer_creation: "always",
        metadata: {
          items: JSON.stringify(orderMetadata),
        },
      });

      res.status(200).send({ items: checkoutItems, line_items, session });
    })
    .catch((err) => {
      next(err);
    });
};