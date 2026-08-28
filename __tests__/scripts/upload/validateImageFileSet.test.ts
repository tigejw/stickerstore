import { validateImageFileSet } from "../../../src/scripts/upload/validateImageFileSet";

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