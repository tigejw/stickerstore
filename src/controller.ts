import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import {
  readEndpointsData,
  selectAllProducts,
  type ProductsQuery,
  selectProductBySlug,
  selectAllBundles,
  type BundlesQuery,
  selectBundleBySlug,
  selectCheckoutItems,
  type CheckoutItemInput,
} from "./model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type LineItem = {
  price_data: {
    currency: "eur";
    product_data: {
      name: string;
      images: string[];
    };
    unit_amount: number;
  };
  quantity: number;
};

export const getEndpoints = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  readEndpointsData()
    .then((endpointsData) => {
      res.status(200).send({ endpoints: endpointsData });
    })
    .catch((err) => {
      next(err);
    });
};

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { sort_by, order, active, is_new } = req.query as ProductsQuery;
  selectAllProducts({ sort_by, order, active, is_new })
    .then((productsData) => {
      res.status(200).send(productsData);
    })
    .catch((err) => {
      next(err);
    });
};

export const getProductBySlug = (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;
  selectProductBySlug(slug)
    .then((product) => {
      res.status(200).send({ product: product });
    })
    .catch((err) => {
      next(err);
    });
};

export const getBundles = (req: Request, res: Response, next: NextFunction) => {
  const { sort_by, order, active, is_new } = req.query as BundlesQuery;
  selectAllBundles({ sort_by, order, active, is_new })
    .then((bundlesData) => {
      res.status(200).send(bundlesData);
    })
    .catch((err) => {
      next(err);
    });
};

export const getBundleBySlug = (
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;
  selectBundleBySlug(slug)
    .then((bundle) => {
      res.status(200).send({ bundle });
    })
    .catch((err) => {
      next(err);
    });
};

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
                images: [item.product.thumbnail],
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
              images: [item.bundle.cover_image],
            },
            unit_amount: item.bundle.price,
          },
          quantity: item.quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cart",
        shipping_address_collection: {
          allowed_countries: ["DE", "FR", "GB"],
        },
        customer_creation: "always",
      });

      res.status(200).send({ items: checkoutItems, line_items, session });
    })
    .catch((err) => {
      next(err);
    });
};
