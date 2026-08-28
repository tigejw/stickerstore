import { parseImageFileName } from "./parseImageFileName";
export type EntityType = 'product' | 'bundle';

const outputExtension = 'webp';
const validEntityTypes: EntityType[] = ['product', 'bundle'];

interface BuildStoragePathInput {
  entityType: EntityType;
  slug: string;
  fileName: string;
}

interface BuildStoragePathResult {
  path: string;
  isThumbnail: boolean;
  displayOrder: number | null;
}

export function buildStoragePath({
  entityType,
  slug,
  fileName,
}: BuildStoragePathInput): BuildStoragePathResult {
  if (!validEntityTypes.includes(entityType)) {
    throw new Error(
      `Invalid entityType "${entityType}": expected one of ${validEntityTypes.join(', ')}`
    );
  }

  if (!slug || slug.trim().length === 0) {
    throw new Error('slug must not be empty');
  }

  const { isThumbnail, displayOrder } = parseImageFileName(fileName);

  const folder = entityType === 'product' ? 'products' : 'bundles';
  const baseName = isThumbnail ? 'thumbnail' : `${displayOrder}`;
  const path = `${folder}/${slug}/${baseName}.${outputExtension}`;

  return { path, isThumbnail, displayOrder };
}