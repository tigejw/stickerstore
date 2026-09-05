import db from "../../db/connection"
import { checkExists } from "../utils/utils";
import { type BundleWithProducts } from "../utils/types";

export function selectBundleBySlug(slug: string) {
  return checkExists("bundles", "slug", slug).then(() => {
    return db
      .query(
        `
      SELECT
        bundles.bundle_id,
        bundles.slug AS bundle_slug,
        bundles.name AS bundle_name,
        bundles.description AS bundle_description,
        bundles.price AS bundle_price,
        bundles.active AS bundle_active,
        bundles.created_at AS bundle_created_at,
        bundles.is_new AS bundle_is_new,
        bundle_thumb.image_url AS bundle_thumbnail_url,
        bundle_thumb.alt_text AS bundle_thumbnail_alt_text,
        bundle_imgs.images AS bundle_images,
        products.product_id,
        products.slug AS product_slug,
        products.name AS product_name,
        products.price,
        products.active AS product_active,
        products.is_new AS product_is_new,
        product_thumb.image_url AS product_thumbnail_url,
        product_thumb.alt_text AS product_thumbnail_alt_text
      FROM bundles
      JOIN bundle_products
        ON bundles.bundle_id = bundle_products.bundle_id
      JOIN products
        ON bundle_products.product_id = products.product_id
      LEFT JOIN product_images AS product_thumb
        ON product_thumb.product_id = products.product_id
        AND product_thumb.is_thumbnail = TRUE
      LEFT JOIN bundle_images AS bundle_thumb
        ON bundle_thumb.bundle_id = bundles.bundle_id
        AND bundle_thumb.is_thumbnail = TRUE
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'image_url', bi.image_url,
            'alt_text', bi.alt_text,
            'is_thumbnail', bi.is_thumbnail,
            'display_order', bi.display_order
          ) ORDER BY bi.display_order
        ) AS images
        FROM bundle_images bi
        WHERE bi.bundle_id = bundles.bundle_id
      ) AS bundle_imgs ON TRUE
      WHERE bundles.slug = $1
      ORDER BY products.product_id
        `,
        [slug],
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Not found!" });
        }

        const bundle = {
          bundle_id: rows[0].bundle_id,
          slug: rows[0].bundle_slug,
          name: rows[0].bundle_name,
          description: rows[0].bundle_description,
          price: rows[0].bundle_price,
          active: rows[0].bundle_active,
          created_at: rows[0].bundle_created_at,
          is_new: rows[0].bundle_is_new,
          thumbnail_url: rows[0].bundle_thumbnail_url,
          thumbnail_alt_text: rows[0].bundle_thumbnail_alt_text,
          images: rows[0].bundle_images,
          products: rows.map((row) => ({
            product_id: row.product_id,
            slug: row.product_slug,
            name: row.product_name,
            price: row.price,
            active: row.product_active,
            is_new: row.product_is_new,
            thumbnail_url: row.product_thumbnail_url,
            thumbnail_alt_text: row.product_thumbnail_alt_text,
          })),
        };

        return bundle as BundleWithProducts;
      });
  });
}