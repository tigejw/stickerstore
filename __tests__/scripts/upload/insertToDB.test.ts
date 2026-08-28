import { insertProductWithImages } from '../../../src/scripts/upload/insertProductWithImages';
import { insertBundleWithImages } from '../../../src/scripts/upload/insertBundleWithImages';
import { ImageRecord } from '../../../src/scripts/upload/insertImageRows';
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

        test('inserts the product and its images inside a committed transaction', async () => {
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

        test('rolls back and releases the client if the product insert fails', async () => {
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

        test('rolls back and releases the client if the image insert fails', async () => {
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

        test('inserts the bundle, links its products, and inserts its images inside one transaction', async () => {
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

        test('rolls back if one of the productSlugs does not exist in the DB', async () => {
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

        test('rolls back if the bundle insert itself fails', async () => {
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
