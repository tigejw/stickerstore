import { uploadImage } from '../../../src/scripts/upload/uploadImage';

describe('uploadImage', () => {
    function createMockSupabaseClient(overrides: { uploadError?: { message: string } | null; publicUrl?: string } = {}) {
        const uploadMock = jest.fn().mockResolvedValue({
            data: overrides.uploadError ? null : { path: 'some/path' },
            error: overrides.uploadError ?? null,
        });

        const getPublicUrlMock = jest.fn().mockReturnValue({
            data: { publicUrl: overrides.publicUrl ?? 'https://example.supabase.co/storage/v1/object/public/bucket/path.webp' },
        });

        return {
            storage: {
                from: jest.fn().mockReturnValue({
                    upload: uploadMock,
                    getPublicUrl: getPublicUrlMock,
                }),
            },
            __uploadMock: uploadMock,
        } as any;
    }
    test('uploads the buffer with upsert disabled and returns the public URL', async () => {
        const client = createMockSupabaseClient();
        const buffer = Buffer.from('fake image bytes');

        const url = await uploadImage({
            supabaseClient: client,
            bucket: 'product-images',
            path: 'products/spinosaurus/0.webp',
            buffer,
        });

        expect(client.storage.from).toHaveBeenCalledWith('product-images');
        expect(client.__uploadMock).toHaveBeenCalledWith(
            'products/spinosaurus/0.webp',
            buffer,
            { contentType: 'image/webp', upsert: false }
        );
        expect(url).toBe('https://example.supabase.co/storage/v1/object/public/bucket/path.webp');
    });

    test('throws a descriptive error when the upload fails (e.g. path already exists)', async () => {
        const client = createMockSupabaseClient({ uploadError: { message: 'The resource already exists' } });

        await expect(
            uploadImage({
                supabaseClient: client,
                bucket: 'product-images',
                path: 'products/spinosaurus/0.webp',
                buffer: Buffer.from('x'),
            })
        ).rejects.toThrow(/failed to upload image/i);
    });

    test('throws if no public URL is returned', async () => {
        const client = createMockSupabaseClient({ publicUrl: '' });

        await expect(
            uploadImage({
                supabaseClient: client,
                bucket: 'product-images',
                path: 'products/spinosaurus/0.webp',
                buffer: Buffer.from('x'),
            })
        ).rejects.toThrow(/failed to get public url/i);
    });
});