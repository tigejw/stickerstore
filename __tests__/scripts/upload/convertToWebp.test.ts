import sharp from "sharp"
import { convertToWebp } from '../../../src/scripts/upload/convertToWebp';

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