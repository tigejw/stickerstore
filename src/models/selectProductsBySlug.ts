import db from "../../db/connection"
import { checkExists } from "../utils/utils";

export function selectProductBySlug(slug: string) {
  return checkExists("products", "slug", slug).then(() => {
    return db
      .query(
        `
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
      WHERE products.slug = $1
      GROUP BY products.product_id
        `,
        [slug],
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Not found!" });
        }
        return rows[0];
      });
  });
}