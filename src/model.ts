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
