export type EntityType = 'product' | 'bundle';

const supportedExtensions = new Set(['png', 'jpg', 'jpeg', 'webp']);
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

function getExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) {
    throw new Error(`Invalid file name: "${fileName}" has no extension`);
  }
  return parts[parts.length - 1].toLowerCase();
}


function parseBaseName(fileName: string): { isThumbnail: boolean; displayOrder: number | null } {
  const lastDot = fileName.lastIndexOf('.');
  const baseName = fileName.slice(0, lastDot).toLowerCase();

  if (baseName === 'thumbnail') {
    return { isThumbnail: true, displayOrder: null };
  }

  if (!/^\d+$/.test(baseName)) {
    throw new Error(
      `Invalid file name "${fileName}": expected "thumbnail.<ext>" or "<number>.<ext>"`
    );
  }

  return { isThumbnail: false, displayOrder: parseInt(baseName, 10) };
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

  const sourceExtension = getExtension(fileName);
  if (!supportedExtensions.has(sourceExtension)) {
    throw new Error(
      `Unsupported file extension ".${sourceExtension}" for file "${fileName}". Supported: ${[...supportedExtensions].join(', ')}`
    );
  }

  const { isThumbnail, displayOrder } = parseBaseName(fileName);

  const folder = entityType === 'product' ? 'products' : 'bundles';
  const baseName = isThumbnail ? 'thumbnail' : `${displayOrder}`;
  const path = `${folder}/${slug}/${baseName}.${outputExtension}`;

  return { path, isThumbnail, displayOrder };
}