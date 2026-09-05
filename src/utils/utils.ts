import format from "pg-format";
import db from "../../db/connection";
import { Resend } from "resend";
import { type Order, type BundlesQuery, type ProductsQuery, type OrderItemMetadata, type EnrichedItem } from "./types";
import { selectProductById } from "../models/selectProductById";
import { selectBundleById } from "../models/selectBundleById";



export const checkExists = (table: string, column: string, value: string | number) => {
  return db
    .query(format("SELECT * FROM %I WHERE %I = $1", table, column), [value])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found!" });
      }

      return "It's alive!";
    });
};

export const notifyMe = async (sessionID: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'Stickerstore <onboarding@resend.dev>',
    to: [`${process.env.COMPANY_EMAIL}`],
    subject: 'new order!!!',
    html: `<p>Recieved an order with stripe session id ${sessionID}<p/>`,
  })

  if (error) {
    return console.error({ error });
  }

}

const enrichItem = async (item: OrderItemMetadata): Promise<EnrichedItem> => {
  try {
    const details =
      item.type === "product"
        ? await selectProductById(item.id)
        : await selectBundleById(item.id);

    return {
      ...item,
      name: details?.name,
      slug: details?.slug,
      thumbnailUrl: details?.thumbnail_url ?? null,
      thumbnailAlt: details?.thumbnail_alt_text ?? null,
    };
  } catch (err) {
    console.error(
      `Failed to fetch ${item.type} ${item.id} for order confirmation email:`,
      err,
    );
    return { ...item };
  }
};

export const sendOrderConfirmationEmail = async (order: Order) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { currency, items } = order

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const enrichedItems = await Promise.all(items.map(enrichItem));

  const formattedTotal =
    order.amountTotal != null && currency != null
      ? formatCurrency(order.amountTotal, currency)
      : "N/A";

  const itemsHtml = enrichedItems
    .map((item) => {
      const name = item.name ?? `${item.type} (id: ${item.id})`;
      const lineTotal =
        item.price != null && currency != null
          ? formatCurrency(item.price * item.quantity, currency)
          : "";
      const thumbnail = item.thumbnailUrl
        ? `<img src="${item.thumbnailUrl}" alt="${item.thumbnailAlt ?? name}" width="56" />`
        : "";

      return `<li>${thumbnail} ${item.quantity} x ${name} — ${lineTotal}</li>`;
    })
    .join("");

  const html = `
    <p>Hey! Even though our store isn't live yet, thanks for checking out websites functionality!</p>
    <p>To confirm, you won't be recieving any stickers and no money will be taken from your bank account, this transaction has occured within Stripe's test mode!</p>

    <ul>${itemsHtml}</ul>
    <p><strong>Total:</strong> ${formattedTotal}</p>
    <p><strong>Shipping to:</strong><br/>
      ${order.shippingDetails.line1}<br/>
      ${order.shippingDetails.line2 ? order.shippingDetails.line2 + "<br/>" : ""}
      ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}<br/>
      ${order.shippingDetails.country}
    </p>
  `;

  const { error } = await resend.emails.send({
    from: "Stickerstore <onboarding@resend.dev>",
    to: [order.customerEmail],
    subject: `Your order #${order.id}`,
    html,
  });
  if (error) {
    console.error({ error });
    throw error;
  }
};


export const parseBooleanQuery = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw { status: 400, msg: "Invalid query!" };
};

export const allowedBundleSortColumns: Record<
  NonNullable<BundlesQuery["sort_by"]>,
  string
> = {
  created_at: "bundles.created_at",
  name: "bundles.name",
  price: "bundles.price",
};

export const allowedBundleOrderDirections: Record<
  NonNullable<BundlesQuery["order"]>,
  string
> = {
  asc: "ASC",
  desc: "DESC",
};

export const parseBundleSortBy = (sortBy: BundlesQuery["sort_by"]) => {
  if (sortBy === undefined) {
    return "bundles.bundle_id";
  }

  const sortColumn = allowedBundleSortColumns[sortBy];

  if (!sortColumn) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return sortColumn;
};

export const parseBundleOrder = (order: BundlesQuery["order"]) => {
  if (order === undefined) {
    return "ASC";
  }

  const orderDirection = allowedBundleOrderDirections[order];

  if (!orderDirection) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return orderDirection;
};



export const allowedSortColumns: Record<
  NonNullable<ProductsQuery["sort_by"]>,
  string
> = {
  price: "products.price",
  created_at: "products.created_at",
  name: "products.name",
};

export const allowedOrderDirections: Record<
  NonNullable<ProductsQuery["order"]>,
  string
> = {
  asc: "ASC",
  desc: "DESC",
};



export const parseSortBy = (sortBy: ProductsQuery["sort_by"]) => {
  if (sortBy === undefined) {
    return "products.product_id";
  }

  const sortColumn = allowedSortColumns[sortBy];

  if (!sortColumn) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return sortColumn;
};

export const parseOrder = (order: ProductsQuery["order"]) => {
  if (order === undefined) {
    return "ASC";
  }

  const orderDirection = allowedOrderDirections[order];

  if (!orderDirection) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return orderDirection;
};
