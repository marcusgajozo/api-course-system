import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('appConfig', () => ({
  database: {
    type: process.env.DATABASE,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || ''),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
}));
