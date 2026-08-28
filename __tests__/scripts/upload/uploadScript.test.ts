import sharp from "sharp"
import fs from 'fs';
import path from 'path';
import { buildStoragePath } from "../../../src/scripts/upload/buildStoragePath"
import { validateImageFileSet } from "../../../src/scripts/upload/validateImageFileSet";
import { validateManifestEntry, ManifestEntry } from "../../../src/scripts/upload/validateManifestEntry";
import { convertToWebp } from '../../../src/scripts/upload/convertToWebp';
import { readManifest } from '../../../src/scripts/upload/readManifest';
import { moveToSuccessfulUploads } from '../../../src/scripts/upload/moveToSuccessfulUploads';
import { insertProductWithImages } from '../../../src/scripts/upload/insertProductWithImages';
import { insertBundleWithImages } from '../../../src/scripts/upload/insertBundleWithImages';
import { ImageRecord } from '../../../src/scripts/upload/insertImageRows';

jest.mock('fs');

describe("buildStoragePath", () => {
    test("builds a path for non-thumbnail product images using slug and fileName with a .webp extension", () => {
        const result = buildStoragePath({
            entityType: 'product',
            slug: 'spinosaurus',
            fileName: '1.PNG',
        });
        expect(result).toEqual({ path: "products/spinosaurus/1.webp", isThumbnail: false, displayOrder: 1 });
    });

    test("builds a path for thumbnail product images using slug and fileName with a .webp extension", () => {
        const result = buildStoragePath({
            entityType: 'product',
            slug: 'spinosaurus',
            fileName: 'thumbnail.PNG',
        });
        expect(result).toEqual({ path: "products/spinosaurus/thumbnail.webp", isThumbnail: true, displayOrder: null });
    });

    test("works the same way for bundles", () => {
        const thumb = buildStoragePath({
            entityType: 'bundle',
            slug: 'spinosaurus',
            fileName: 'thumbnail.PNG',
        });
        expect(thumb).toEqual({ path: "bundles/spinosaurus/thumbnail.webp", isThumbnail: true, displayOrder: null });

        const numbered = buildStoragePath({
            entityType: 'bundle',
            slug: 'spinosaurus',
            fileName: '3.PNG',
        });
        expect(numbered).toEqual({ path: "bundles/spinosaurus/3.webp", isThumbnail: false, displayOrder: 3 });
    });

    test("errors when the file name doesn't match thumbnail or a plain number", () => {
        expect(() => buildStoragePath({
            entityType: 'bundle',
            slug: 'spinosaurus',
            fileName: 'thumpnail.PNG',
        })).toThrow(/invalid file name/i);
    });

    test("errors when the extension is unsupported", () => {
        expect(() => buildStoragePath({
            entityType: 'bundle',
            slug: 'spinosaurus',
            fileName: 'thumbnail.gif',
        })).toThrow(/unsupported/i);
    });

    test("errors when slug is empty", () => {
        expect(() => buildStoragePath({
            entityType: 'bundle',
            slug: '',
            fileName: 'thumbnail.PNG',
        })).toThrow(/slug/i);
    });

    test("errors when entityType is not bundle or product", () => {
        expect(() => buildStoragePath({
            entityType: 'bunple' as any,
            slug: 'spinosaurus',
            fileName: 'thumbnail.PNG',
        })).toThrow(/entityType/i);
    });
});

describe("validateImageFileSet", () => {
    test('accepts a valid set: one thumbnail plus a gapless 0..n sequence', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', '0.jpg', '1.png', '2.webp'])
        ).not.toThrow();
    });
    test('accepts the minimal valid set: thumbnail plus a single image', () => {
        expect(() => validateImageFileSet(['thumbnail.png', '0.png'])).not.toThrow();
    });

    test('is order-independent in the input array', () => {
        expect(() =>
            validateImageFileSet(['2.png', 'thumbnail.png', '0.png', '1.png'])
        ).not.toThrow();
    });

    test('throws when the file list is empty', () => {
        expect(() => validateImageFileSet([])).toThrow(/no image files/i);
    });

    test('throws when there is no thumbnail', () => {
        expect(() => validateImageFileSet(['0.png', '1.png'])).toThrow(/no thumbnail/i);
    });

    test('throws when there are multiple thumbnails', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', 'thumbnail.jpg', '0.png'])
        ).toThrow(/multiple thumbnail/i);
    });

    test('throws when there are no non-thumbnail images', () => {
        expect(() => validateImageFileSet(['thumbnail.png'])).toThrow(/no non-thumbnail/i);
    });

    test('throws on duplicate display orders', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', '0.png', '1.png', '1.jpg'])
        ).toThrow(/duplicate display order/i);
    });

    test('throws on a gap in display orders', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', '0.png', '2.png'])
        ).toThrow(/gapless sequence/i);
    });

    test('throws when display orders do not start at 0', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', '1.png', '2.png'])
        ).toThrow(/gapless sequence/i);
    });

    test('propagates individual filename errors from parseImageFileName', () => {
        expect(() =>
            validateImageFileSet(['thumbnail.png', 'front-view.png'])
        ).toThrow(/invalid file name/i);

        expect(() =>
            validateImageFileSet(['thumbnail.png', '0.gif'])
        ).toThrow(/unsupported/i);
    });
});

describe('validateManifestEntry', () => {
    function baseProduct(overrides: Partial<ManifestEntry> = {}): ManifestEntry {
        return {
            type: 'product',
            slug: 'spinosaurus',
            name: 'Spinosaurus Sticker',
            description: 'A fearsome sticker',
            price: 350,
            imagesDir: './uploads/spinosaurus',
            altText: { 'thumbnail.png': 'Thumbnail', '0.png': 'Front view' },
            ...overrides,
        };
    }

    const files = ['thumbnail.png', '0.png'];

    test('accepts a well-formed product entry', () => {
        expect(() => validateManifestEntry(baseProduct(), files)).not.toThrow();
    });

    test('accepts a well-formed bundle entry', () => {
        const bundle = baseProduct({ type: 'bundle', productSlugs: ['spinosaurus', 'trex'] });
        expect(() => validateManifestEntry(bundle, files)).not.toThrow();
    });

    test('throws on an invalid type', () => {
        expect(() =>
            validateManifestEntry(baseProduct({ type: 'bunple' as any }), files)
        ).toThrow(/invalid type/i);
    });

    test('throws when slug is empty', () => {
        expect(() => validateManifestEntry(baseProduct({ slug: '' }), files)).toThrow(/slug/i);
    });

    test('throws when name is missing', () => {
        expect(() => validateManifestEntry(baseProduct({ name: '' }), files)).toThrow(/name/i);
    });

    test('throws when description is missing', () => {
        expect(() => validateManifestEntry(baseProduct({ description: '' }), files)).toThrow(/description/i);
    });

    test('throws when price is not a positive integer', () => {
        expect(() => validateManifestEntry(baseProduct({ price: 0 }), files)).toThrow(/price/i);
        expect(() => validateManifestEntry(baseProduct({ price: -5 }), files)).toThrow(/price/i);
        expect(() => validateManifestEntry(baseProduct({ price: 3.5 }), files)).toThrow(/price/i);
    });

    test('throws when a bundle has no productSlugs', () => {
        const bundle = baseProduct({ type: 'bundle', productSlugs: [] });
        expect(() => validateManifestEntry(bundle, files)).toThrow(/productSlugs/i);
    });

    test('throws when a bundle productSlugs entry is empty', () => {
        const bundle = baseProduct({ type: 'bundle', productSlugs: ['spinosaurus', ''] });
        expect(() => validateManifestEntry(bundle, files)).toThrow(/productSlugs\[1\]/i);
    });

    test('throws when a file on disk has no altText entry', () => {
        const entry = baseProduct({ altText: { 'thumbnail.png': 'Thumbnail' } }); // missing 0.png
        expect(() => validateManifestEntry(entry, files)).toThrow(/missing alttext/i);
    });

    test('throws when altText references a file not found in imagesDir', () => {
        const entry = baseProduct({
            altText: { 'thumbnail.png': 'Thumbnail', '0.png': 'Front', '1.png': 'Extra' },
        });
        expect(() => validateManifestEntry(entry, files)).toThrow(/references file/i);
    });
});

describe('convert to webp', () => {
    async function makeTestImage(width: number, height: number): Promise<Buffer> {
        return sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: 200, g: 50, b: 50 },
            },
        })
            .png()
            .toBuffer();
    }


    test('converts a png buffer to webp format', async () => {
        const input = await makeTestImage(100, 100);
        const output = await convertToWebp(input);
        const metadata = await sharp(output).metadata();

        expect(metadata.format).toBe('webp');
    });

    test('leaves small images at their original dimensions', async () => {
        const input = await makeTestImage(500, 300);
        const output = await convertToWebp(input);
        const metadata = await sharp(output).metadata();

        expect(metadata.width).toBe(500);
        expect(metadata.height).toBe(300);
    });

    test('downscales an image larger than 1600px on its longest side, preserving aspect ratio', async () => {
        const input = await makeTestImage(3200, 1600); // 2:1 ratio, width is the longest side
        const output = await convertToWebp(input);
        const metadata = await sharp(output).metadata();

        expect(metadata.width).toBe(1600);
        expect(metadata.height).toBe(800);
    });

    test('never upscales an image smaller than the cap', async () => {
        const input = await makeTestImage(200, 100);
        const output = await convertToWebp(input);
        const metadata = await sharp(output).metadata();

        expect(metadata.width).toBe(200);
        expect(metadata.height).toBe(100);
    });

    test('throws on an empty buffer', async () => {
        await expect(convertToWebp(Buffer.alloc(0))).rejects.toThrow(/non-empty/i);
    });

    test('throws on invalid image data', async () => {
        const garbage = Buffer.from('this is not an image');
        await expect(convertToWebp(garbage)).rejects.toThrow();
    });
});


const manifestMockedFs = fs as jest.Mocked<typeof fs>;

describe('readManifest', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('reads and parses a valid manifest file', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify({ slug: 'spinosaurus', price: 350 }));

        const manifest = readManifest('./uploads/spinosaurus/manifest.json');

        expect(manifest).toEqual({ slug: 'spinosaurus', price: 350 });
        expect(manifestMockedFs.readFileSync).toHaveBeenCalledWith('./uploads/spinosaurus/manifest.json', 'utf-8');
    });

    test('throws a descriptive error if the file cannot be read', () => {
        manifestMockedFs.readFileSync.mockImplementation(() => {
            throw new Error('ENOENT: no such file');
        });

        expect(() => readManifest('./missing/manifest.json')).toThrow(/could not read manifest file/i);
    });

    test('throws a descriptive error if the file is not valid JSON', () => {
        manifestMockedFs.readFileSync.mockReturnValue('{ not: valid json');

        expect(() => readManifest('./bad/manifest.json')).toThrow(/not valid json/i);
    });

    test('throws if the parsed JSON is an array', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify([{ slug: 'a' }]));

        expect(() => readManifest('./array/manifest.json')).toThrow(/must be a json object/i);
    });

    test('throws if the parsed JSON is a primitive', () => {
        manifestMockedFs.readFileSync.mockReturnValue(JSON.stringify('just a string'));

        expect(() => readManifest('./primitive/manifest.json')).toThrow(/must be a json object/i);
    });
});


const uploadsFolderMockedFs = fs as jest.Mocked<typeof fs>;

describe('moveToSuccessfulUploads', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('moves the folder into successfulUploads when no name collision exists', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false); // neither destination nor root exists yet
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.renameSync).toHaveBeenCalledWith(
            'productsUpload/spinosaurus',
            path.join('successfulUploads', 'spinosaurus')
        );
    });

    test('creates the successfulUploads root directory if it does not exist yet', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false);
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.mkdirSync).toHaveBeenCalledWith('successfulUploads', { recursive: true });
    });

    test('does not try to create the root directory if it already exists', () => {
        uploadsFolderMockedFs.existsSync.mockImplementation((p) => p.toString() === 'successfulUploads');
        uploadsFolderMockedFs.renameSync.mockReturnValue(undefined);

        moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads');

        expect(uploadsFolderMockedFs.mkdirSync).not.toHaveBeenCalled();
    });

    test('throws if a folder with the same name already exists in successfulUploads', () => {
        uploadsFolderMockedFs.existsSync.mockImplementation((p) =>
            p.toString() === path.join('successfulUploads', 'spinosaurus')
        );

        expect(() =>
            moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads')
        ).toThrow(/already exists/i);

        expect(uploadsFolderMockedFs.renameSync).not.toHaveBeenCalled();
    });

    test('throws a descriptive error if the rename operation itself fails', () => {
        uploadsFolderMockedFs.existsSync.mockReturnValue(false);
        uploadsFolderMockedFs.mkdirSync.mockReturnValue(undefined as any);
        uploadsFolderMockedFs.renameSync.mockImplementation(() => {
            throw new Error('EACCES: permission denied');
        });

        expect(() =>
            moveToSuccessfulUploads('productsUpload/spinosaurus', 'successfulUploads')
        ).toThrow(/failed to move/i);
    });
});

describe("insertToDB", () => {
    function createMockClient() {
        return {
            query: jest.fn(),
            release: jest.fn(),
        };
    }

    function createMockPool(client: ReturnType<typeof createMockClient>) {
        return { connect: jest.fn().mockResolvedValue(client) } as any;
    }


    describe("product", () => {
        const product = { slug: 'spinosaurus', name: 'Spinosaurus', description: 'fish lov3r', price: 350 };
        const images: ImageRecord[] = [
            { url: 'https://supabasestorage/thumbnail.webp', altText: 'Thumbnail', isThumbnail: true, displayOrder: null },
            { url: 'https://supabasestorage/0.webp', altText: 'Front', isThumbnail: false, displayOrder: 0 },
        ];


        afterEach(() => jest.resetAllMocks());

        it('inserts the product and its images inside a committed transaction', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ product_id: 42 }] }) // INSERT products
                .mockResolvedValueOnce(undefined) // INSERT product_images
                .mockResolvedValueOnce(undefined); // COMMIT

            const pool = createMockPool(client);

            const productId = await insertProductWithImages({ pool, product, images });

            expect(productId).toBe(42);
            expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            expect(client.query).toHaveBeenNthCalledWith(4, 'COMMIT');
            expect(client.release).toHaveBeenCalled();
        });

        it('rolls back and releases the client if the product insert fails', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(new Error('duplicate key value violates unique constraint')) // INSERT products
                .mockResolvedValueOnce(undefined); // ROLLBACK

            const pool = createMockPool(client);

            await expect(insertProductWithImages({ pool, product, images })).rejects.toThrow(
                /failed to insert product "spinosaurus"/i
            );

            expect(client.query).toHaveBeenCalledWith('ROLLBACK');
            expect(client.release).toHaveBeenCalled();
        });

        it('rolls back and releases the client if the image insert fails', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ product_id: 42 }] }) // INSERT products
                .mockRejectedValueOnce(new Error('null value in column "alt_text"')) // INSERT product_images
                .mockResolvedValueOnce(undefined); // ROLLBACK

            const pool = createMockPool(client);

            await expect(insertProductWithImages({ pool, product, images })).rejects.toThrow(
                /failed to insert product "spinosaurus"/i
            );

            expect(client.query).toHaveBeenCalledWith('ROLLBACK');
            expect(client.release).toHaveBeenCalled();
        });
    })
    describe("bundle", () => {
        const bundle = { slug: 'summer-pack', name: 'Summer Pack', description: 'A few stickers', price: 900 };
        const images: ImageRecord[] = [
            { url: 'https://x/thumbnail.webp', altText: 'Thumbnail', isThumbnail: true, displayOrder: null },
        ];
        const productSlugs = ['spinosaurus', 'trex'];

        afterEach(() => jest.resetAllMocks());

        it('inserts the bundle, links its products, and inserts its images inside one transaction', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ bundle_id: 7 }] }) // INSERT bundles
                .mockResolvedValueOnce({
                    rows: [
                        { product_id: 1, slug: 'spinosaurus' },
                        { product_id: 2, slug: 'trex' },
                    ],
                }) // SELECT products
                .mockResolvedValueOnce(undefined) // INSERT bundle_products
                .mockResolvedValueOnce(undefined) // INSERT bundle_images
                .mockResolvedValueOnce(undefined); // COMMIT

            const pool = createMockPool(client);

            const bundleId = await insertBundleWithImages({ pool, bundle, images, productSlugs });

            expect(bundleId).toBe(7);
            expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
            expect(client.query).toHaveBeenNthCalledWith(6, 'COMMIT');
            expect(client.release).toHaveBeenCalled();
        });

        it('rolls back if one of the productSlugs does not exist in the DB', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ bundle_id: 7 }] }) // INSERT bundles
                .mockResolvedValueOnce({ rows: [{ product_id: 1, slug: 'spinosaurus' }] }) // SELECT products (trex missing)
                .mockResolvedValueOnce(undefined); // ROLLBACK

            const pool = createMockPool(client);

            await expect(
                insertBundleWithImages({ pool, bundle, images, productSlugs })
            ).rejects.toThrow(/unknown product slug\(s\): trex/i);

            expect(client.query).toHaveBeenCalledWith('ROLLBACK');
            expect(client.release).toHaveBeenCalled();
        });

        it('rolls back if the bundle insert itself fails', async () => {
            const client = createMockClient();
            client.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(new Error('duplicate key value violates unique constraint')) // INSERT bundles
                .mockResolvedValueOnce(undefined); // ROLLBACK

            const pool = createMockPool(client);

            await expect(
                insertBundleWithImages({ pool, bundle, images, productSlugs })
            ).rejects.toThrow(/failed to insert bundle "summer-pack"/i);

            expect(client.query).toHaveBeenCalledWith('ROLLBACK');
            expect(client.release).toHaveBeenCalled();
        });
    })
})