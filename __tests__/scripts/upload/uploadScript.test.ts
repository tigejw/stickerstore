import sharp from "sharp"
import fs from 'fs';
import { buildStoragePath } from "../../../src/scripts/upload/buildStoragePath"
import { validateImageFileSet } from "../../../src/scripts/upload/validateImageFileSet";
import { validateManifestEntry, ManifestEntry } from "../../../src/scripts/upload/validateManifestEntry";
import { convertToWebp } from '../../../src/scripts/upload/convertToWebp';
import { readManifest } from '../../../src/scripts/upload/readManifest';

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

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('readManifest', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('reads and parses a valid manifest file', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ slug: 'spinosaurus', price: 350 }));

    const manifest = readManifest('./uploads/spinosaurus/manifest.json');

    expect(manifest).toEqual({ slug: 'spinosaurus', price: 350 });
    expect(mockedFs.readFileSync).toHaveBeenCalledWith('./uploads/spinosaurus/manifest.json', 'utf-8');
  });

  test('throws a descriptive error if the file cannot be read', () => {
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file');
    });

    expect(() => readManifest('./missing/manifest.json')).toThrow(/could not read manifest file/i);
  });

  test('throws a descriptive error if the file is not valid JSON', () => {
    mockedFs.readFileSync.mockReturnValue('{ not: valid json');

    expect(() => readManifest('./bad/manifest.json')).toThrow(/not valid json/i);
  });

  test('throws if the parsed JSON is an array', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify([{ slug: 'a' }]));

    expect(() => readManifest('./array/manifest.json')).toThrow(/must be a json object/i);
  });

  test('throws if the parsed JSON is a primitive', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify('just a string'));

    expect(() => readManifest('./primitive/manifest.json')).toThrow(/must be a json object/i);
  });
});