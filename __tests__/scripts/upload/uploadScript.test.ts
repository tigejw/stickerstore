import { buildStoragePath } from "../../../src/scripts/upload/imageStoragePathGenerator"

describe.only("buildStoragePath", () => {
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
