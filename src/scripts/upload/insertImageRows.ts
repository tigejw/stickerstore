import type { PoolClient } from 'pg';

export interface ImageRecord {
  url: string;
  altText: string;
  isThumbnail: boolean;
  displayOrder: number | null;
}

type ImageTable = 'product_images' | 'bundle_images';
type IdColumn = 'product_id' | 'bundle_id';

export async function insertImageRows(
  client: PoolClient,
  table: ImageTable,
  idColumn: IdColumn,
  entityId: number,
  images: ImageRecord[]
): Promise<void> {
  const values: unknown[] = [];
  const placeholders = images.map((img, i) => {
    const base = i * 5;
    values.push(entityId, img.url, img.altText, img.isThumbnail, img.displayOrder);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
  });

  const query = `
    INSERT INTO ${table} (${idColumn}, image_url, alt_text, is_thumbnail, display_order)
    VALUES ${placeholders.join(', ')}
  `;

  await client.query(query, values);
}