import fs from "fs/promises";
import db from "../db/connection";
import { checkExists } from "./utils/utils";
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
<<<<<<< HEAD
  sort_by?: "price" | "created_at" | "name";
=======
  sort_by?: "created_at" | "name";
>>>>>>> 7c87b939ceb243107ba8e0770b86372745c483bc
  order?: "asc" | "desc";
  active?: string;
  is_new?: string;
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
  image: string;
  thumbnail: string;
  alt_text: string;
}

interface Bundle {
  bundle_id: number;
  slug: string;
  name: string;
  description: string;
  cover_image: string;
  price: number;
  active: boolean;
  created_at: Date;
  is_new: boolean;
}

interface BundleWithProducts extends Bundle {
  products: Product[];
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
<<<<<<< HEAD
  price: "bundles.price"
=======
>>>>>>> 7c87b939ceb243107ba8e0770b86372745c483bc
};

const allowedBundleOrderDirections: Record<
  NonNullable<BundlesQuery["order"]>,
  string
> = {
  asc: "ASC",
  desc: "DESC",
};

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
      product_images.image,
      product_images.thumbnail,
      product_images.alt_text
    FROM products
    JOIN product_images
      ON products.product_id = product_images.product_id
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
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
        product_images.image,
        product_images.thumbnail,
        product_images.alt_text
      FROM products
      JOIN product_images
        ON products.product_id = product_images.product_id
      WHERE products.slug = $1
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
      bundles.cover_image,
      bundles.price,
      bundles.active,
      bundles.created_at,
      bundles.is_new
    FROM bundles
    ${whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""}
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
        bundles.cover_image,
        bundles.price AS bundle_price,
        bundles.active AS bundle_active,
        bundles.created_at AS bundle_created_at,
        bundles.is_new AS bundle_is_new,
        products.product_id,
        products.slug AS product_slug,
        products.name AS product_name,
        products.description AS product_description,
        products.price,
        products.active AS product_active,
        products.created_at AS product_created_at,
        products.size,
        products.is_new AS product_is_new,
        product_images.image,
        product_images.thumbnail,
        product_images.alt_text
      FROM bundles
      JOIN bundle_products
        ON bundles.bundle_id = bundle_products.bundle_id
      JOIN products
        ON bundle_products.product_id = products.product_id
      JOIN product_images
        ON products.product_id = product_images.product_id
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
          cover_image: rows[0].cover_image,
          price: rows[0].bundle_price,
          active: rows[0].bundle_active,
          created_at: rows[0].bundle_created_at,
          is_new: rows[0].bundle_is_new,
          products: rows.map((row) => ({
            product_id: row.product_id,
            slug: row.product_slug,
            name: row.product_name,
            description: row.product_description,
            price: row.price,
            active: row.product_active,
            created_at: row.product_created_at,
            size: row.size,
            is_new: row.product_is_new,
            image: row.image,
            thumbnail: row.thumbnail,
            alt_text: row.alt_text,
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
        product_images.image,
        product_images.thumbnail,
        product_images.alt_text
      FROM products
      JOIN product_images
        ON products.product_id = product_images.product_id
      WHERE products.product_id = $1
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
        bundles.cover_image,
        bundles.price AS bundle_price,
        bundles.active AS bundle_active,
        bundles.created_at AS bundle_created_at,
        bundles.is_new AS bundle_is_new,
        products.product_id,
        products.slug AS product_slug,
        products.name AS product_name,
        products.description AS product_description,
        products.price,
        products.active AS product_active,
        products.created_at AS product_created_at,
        products.size,
        products.is_new AS product_is_new,
        product_images.image,
        product_images.thumbnail,
        product_images.alt_text
      FROM bundles
      JOIN bundle_products
        ON bundles.bundle_id = bundle_products.bundle_id
      JOIN products
        ON bundle_products.product_id = products.product_id
      JOIN product_images
        ON products.product_id = product_images.product_id
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
          cover_image: rows[0].cover_image,
          price: rows[0].bundle_price,
          active: rows[0].bundle_active,
          created_at: rows[0].bundle_created_at,
          is_new: rows[0].bundle_is_new,
          products: rows.map((row) => ({
            product_id: row.product_id,
            slug: row.product_slug,
            name: row.product_name,
            description: row.product_description,
            price: row.price,
            active: row.product_active,
            created_at: row.product_created_at,
            size: row.size,
            is_new: row.product_is_new,
            image: row.image,
            thumbnail: row.thumbnail,
            alt_text: row.alt_text,
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
        return selectProductById(itemId).then((product) => ({
          type: "product" as const,
          quantity: item.quantity,
          product,
        }));
      }

      return selectBundleById(itemId).then((bundle) => ({
        type: "bundle" as const,
        quantity: item.quantity,
        bundle,
      }));
    }),
  );
}
