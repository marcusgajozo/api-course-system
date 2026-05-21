import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

dotenv.config({ path: resolve(process.cwd(), '.env.test'), override: true });

export default async function globalSetup() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  await client.connect();

  const schema = process.env.DATABASE_SCHEMA ?? 'test';
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

  await client.end();
}
