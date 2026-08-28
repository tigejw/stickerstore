import sharp from 'sharp';

const maxDimension = 1600;
const webpQuality = 80;

export async function convertToWebp(input: Buffer): Promise<Buffer> {
  if (!Buffer.isBuffer(input) || input.length === 0) {
    throw new Error('input must be a non-empty Buffer');
  }

  return sharp(input)
    .resize(maxDimension, maxDimension, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality })
    .toBuffer();
}