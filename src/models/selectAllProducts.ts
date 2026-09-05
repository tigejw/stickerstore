import db from "../../db/connection";
import { type Product, type ProductsQuery } from "../utils/types";
import { parseBooleanQuery, parseSortBy, parseOrder } from "../utils/utils";


export function selectAllProducts({
  sort_by,
  order,
  active,
  is_new,
}: ProductsQuery): Promise<Product[]> {
  const queryValues: Array<boolean> = [];
  const whereClauses: string[] = [];
  const activeFilter = parseBooleanQuery(active);
  const newFilter = parseBooleanQuery(is_new);
  const sortColumn = parseSortBy(sort_by);
  const sortDirection = parseOrder(order);

  if (activeFilter !== undefined) {
    queryValues.push(activeFilter);
    whereClauses.push(`products.active = $${queryValues.length}`);
  }

  if (newFilter !== undefined) {
    queryValues.push(newFilter);
    whereClauses.push(`products.is_new = $${queryValues.length}`);
  }

  const dbQuery = `
    SELECT
      products.product_id,
      products.slug,
      products.name,
      products.description,
      products.price,
      products.active,
      products.created_at,
      products.size,
      products.is_new,
      MAX(product_images.image_url) FILTER (WHERE product_images.is_thumbnail) AS thumbnail_url,
      MAX(product_images.alt_text) FILTER (WHERE product_images.is_thumbnail) AS thumbnail_alt_text,
      json_agg(
        json_build_object(
          'image_url', product_images.image_url,
          'alt_text', product_images.alt_text,
          'is_thumbnail', product_images.is_thumbnail,
          'display_order', product_images.display_order
        ) ORDER BY product_images.display_order
      ) AS images
    FROM products
    JOIN product_images
      ON products.product_id = product_images.product_id
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
    GROUP BY products.product_id
    ORDER BY ${sortColumn} ${sortDirection}
  `;

  return db
    .query(dbQuery, queryValues)
    .then((result) => result.rows as Product[]);
}