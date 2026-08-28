import { buildStoragePath } from "../../../src/scripts/upload/buildStoragePath"
import { validateImageFileSet } from "../../../src/scripts/upload/validateImageFileSet";


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