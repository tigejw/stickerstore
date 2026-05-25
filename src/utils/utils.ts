import format from "pg-format";
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