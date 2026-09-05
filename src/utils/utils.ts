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
      price: details?.price
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
        ? `<img src="${item.thumbnailUrl}" alt="${item.thumbnailAlt ?? name}" width="56" style="border-radius:6px;vertical-align:middle;margin-right:12px;" />`
        : "";

      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          ${thumbnail}
          <span style="vertical-align:middle;font-size:14px;color:#333;">
            ${item.quantity} x ${name}
          </span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#333;">
          ${lineTotal}
        </td>
      </tr>`;
    })
    .join("");

  const ACCENT = "#8cc084";
  const FONT = "'Helvetica Neue', Arial, sans-serif";

  const html = `
<div style="background-color:#f6f6f6;padding:32px 0;font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:${ACCENT};padding:0;">
                <img src="https://tdpqgiofkwlscegszsph.supabase.co/storage/v1/object/public/logo/colliopteryx.jpg" 
                  alt="Stickerstore" 
                  width="600" 
                  style="display:block;width:100%;max-width:600px;height:auto;" />
                <div style="padding:12px 32px;">
                  <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">
                   Thomas Wilson
                 </span>
                </div>
           </td>
        </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:15px;color:#333;line-height:1.5;margin-top:0;">
                Hi, thank you so much for checking out my portfolio project!
              </p>
              <p style="font-size:15px;color:#333;line-height:1.5;">
                I'm currently looking for any opportunities to help break into the tech
                industry. Please don't hesitate to get in touch with any questions about
                me or my application! 
                </p>
                <p style="font-size:15px;color:#333;line-height:1.5;">
                You can contact me via my email:
                <a href="mailto:${process.env.COMPANY_EMAIL}" style="color:${ACCENT};">${process.env.COMPANY_EMAIL}</a>
                to arrange a phone call!
</p>
              <p style="font-size:14px;color:#777;font-style:italic;">
                Just to confirm, you won't be receiving any stickers and no real
                transaction occurred ;)
              </p>

              <h3 style="font-size:15px;color:#333;border-bottom:2px solid ${ACCENT};padding-bottom:8px;margin-top:32px;">
                Order Summary
              </h3>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding-top:16px;font-size:15px;font-weight:bold;color:#333;">Total</td>
                  <td style="padding-top:16px;font-size:15px;font-weight:bold;color:#333;text-align:right;">${formattedTotal}</td>
                </tr>
              </table>

              <h3 style="font-size:15px;color:#333;border-bottom:2px solid ${ACCENT};padding-bottom:8px;margin-top:32px;">
                Shipping To
              </h3>
              <p style="font-size:14px;color:#333;line-height:1.6;">
                ${order.shippingDetails.line1}<br/>
                ${order.shippingDetails.line2 ? order.shippingDetails.line2 + "<br/>" : ""}
                ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}<br/>
                ${order.shippingDetails.country}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:20px 32px;text-align:center;">
              <span style="font-size:12px;color:#999;">
                Sent from the Stickerstore portfolio project
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
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
