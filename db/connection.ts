const ENV = process.env.NODE_ENV || 'development';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("No PGDATABASE configured");
}

<<<<<<< HEAD
export default new Pool({
  host: process.env.PGHOST || "/var/run/postgresql",
});
=======
export default new Pool();
>>>>>>> 7c87b939ceb243107ba8e0770b86372745c483bc
