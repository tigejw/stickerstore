import { parseImageFileName } from "./parseImageFileName";

export function validateImageFileSet(fileNames: string[]): void {
  if (fileNames.length === 0) {
    throw new Error('No image files provided');
  }

  const parsed = fileNames.map((fileName) => ({
    fileName,
    ...parseImageFileName(fileName),
  }));

  const thumbnails = parsed.filter((p) => p.isThumbnail);
  if (thumbnails.length === 0) {
    throw new Error('No thumbnail image found: expected exactly one "thumbnail.<ext>" file');
  }
  if (thumbnails.length > 1) {
    throw new Error(
      `Multiple thumbnail images found: ${thumbnails.map((t) => t.fileName).join(', ')}`
    );
  }

  const numbered = parsed.filter((p) => !p.isThumbnail);
  if (numbered.length === 0) {
    throw new Error('No non-thumbnail images found: at least one numbered image is required');
  }

  const orders = numbered.map((p) => p.displayOrder as number).sort((a, b) => a - b);

  const duplicates = orders.filter((order, i) => orders.indexOf(order) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate display order(s) found: ${[...new Set(duplicates)].join(', ')}`);
  }

  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i) {
      throw new Error(
        `Display orders must be a gapless sequence starting at 0. Expected ${i}, found ${orders[i]}`
      );
    }
  }
}