import fs from "fs/promises";
import db from "../db/connection";
import { checkExists, notifyMe } from "./utils/utils";
import Stripe from "stripe";
export interface EndpointDocumentation {
  description: string;
  queries: string[];
  exampleResponse: Record<string, unknown>;
}

export type EndpointsData = Record<string, EndpointDocumentation>;

export interface ProductsQuery {
  sort_by?: "price" | "created_at" | "name";
  order?: "asc" | "desc";
  active?: string;
  is_new?: string;
}

export interface BundlesQuery {
  sort_by?: "price" | "created_at" | "name";
  order?: "asc" | "desc";
  active?: string;
  is_new?: string;
}

interface ProductImage {
  image_url: string;
  alt_text: string;
  is_thumbnail: boolean;
  display_order: number;
}

interface Product {
  product_id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  created_at: Date;
  size: string;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
  images: ProductImage[];
}

interface BundleImage {
  image_url: string;
  alt_text: string;
  is_thumbnail: boolean;
  display_order: number;
}


interface Bundle {
  bundle_id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  created_at: Date;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
  images: BundleImage[];
}


interface BundleProductSummary {
  product_id: number;
  slug: string;
  name: string;
  price: number;
  active: boolean;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
}

interface BundleWithProducts extends Bundle {
  products: BundleProductSummary[];
}

export type CheckoutItemInput = {
  type: "product" | "bundle";
  id: string;
  quantity: number;
};

type CheckoutProductItem = {
  type: "product";
  quantity: number;
  product: Product;
};

type CheckoutBundleItem = {
  type: "bundle";
  quantity: number;
  bundle: BundleWithProducts;
};

export type CheckoutItem = CheckoutProductItem | CheckoutBundleItem;

const allowedSortColumns: Record<
  NonNullable<ProductsQuery["sort_by"]>,
  string
> = {
  price: "products.price",
  created_at: "products.created_at",
  name: "products.name",
};

const allowedOrderDirections: Record<
  NonNullable<ProductsQuery["order"]>,
  string
> = {
  asc: "ASC",
  desc: "DESC",
};

const allowedBundleSortColumns: Record<
  NonNullable<BundlesQuery["sort_by"]>,
  string
> = {
  created_at: "bundles.created_at",
  name: "bundles.name",
  price: "bundles.price"
};

const allowedBundleOrderDirections: Record<
  NonNullable<BundlesQuery["order"]>,
  string
> = {
  asc: "ASC",
  desc: "DESC",
};

interface OrderItemMetadata {
  type: "product" | "bundle";
  id: number;
  quantity: number;
}


const parseBooleanQuery = (value: string | undefined) => {
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

const parseSortBy = (sortBy: ProductsQuery["sort_by"]) => {
  if (sortBy === undefined) {
    return "products.product_id";
  }

  const sortColumn = allowedSortColumns[sortBy];

  if (!sortColumn) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return sortColumn;
};

const parseOrder = (order: ProductsQuery["order"]) => {
  if (order === undefined) {
    return "ASC";
  }

  const orderDirection = allowedOrderDirections[order];

  if (!orderDirection) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return orderDirection;
};

const parseBundleSortBy = (sortBy: BundlesQuery["sort_by"]) => {
  if (sortBy === undefined) {
    return "bundles.bundle_id";
  }

  const sortColumn = allowedBundleSortColumns[sortBy];

  if (!sortColumn) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return sortColumn;
};

const parseBundleOrder = (order: BundlesQuery["order"]) => {
  if (order === undefined) {
    return "ASC";
  }

  const orderDirection = allowedBundleOrderDirections[order];

  if (!orderDirection) {
    throw { status: 400, msg: "Invalid query!" };
  }

  return orderDirection;
};

export function readEndpointsData(): Promise<EndpointsData> {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf8")
    .then((endpoints) => {
      return JSON.parse(endpoints) as EndpointsData;
    });
}

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
      MAX(bundle_images.image_url) FILTER (WHERE bundle_images.is_thumbnail) AS thumbnail_url,
      MAX(bundle_images.alt_text) FILTER (WHERE bundle_images.is_thumbnail) AS thumbnail_alt_text,
      json_agg(
        json_build_object(
          'image_url', bundle_images.image_url,
          'alt_text', bundle_images.alt_text,
          'is_thumbnail', bundle_images.is_thumbnail,
          'display_order', bundle_images.display_order
        ) ORDER BY bundle_images.display_order
      ) AS images
    FROM bundles
    JOIN bundle_images
      ON bundles.bundle_id = bundle_images.bundle_id
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
    GROUP BY bundles.bundle_id
    ORDER BY ${sortColumn} ${sortDirection}
  `;

  return db
    .query(dbQuery, queryValues)
    .then((result) => result.rows as Bundle[]);
}

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

export function selectProductById(productId: number) {
  return checkExists("products", "product_id", productId).then(() => {
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
      WHERE products.product_id = $1
      GROUP BY products.product_id
        `,
        [productId],
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Not found!" });
        }

        return rows[0] as Product;
      });
  });
}

export function selectBundleById(bundleId: number) {
  return checkExists("bundles", "bundle_id", bundleId).then(() => {
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
      WHERE bundles.bundle_id = $1
      ORDER BY products.product_id
        `,
        [bundleId],
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

export function selectCheckoutItems(items: CheckoutItemInput[]): Promise<CheckoutItem[]> {
  return Promise.all(
    items.map((item) => {
      const itemId = Number(item.id);

      if (item.type === "product") {
        return selectProductById(itemId).then((product) => {
          if (!product || !product.active) {
            return Promise.reject({ status: 400, msg: "One or more items are unavailable" });
          }
          return {
            type: "product" as const,
            quantity: item.quantity,
            product,
          };
        });
      }

      return selectBundleById(itemId).then((bundle) => {
        if (!bundle || !bundle.active) {
          return Promise.reject({ status: 400, msg: "One or more items are unavailable" });
        }
        return {
          type: "bundle" as const,
          quantity: item.quantity,
          bundle,
        };
      });
    }),
  );
}

export const fulfillOrder = async (
  fullSession: Stripe.Session,
): Promise<void> => {
  const shippingDetails = fullSession.collected_information?.shipping_details;
  const shippingAddress = shippingDetails?.address;
  const customerEmail = fullSession.customer_details?.email;
  const rawMetadataItems = fullSession.metadata?.items;

  if (
    !customerEmail ||
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.postal_code ||
    !shippingAddress?.country ||
    !rawMetadataItems
  ) {
    throw new Error(
      `Incomplete session data for fulfillment: session ${fullSession.id}`,
    );
  }

  let items: OrderItemMetadata[];
  try {
    items = JSON.parse(rawMetadataItems);
  } catch {
    throw new Error(
      `Failed to parse order metadata for session ${fullSession.id}`,
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No order items found for session ${fullSession.id}`);
  }

  const lineItems = fullSession.line_items?.data;
  if (!lineItems || lineItems.length !== items.length) {
    throw new Error(`Line item count mismatch for session ${fullSession.id}`);
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Idempotency guard: Stripe retries on failure, so don't double-insert
    const existing = await client.query(
      `SELECT order_id FROM orders WHERE stripe_session_id = $1`,
      [fullSession.id],
    );

    if (existing.rows.length > 0) {
      console.log(
        `Order for session ${fullSession.id} already exists, skipping.`,
      );
      await client.query("ROLLBACK");
      return;
    }

    const orderResult = await client.query(
      `INSERT INTO orders (
        stripe_session_id, payment_intent, currency, customer_email,
        shipping_address_line1, shipping_address_line2, shipping_city,
        shipping_postcode, shipping_country, amount_total, amount_subtotal,
        payment_status, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING order_id`,
      [
        fullSession.id,
        fullSession.payment_intent as string,
        fullSession.currency,
        customerEmail,
        shippingAddress.line1,
        shippingAddress.line2 ?? null,
        shippingAddress.city,
        shippingAddress.postal_code,
        shippingAddress.country,
        fullSession.amount_total,
        fullSession.amount_subtotal,
        fullSession.payment_status,
        "not shipped"
      ],
    );

    const orderId = orderResult.rows[0].order_id;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const unitAmount = lineItems[i].price?.unit_amount ?? 0;

      await client.query(
        `INSERT INTO order_products (
          order_id, product_id, bundle_id, quantity, price_at_purchase
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          item.type === "product" ? item.id : null,
          item.type === "bundle" ? item.id : null,
          item.quantity,
          unitAmount,
        ],
      );
    }

    await client.query("COMMIT");
    notifyMe(fullSession.id)
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

