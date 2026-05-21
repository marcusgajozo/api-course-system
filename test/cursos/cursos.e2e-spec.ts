import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import request from 'supertest';
import { Repository } from 'typeorm';

import { ResponseDto } from '@/common/dtos/response.dto';
import { CursosModule } from '@/modules/cursos/cursos.module';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TemasEnum } from '@/modules/cursos/enums/temas.enum';

describe('(e2e) Cursos', () => {
  let app: INestApplication;
  let httpServer: Server;
  let repo: Repository<CursoEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: process.env.DATABASE as 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT ?? ''),
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          schema: process.env.DATABASE_SCHEMA,
          entities: [CursoEntity],
          synchronize: true,
        }),
        CursosModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    httpServer = app.getHttpServer() as Server;
    repo = module.get(getRepositoryToken(CursoEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repo.query('TRUNCATE TABLE cursos RESTART IDENTITY CASCADE');
  });

  const cursoValido = {
    titulo: 'Curso de NestJS',
    descricao: 'Aprenda NestJS do zero',
    temas: [TemasEnum.INOVACAO],
    urlImagem: 'http://example.com/nestjs.png',
  };

  describe('POST /api/cursos', () => {
    it('deve criar um curso e retornar 201', async () => {
      const response = await request(httpServer)
        .post('/api/cursos')
        .send(cursoValido)
        .expect(201);

      const body = response.body as ResponseDto<CursoEntity>;

      expect(body.data).toMatchObject(cursoValido);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('deve retornar 400 para body inválido', async () => {
      await request(httpServer)
        .post('/api/cursos')
        .send({ titulo: 'Sem outros campos' })
        .expect(400);
    });
  });
});
