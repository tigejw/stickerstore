import * as fs from 'fs';
import * as path from 'path';

const manifestFileName = 'manifest.json';

export function discoverEntryFolders(rootDir: string): string[] {
  let dirents: fs.Dirent[];
  try {
    dirents = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch (err) {
    throw new Error(`Could not read root uploads directory "${rootDir}": ${(err as Error).message}`);
  }

  const subfolders = dirents.filter((d) => d.isDirectory()).map((d) => d.name);

  const foldersWithManifest = subfolders.filter((name) =>
    fs.existsSync(path.join(rootDir, name, manifestFileName))
  );

  return foldersWithManifest.map((name) => path.join(rootDir, name));
}