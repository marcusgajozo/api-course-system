import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { CursosModule } from '@/modules/cursos/cursos.module';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';
import { TurmasModule } from '@/modules/turmas/turmas.module';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';
import { UsuariosModule } from '@/modules/usuarios/usuarios.module';

interface TestApp {
  app: INestApplication;
  httpServer: Server;
  module: TestingModule;
}

export async function createTestApp(): Promise<TestApp> {
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
        entities: [TurmaEntity, CursoEntity, UsuarioEntity],
        dropSchema: true,
        synchronize: true,
      }),
      TurmasModule,
      CursosModule,
      UsuariosModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  return {
    app,
    httpServer: app.getHttpServer() as Server,
    module,
  };
}
