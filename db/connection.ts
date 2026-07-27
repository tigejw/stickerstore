const ENV = process.env.NODE_ENV || 'development';
import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}


const config: PoolConfig = {};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false }; // Supabase requires SSL
  config.max = 2;
} else {
  config.host = process.env.PGHOST || "/var/run/postgresql";
}

export default new Pool(config);