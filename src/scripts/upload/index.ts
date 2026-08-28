import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
import path from 'path';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { processAllFolders, FolderResult } from './processAllFolders';

const bucket = 'stickerstore-images';
const inputPath = path.join(process.cwd(), '__productsUpload');
const successfulUploadsPath = path.join(process.cwd(), '__successfulUploads');

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function printSummary(results: FolderResult[]): void {
    const successes = results.filter((r) => r.status === 'success');
    const failures = results.filter((r) => r.status === 'failed');

    console.log(`\nProcessed ${results.length} folder(s): ${successes.length} succeeded, ${failures.length} failed.\n`);

    if (successes.length > 0) {
        console.log('Succeeded:');
        successes.forEach((r) => console.log(`  ✓ ${r.folderPath}`));
    }

    if (failures.length > 0) {
        console.log('\nFailed:');
        failures.forEach((r) => console.log(`  ✗ ${r.folderPath}\n    ${r.error}`));
    }
}

async function main(): Promise<void> {
    const databaseUrl = requireEnv('DATABASE_URL');
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
    });

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    try {
        const results = await processAllFolders(inputPath, {
            pool,
            supabaseClient,
            bucket: bucket,
            successfulUploadsRoot: successfulUploadsPath,
        });

        printSummary(results);

        const anyFailed = results.some((r) => r.status === 'failed');
        process.exitCode = anyFailed ? 1 : 0;
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Fatal error:', (err as Error).message);
    process.exitCode = 1;
});