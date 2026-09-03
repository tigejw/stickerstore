import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  const ENV = process.env.NODE_ENV || 'development';
  dotenv.config({
    path: `${__dirname}/../.env.${ENV}`,
  });
}

if (!process.env.DATABASE_URL && !process.env.PGDATABASE) {
  throw new Error("DATABASE_URL environment variable or PGDATABASE is missing!");
}


const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
  max: 2,                    
  idleTimeoutMillis: 30000,   
  connectionTimeoutMillis: 5000,
};

export default new Pool(config);