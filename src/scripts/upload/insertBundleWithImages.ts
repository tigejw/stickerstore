import type { Pool } from 'pg';
import { insertImageRows, ImageRecord } from './insertImageRows';

interface BundleInput {
  slug: string;
  name: string;
  description: string;
  price: number;
}

interface InsertBundleWithImagesInput {
  pool: Pool;
  bundle: BundleInput;
  images: ImageRecord[];
  productSlugs: string[];
}

export async function insertBundleWithImages({
  pool,
  bundle,
  images,
  productSlugs,
}: InsertBundleWithImagesInput): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bundleResult = await client.query(
      `INSERT INTO bundles (slug, name, description, price)
       VALUES ($1, $2, $3, $4)
       RETURNING bundle_id`,
      [bundle.slug, bundle.name, bundle.description, bundle.price]
    );

    const bundleId = bundleResult.rows[0].bundle_id;

    const productLookup = await client.query(
      `SELECT product_id, slug FROM products WHERE slug = ANY($1)`,
      [productSlugs]
    );

    const foundSlugs = productLookup.rows.map((row: { slug: string }) => row.slug);
    const missingSlugs = productSlugs.filter((slug) => !foundSlugs.includes(slug));

    if (missingSlugs.length > 0) {
      throw new Error(`Unknown product slug(s): ${missingSlugs.join(', ')}`);
    }

    const bundleProductValues: unknown[] = [];
    const bundleProductPlaceholders = productLookup.rows.map(
      (row: { product_id: number }, i: number) => {
        bundleProductValues.push(bundleId, row.product_id);
        return `($${i * 2 + 1}, $${i * 2 + 2})`;
      }
    );

    await client.query(
      `INSERT INTO bundle_products (bundle_id, product_id) VALUES ${bundleProductPlaceholders.join(', ')}`,
      bundleProductValues
    );

    await insertImageRows(client, 'bundle_images', 'bundle_id', bundleId, images);

    await client.query('COMMIT');
    return bundleId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to insert bundle "${bundle.slug}": ${(err as Error).message}`);
  } finally {
    client.release();
  }
}