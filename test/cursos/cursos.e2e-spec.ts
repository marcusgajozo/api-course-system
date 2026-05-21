import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import request from 'supertest';
import { Repository } from 'typeorm';

import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
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
    app.useGlobalFilters(new GlobalExceptionFilter());
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

    it('deve retornar 400 com contrato de erro para body inválido', async () => {
      const response = await request(httpServer)
        .post('/api/cursos')
        .send({ titulo: 'Sem outros campos' })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/cursos');
    });
  });

  describe('GET /api/cursos', () => {
    it('deve retornar cursos com paginação', async () => {
      const response = await request(httpServer).get('/api/cursos').expect(200);
      const body = response.body as PaginatedResponseDto<CursoEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
    });

    it('deve retornar cursos com paginação usando query params', async () => {
      const query: PaginationQueryDto = { page: 2, limit: 20 };

      const response = await request(httpServer)
        .get(`/api/cursos?page=${query.page}&limit=${query.limit}`)
        .expect(200);
      const body = response.body as PaginatedResponseDto<CursoEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(query.page);
      expect(body.meta.limit).toBe(query.limit);
    });

    it('deve retornar 400 para query params inválidos', async () => {
      const query = { page: -1, limit: 'abc' };

      const response = await request(httpServer)
        .get(`/api/cursos?page=${query.page}&limit=${query.limit}`)
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/cursos?page=-1&limit=abc');
    });
  });
});
