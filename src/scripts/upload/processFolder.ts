import fs from 'fs';
import path from 'path';
import type { Pool } from 'pg';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readManifest } from './readManifest';
import { validateManifestEntry, ManifestEntry } from './validateManifestEntry';
import { validateImageFileSet } from './validateImageFileSet';
import { convertToWebp } from './convertToWebp';
import { buildStoragePath } from './buildStoragePath';
import { uploadImage } from './uploadImage';
import { insertProductWithImages } from './insertProductWithImages';
import { insertBundleWithImages } from './insertBundleWithImages';
import { moveToSuccessfulUploads } from './moveToSuccessfulUploads';
import { ImageRecord } from './insertImageRows';

const manifestFileName = 'manifest.json';


export interface ProcessFolderDeps {
    pool: Pool;
    supabaseClient: SupabaseClient;
    bucket: string;
    successfulUploadsRoot: string;
}

export async function processFolder(folderPath: string, deps: ProcessFolderDeps): Promise<void> {
    const manifestPath = path.join(folderPath, manifestFileName);
    const rawManifest = readManifest(manifestPath);

    const fileNames = fs.readdirSync(folderPath).filter((name) => name !== manifestFileName);

    validateImageFileSet(fileNames);
    validateManifestEntry(rawManifest as ManifestEntry, fileNames);

    const entry = rawManifest as ManifestEntry;
    const images: ImageRecord[] = [];

    for (const fileName of fileNames) {
        const filePath = path.join(folderPath, fileName);
        const rawBuffer = fs.readFileSync(filePath);
        const webpBuffer = await convertToWebp(rawBuffer);

        const { path: storagePath, isThumbnail, displayOrder } = buildStoragePath({
            entityType: entry.type,
            slug: entry.slug,
            fileName,
        });

        const url = await uploadImage({
            supabaseClient: deps.supabaseClient,
            bucket: deps.bucket,
            path: storagePath,
            buffer: webpBuffer,
        });

        images.push({
            url,
            altText: entry.altText[fileName],
            isThumbnail,
            displayOrder,
        });
    }

    if (entry.type === 'product') {
        await insertProductWithImages({
            pool: deps.pool,
            product: {
                slug: entry.slug,
                name: entry.name,
                description: entry.description,
                price: entry.price,
            },
            images,
        });
    } else {
        await insertBundleWithImages({
            pool: deps.pool,
            bundle: {
                slug: entry.slug,
                name: entry.name,
                description: entry.description,
                price: entry.price,
            },
            images,
            productSlugs: entry.productSlugs ?? [],
        });
    }

    moveToSuccessfulUploads(folderPath, deps.successfulUploadsRoot);
}