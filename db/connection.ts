const ENV = process.env.NODE_ENV || 'development';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

export default new Pool({
  host: process.env.PGHOST || "/var/run/postgresql",
});