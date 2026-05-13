import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;