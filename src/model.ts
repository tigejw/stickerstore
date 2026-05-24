import fs from "fs/promises";
import db from "../db/connection"
export interface EndpointDocumentation {
  description: string;
  queries: string[];
  exampleResponse: Record<string, unknown>;
}

export type EndpointsData = Record<string, EndpointDocumentation>;

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

export function readEndpointsData(): Promise<EndpointsData> {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf8")
    .then((endpoints) => {
      return JSON.parse(endpoints) as EndpointsData;
    });
}

export function selectAllProducts(): Promise<Product[]> {
  return db.query(`
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
    ORDER BY products.product_id
  `).then((result) => result.rows as Product[])
}
