import type { Pool } from 'pg';
import { insertImageRows, ImageRecord } from './insertImageRows';

interface ProductInput {
  slug: string;
  name: string;
  description: string;
  price: number;
}

interface InsertProductWithImagesInput {
  pool: Pool;
  product: ProductInput;
  images: ImageRecord[];
}

export async function insertProductWithImages({
  pool,
  product,
  images,
}: InsertProductWithImagesInput): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO products (slug, name, description, price)
       VALUES ($1, $2, $3, $4)
       RETURNING product_id`,
      [product.slug, product.name, product.description, product.price]
    );

    const productId = result.rows[0].product_id;

    await insertImageRows(client, 'product_images', 'product_id', productId, images);

    await client.query('COMMIT');
    return productId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to insert product "${product.slug}": ${(err as Error).message}`);
  } finally {
    client.release();
  }
}