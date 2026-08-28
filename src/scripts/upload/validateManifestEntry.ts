export type EntityType = 'product' | 'bundle';

export interface ManifestEntry {
  type: EntityType;
  slug: string;
  name: string;
  description: string;
  price: number;
  imagesDir: string;
  altText: Record<string, string>;
  productSlugs?: string[];
}

function requireNonEmptyString(value: unknown, fieldName: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

export function validateManifestEntry(entry: ManifestEntry, fileNames: string[]): void {
  if (entry.type !== 'product' && entry.type !== 'bundle') {
    throw new Error(`Invalid type "${entry.type}": expected "product" or "bundle"`);
  }

  requireNonEmptyString(entry.slug, 'slug');
  requireNonEmptyString(entry.name, 'name');
  requireNonEmptyString(entry.description, 'description');

  if (typeof entry.price !== 'number' || !Number.isInteger(entry.price) || entry.price <= 0) {
    throw new Error('price must be a positive integer (cents)');
  }

  if (entry.type === 'bundle') {
    if (!Array.isArray(entry.productSlugs) || entry.productSlugs.length === 0) {
      throw new Error('bundle entries require a non-empty productSlugs array');
    }
    entry.productSlugs.forEach((slug, i) => {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        throw new Error(`productSlugs[${i}] must be a non-empty string`);
      }
    });
  }

  const altTextKeys = Object.keys(entry.altText ?? {});
  const missingAltText = fileNames.filter((f) => !altTextKeys.includes(f));
  if (missingAltText.length > 0) {
    throw new Error(`Missing altText for file(s): ${missingAltText.join(', ')}`);
  }

  const orphanedAltText = altTextKeys.filter((k) => !fileNames.includes(k));
  if (orphanedAltText.length > 0) {
    throw new Error(`altText references file(s) not found in imagesDir: ${orphanedAltText.join(', ')}`);
  }
}