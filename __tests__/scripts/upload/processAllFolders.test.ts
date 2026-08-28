import { processAllFolders } from '../../../src/scripts/upload/processAllFolders';
import { discoverEntryFolders } from '../../../src/scripts/upload/discoverEntryFolders';
import { processFolder } from '../../../src/scripts/upload/processFolder';

jest.mock('./../../../src/scripts/upload/discoverEntryFolders');
jest.mock('./../../../src/scripts/upload/processFolder');

const mockedDiscoverEntryFolders = discoverEntryFolders as jest.Mock;
const mockedProcessFolder = processFolder as jest.Mock;

const deps = {
  pool: {} as any,
  supabaseClient: {} as any,
  bucket: 'product-images',
  successfulUploadsRoot: 'successfulUploads',
};

describe('processAllFolders', () => {
  afterEach(() => jest.resetAllMocks());

  it('processes every discovered folder and reports success for each', async () => {
    mockedDiscoverEntryFolders.mockReturnValue(['productsUpload/a', 'productsUpload/b']);
    mockedProcessFolder.mockResolvedValue(undefined);

    const results = await processAllFolders('productsUpload', deps);

    expect(mockedProcessFolder).toHaveBeenCalledTimes(2);
    expect(results).toEqual([
      { folderPath: 'productsUpload/a', status: 'success' },
      { folderPath: 'productsUpload/b', status: 'success' },
    ]);
  });

  it('continues processing remaining folders after one fails, and reports the error', async () => {
    mockedDiscoverEntryFolders.mockReturnValue(['productsUpload/a', 'productsUpload/b', 'productsUpload/c']);
    mockedProcessFolder
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Failed to upload image to "products/b/0.webp"'))
      .mockResolvedValueOnce(undefined);

    const results = await processAllFolders('productsUpload', deps);

    expect(mockedProcessFolder).toHaveBeenCalledTimes(3); // did not stop after b failed
    expect(results).toEqual([
      { folderPath: 'productsUpload/a', status: 'success' },
      {
        folderPath: 'productsUpload/b',
        status: 'failed',
        error: 'Failed to upload image to "products/b/0.webp"',
      },
      { folderPath: 'productsUpload/c', status: 'success' },
    ]);
  });

  it('returns an empty results array when no folders are discovered', async () => {
    mockedDiscoverEntryFolders.mockReturnValue([]);

    const results = await processAllFolders('productsUpload', deps);

    expect(results).toEqual([]);
    expect(mockedProcessFolder).not.toHaveBeenCalled();
  });
});