import fs from 'fs';
import path from 'path';

export function moveToSuccessfulUploads(sourceFolderPath: string, successfulUploadsRoot: string): void {
  const folderName = path.basename(sourceFolderPath);
  const destinationPath = path.join(successfulUploadsRoot, folderName);

  if (fs.existsSync(destinationPath)) {
    throw new Error(
      `Cannot move "${sourceFolderPath}" to successfulUploads: "${destinationPath}" already exists`
    );
  }

  if (!fs.existsSync(successfulUploadsRoot)) {
    fs.mkdirSync(successfulUploadsRoot, { recursive: true });
  }

  try {
    fs.renameSync(sourceFolderPath, destinationPath);
  } catch (err) {
    throw new Error(
      `Failed to move "${sourceFolderPath}" to "${destinationPath}": ${(err as Error).message}`
    );
  }
}