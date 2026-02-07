import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://nandd:nandd@localhost:5434/nandd';

const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool, { schema });
export * from './schema';
