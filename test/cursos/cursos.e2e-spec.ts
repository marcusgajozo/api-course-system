import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Server } from 'http';
import request from 'supertest';
import { Repository } from 'typeorm';

import { ErrorResponseDto } from '@/common/dtos/error-response.dto';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';

import { createTestApp } from '../utils/create-test-app';
import {
  beforeEachTestCurso,
  createCurso,
  cursoValido,
  routeCursoApi,
} from '../utils/cursos.util';
import { createTurma } from '../utils/turmas.util';

describe('(e2e) Cursos', () => {
  let app: INestApplication;
  let httpServer: Server;
  let cursoRepo: Repository<CursoEntity>;
  let turmaRepo: Repository<TurmaEntity>;

  beforeAll(async () => {
    const testApp = await createTestApp();

    app = testApp.app;
    httpServer = testApp.httpServer;
    cursoRepo = testApp.module.get(getRepositoryToken(CursoEntity));
    turmaRepo = testApp.module.get(getRepositoryToken(TurmaEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await beforeEachTestCurso(cursoRepo);
  });

  describe('POST /api/cursos', () => {
    it('deve criar um curso e retornar 201', async () => {
      const response = await request(httpServer)
        .post(routeCursoApi)
        .send(cursoValido)
        .expect(201);

      const body = response.body as ResponseDto<CursoEntity>;

      expect(body.data).toMatchObject(cursoValido);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('deve retornar 400 com contrato de erro para body inválido', async () => {
      const response = await request(httpServer)
        .post(routeCursoApi)
        .send({ titulo: 'Sem outros campos' })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeCursoApi);
    });

    it('deve retornar 400 para temas com valores inválidos', async () => {
      const cursoInvalido = { ...cursoValido, temas: ['INVALIDO'] };

      const response = await request(httpServer)
        .post(routeCursoApi)
        .send(cursoInvalido)
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeCursoApi);
    });
  });

  describe('GET /api/cursos', () => {
    it('deve retornar cursos com paginação', async () => {
      const response = await request(httpServer).get(routeCursoApi).expect(200);
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

  describe('GET /api/cursos/:id', () => {
    it('deve retornar um curso existente', async () => {
      const curso = await createCurso(cursoRepo);

      const response = await request(httpServer)
        .get(`/api/cursos/${curso.id}`)
        .expect(200);

      const body = response.body as ResponseDto<CursoEntity>;

      expect(body.data).toMatchObject(cursoValido);
    });

    it('deve retornar 404 para curso inexistente', async () => {
      const response = await request(httpServer)
        .get('/api/cursos/00000000-0000-0000-0000-000000000000')
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe('Curso não encontrado');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/cursos/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .get('/api/cursos/123')
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBe('Formatação de UUID inválida');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/cursos/123');
    });
  });

  describe('PATCH /api/cursos/:id', () => {
    it('deve atualizar um curso existente', async () => {
      const curso = await createCurso(cursoRepo);
      const updateData = { titulo: 'Curso atualizado' };

      const response = await request(httpServer)
        .patch(`/api/cursos/${curso.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ResponseDto<CursoEntity>;

      expect(body.data).toMatchObject({ ...cursoValido, ...updateData });
    });

    it('deve retornar 404 para curso inexistente', async () => {
      const response = await request(httpServer)
        .patch('/api/cursos/00000000-0000-0000-0000-000000000000')
        .send({ titulo: 'Teste' })
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe('Curso não encontrado');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/cursos/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .patch('/api/cursos/123')
        .send({ titulo: 'Teste' })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBe('Formatação de UUID inválida');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/cursos/123');
    });
  });

  describe('DELETE /api/cursos/:id', () => {
    it('deve deletar um curso existente e retornar 204 junto com turmas', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);
      const curso = turma.curso;

      await request(httpServer).delete(`/api/cursos/${curso.id}`).expect(204);

      const deletedCurso = await cursoRepo.findOneBy({ id: curso.id });
      const deletedTurmas = await turmaRepo.find({
        where: { curso: { id: curso.id } },
      });

      expect(deletedCurso).toBeNull();
      expect(deletedTurmas.length).toBe(0);
    });

    it('deve retornar 404 para curso inexistente', async () => {
      const response = await request(httpServer)
        .delete('/api/cursos/00000000-0000-0000-0000-000000000000')
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe('Curso não encontrado');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/cursos/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .delete('/api/cursos/123')
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBe('Formatação de UUID inválida');
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/cursos/123');
    });
  });
});
