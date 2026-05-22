import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';

interface CreateTestAppOptions {
  imports: Parameters<typeof Test.createTestingModule>[0]['imports'];
  entities: NonNullable<
    Parameters<typeof TypeOrmModule.forRoot>[0]
  >['entities'];
}

interface TestApp {
  app: INestApplication;
  httpServer: Server;
  module: TestingModule;
}

export async function createTestApp({
  imports,
  entities,
}: CreateTestAppOptions): Promise<TestApp> {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: process.env.DATABASE as 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? ''),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        schema: process.env.DATABASE_SCHEMA,
        entities,
        dropSchema: true,
        synchronize: true,
      }),
      ...(imports ?? []),
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  return {
    app,
    httpServer: app.getHttpServer() as Server,
    module,
  };
}
