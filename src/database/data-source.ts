import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: process.env.DATABASE as 'postgres',
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || ''),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['src/**/*.entity{.ts}'],
  migrations: ['src/database/migrations/*{.ts}'],
  synchronize: false,
});
