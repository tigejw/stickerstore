import { validateManifestEntry, ManifestEntry } from "../../../src/scripts/upload/validateManifestEntry";

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