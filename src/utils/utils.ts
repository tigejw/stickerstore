import format from "pg-format";
import { Resend } from "resend"
import db from "../../db/connection";

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
  console.log({ data });
  console.log(process.env.COMPANY_EMAIL)

  if (error) {
    return console.error({ error });
  }

}