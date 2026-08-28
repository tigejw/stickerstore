import * as fs from 'fs';
import { processFolder } from '../../../src/scripts/upload/processFolder';
import { readManifest } from '../../../src/scripts/upload/readManifest';
import { validateManifestEntry } from '../../../src/scripts/upload/validateManifestEntry';
import { validateImageFileSet } from '../../../src/scripts/upload/validateImageFileSet';
import { convertToWebp } from '../../../src/scripts/upload/convertToWebp';
import { buildStoragePath } from '../../../src/scripts/upload/buildStoragePath';
import { uploadImage } from '../../../src/scripts/upload/uploadImage';
import { insertProductWithImages } from '../../../src/scripts/upload/insertProductWithImages';
import { insertBundleWithImages } from '../../../src/scripts/upload/insertBundleWithImages';
import { moveToSuccessfulUploads } from '../../../src/scripts/upload/moveToSuccessfulUploads';

jest.mock('fs');
jest.mock('../../../src/scripts/upload/readManifest');
jest.mock('../../../src/scripts/upload/validateManifestEntry');
jest.mock('../../../src/scripts/upload/validateImageFileSet');
jest.mock('../../../src/scripts/upload/convertToWebp');
jest.mock('../../../src/scripts/upload/buildStoragePath');
jest.mock('../../../src/scripts/upload/uploadImage');
jest.mock('../../../src/scripts/upload/insertProductWithImages');
jest.mock('../../../src/scripts/upload/insertBundleWithImages');
jest.mock('../../../src/scripts/upload/moveToSuccessfulUploads');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedReadManifest = readManifest as jest.Mock;
const mockedValidateManifestEntry = validateManifestEntry as jest.Mock;
const mockedValidateImageFileSet = validateImageFileSet as jest.Mock;
const mockedConvertToWebp = convertToWebp as jest.Mock;
const mockedBuildStoragePath = buildStoragePath as jest.Mock;
const mockedUploadImage = uploadImage as jest.Mock;
const mockedInsertProductWithImages = insertProductWithImages as jest.Mock;
const mockedInsertBundleWithImages = insertBundleWithImages as jest.Mock;
const mockedMoveToSuccessfulUploads = moveToSuccessfulUploads as jest.Mock;

const deps = {
  pool: {} as any,
  supabaseClient: {} as any,
  bucket: 'product-images',
  successfulUploadsRoot: 'successfulUploads',
};

const productEntry = {
  type: 'product',
  slug: 'spinosaurus',
  name: 'Spinosaurus',
  description: 'Big lizard',
  price: 350,
  altText: { 'thumbnail.png': 'Thumbnail', '0.png': 'Front view' },
};

describe('processFolder', () => {
  beforeEach(() => {
    mockedFs.readdirSync.mockReturnValue(['manifest.json', 'thumbnail.png', '0.png'] as any);
    mockedFs.readFileSync.mockReturnValue(Buffer.from('fake bytes'));
    mockedReadManifest.mockReturnValue(productEntry);
    mockedValidateImageFileSet.mockReturnValue(undefined);
    mockedValidateManifestEntry.mockReturnValue(undefined);
    mockedConvertToWebp.mockResolvedValue(Buffer.from('webp bytes'));
    mockedBuildStoragePath.mockImplementation(({ fileName }) =>
      fileName === 'thumbnail.png'
        ? { path: 'products/spinosaurus/thumbnail.webp', isThumbnail: true, displayOrder: null }
        : { path: 'products/spinosaurus/0.webp', isThumbnail: false, displayOrder: 0 }
    );
    mockedUploadImage.mockResolvedValue('https://supabasestorage/uploaded.webp');
    mockedInsertProductWithImages.mockResolvedValue(1);
    mockedInsertBundleWithImages.mockResolvedValue(1);
    mockedMoveToSuccessfulUploads.mockReturnValue(undefined);
  });

  afterEach(() => jest.resetAllMocks());

  test('processes a product folder end-to-end: validate, convert, upload, insert, move', async () => {
    await processFolder('productsUpload/spinosaurus', deps);

    expect(mockedReadManifest).toHaveBeenCalledWith('productsUpload/spinosaurus/manifest.json');
    expect(mockedValidateImageFileSet).toHaveBeenCalledWith(['thumbnail.png', '0.png']);
    expect(mockedValidateManifestEntry).toHaveBeenCalledWith(productEntry, ['thumbnail.png', '0.png']);
    expect(mockedConvertToWebp).toHaveBeenCalledTimes(2);
    expect(mockedUploadImage).toHaveBeenCalledTimes(2);
    expect(mockedInsertProductWithImages).toHaveBeenCalledWith(
      expect.objectContaining({
        product: { slug: 'spinosaurus', name: 'Spinosaurus', description: 'Big lizard', price: 350 },
        images: expect.arrayContaining([
          expect.objectContaining({ altText: 'Thumbnail', isThumbnail: true, displayOrder: null }),
          expect.objectContaining({ altText: 'Front view', isThumbnail: false, displayOrder: 0 }),
        ]),
      })
    );
    expect(mockedInsertBundleWithImages).not.toHaveBeenCalled();
    expect(mockedMoveToSuccessfulUploads).toHaveBeenCalledWith(
      'productsUpload/spinosaurus',
      'successfulUploads'
    );
  });

  test('calls insertBundleWithImages instead, for a bundle entry', async () => {
    const bundleEntry = { ...productEntry, type: 'bundle', productSlugs: ['spinosaurus', 'trex'] };
    mockedReadManifest.mockReturnValue(bundleEntry);

    await processFolder('productsUpload/summer-pack', deps);

    expect(mockedInsertBundleWithImages).toHaveBeenCalledWith(
      expect.objectContaining({ productSlugs: ['spinosaurus', 'trex'] })
    );
    expect(mockedInsertProductWithImages).not.toHaveBeenCalled();
  });

  test('does not move the folder if validation fails', async () => {
    mockedValidateManifestEntry.mockImplementation(() => {
      throw new Error('Missing altText for file(s): 0.png');
    });

    await expect(processFolder('productsUpload/spinosaurus', deps)).rejects.toThrow(/missing alttext/i);
    expect(mockedMoveToSuccessfulUploads).not.toHaveBeenCalled();
    expect(mockedUploadImage).not.toHaveBeenCalled();
  });

  test('does not move the folder if the DB insert fails', async () => {
    mockedInsertProductWithImages.mockRejectedValue(new Error('Failed to insert product'));

    await expect(processFolder('productsUpload/spinosaurus', deps)).rejects.toThrow(/failed to insert product/i);
    expect(mockedMoveToSuccessfulUploads).not.toHaveBeenCalled();
  });

  test('does not attempt DB insert if an image upload fails', async () => {
    mockedUploadImage.mockRejectedValueOnce(new Error('Failed to upload image'));

    await expect(processFolder('productsUpload/spinosaurus', deps)).rejects.toThrow(/failed to upload image/i);
    expect(mockedInsertProductWithImages).not.toHaveBeenCalled();
    expect(mockedMoveToSuccessfulUploads).not.toHaveBeenCalled();
  });
});