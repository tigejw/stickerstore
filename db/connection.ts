import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

export default new Pool();