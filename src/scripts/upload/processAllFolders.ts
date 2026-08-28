import { discoverEntryFolders } from './discoverEntryFolders';
import { processFolder, ProcessFolderDeps } from './processFolder';

export interface FolderResult {
  folderPath: string;
  status: 'success' | 'failed';
  error?: string;
}

export async function processAllFolders(
  rootDir: string,
  deps: ProcessFolderDeps
): Promise<FolderResult[]> {
  const folders = discoverEntryFolders(rootDir);
  const results: FolderResult[] = [];

  for (const folderPath of folders) {
    try {
      await processFolder(folderPath, deps);
      results.push({ folderPath, status: 'success' });
    } catch (err) {
      results.push({ folderPath, status: 'failed', error: (err as Error).message });
    }
  }

  return results;
}