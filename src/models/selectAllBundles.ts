import db from "../../db/connection"
import { type BundlesQuery, type Bundle } from "../utils/types";
import { parseBooleanQuery, parseBundleSortBy, parseBundleOrder } from "../utils/utils";

export function selectAllBundles({
  sort_by,
  order,
  active,
  is_new,
}: BundlesQuery): Promise<Bundle[]> {
  const queryValues: Array<boolean> = [];
  const whereClauses: string[] = [];
  const activeFilter = parseBooleanQuery(active);
  const newFilter = parseBooleanQuery(is_new);
  const sortColumn = parseBundleSortBy(sort_by);
  const sortDirection = parseBundleOrder(order);

  if (activeFilter !== undefined) {
    queryValues.push(activeFilter);
    whereClauses.push(`bundles.active = $${queryValues.length}`);
  }

  if (newFilter !== undefined) {
    queryValues.push(newFilter);
    whereClauses.push(`bundles.is_new = $${queryValues.length}`);
  }

  const dbQuery = `
    SELECT
      bundles.bundle_id,
      bundles.slug,
      bundles.name,
      bundles.description,
      bundles.price,
      bundles.active,
      bundles.created_at,
      bundles.is_new,
      bundle_images_agg.thumbnail_url,
      bundle_images_agg.thumbnail_alt_text,
      bundle_images_agg.images,
      bundle_products_agg.products AS products
    FROM bundles
    JOIN LATERAL (
      SELECT
        json_agg(
          json_build_object(
            'image_url', bundle_images.image_url,
            'alt_text', bundle_images.alt_text,
            'is_thumbnail', bundle_images.is_thumbnail,
            'display_order', bundle_images.display_order
          ) ORDER BY bundle_images.display_order
        ) AS images,
        MAX(bundle_images.image_url) FILTER (WHERE bundle_images.is_thumbnail) AS thumbnail_url,
        MAX(bundle_images.alt_text) FILTER (WHERE bundle_images.is_thumbnail) AS thumbnail_alt_text
      FROM bundle_images
      WHERE bundle_images.bundle_id = bundles.bundle_id
    ) AS bundle_images_agg ON TRUE
    JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'product_id', products.product_id,
          'slug', products.slug,
          'name', products.name,
          'description', products.description,
          'price', products.price,
          'size', products.size,
          'active', products.active,
          'created_at', products.created_at,
          'is_new', products.is_new,
          'thumbnail_url', product_thumb.image_url,
          'thumbnail_alt_text', product_thumb.alt_text
        )
      ) AS products
      FROM bundle_products
      JOIN products
        ON products.product_id = bundle_products.product_id
      LEFT JOIN LATERAL (
        SELECT product_images.image_url, product_images.alt_text
        FROM product_images
        WHERE product_images.product_id = products.product_id
          AND product_images.is_thumbnail
        LIMIT 1
      ) AS product_thumb ON TRUE
      WHERE bundle_products.bundle_id = bundles.bundle_id
    ) AS bundle_products_agg ON TRUE
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
    ORDER BY ${sortColumn} ${sortDirection}
`;

  return db
    .query(dbQuery, queryValues)
    .then((result) => result.rows as Bundle[]);
}