export interface ParsedImageFileName {
  isThumbnail: boolean;
  displayOrder: number | null;
}

const supportedExtensions = new Set(['png', 'jpg', 'jpeg', 'webp']);

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

export function parseImageFileName(fileName: string): ParsedImageFileName {
  const extension = getExtension(fileName);
  if (!supportedExtensions.has(extension)) {
    throw new Error(
      `Unsupported file extension ".${extension}" for file "${fileName}". Supported: ${[...supportedExtensions].join(', ')}`
    );
  }
  return parseBaseName(fileName);
}