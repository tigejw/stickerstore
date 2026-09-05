import format from "pg-format";
import db from "../../db/connection";
import { Resend } from "resend";
import { type Order } from "../model"

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

export const sendOrderConfirmationEmail = async (order: Order) => {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { id, customerEmail, shippingDetails, items, amountTotal, currency } = order

  const formattedTotal =
    order.amountTotal != null
      ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: order.currency?.toUpperCase() ?? "EUR",
      }).format(order.amountTotal / 100)
      : "N/A";

  console.log(items)
  const itemsHtml = items
    .map((item) => `<li>${item.quantity} x ${item.type} (id: ${item.id})</li>`)
    .join("");


  const { error } = await resend.emails.send({
    from: "Stickerstore <onboarding@resend.dev>",
    to: [order.customerEmail],
    subject: `Your order #${order.id}`,
    html: `
      <p>Hey! Even though our store isn't live yet, thanks for checking out websites functionality!</p>

      <p>To confirm, you won't be recieving any stickers and no money will be taken from your bank account, this transaction has occured within Stripe's test mode!

      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ${formattedTotal}</p>
      <p><strong>Shipping to:</strong><br/>
        ${order.shippingDetails.line1}<br/>
        ${order.shippingDetails.line2 ? order.shippingDetails.line2 + "<br/>" : ""}
        ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}<br/>
        ${order.shippingDetails.country}
      </p>
    `,
  });

  if (error) {
    console.error({ error });
    throw error;
  }
};

