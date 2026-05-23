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
import { createCurso } from '../utils/cursos.util';
import {
  beforeEachTestTurma,
  createTurma,
  routeTurmaApi,
  turmaValido,
} from '../utils/turmas.util';

describe('(e2e) Turmas', () => {
  let app: INestApplication;
  let httpServer: Server;
  let turmaRepo: Repository<TurmaEntity>;
  let cursoRepo: Repository<CursoEntity>;

  beforeAll(async () => {
    const testApp = await createTestApp();

    app = testApp.app;
    httpServer = testApp.httpServer;
    turmaRepo = testApp.module.get(getRepositoryToken(TurmaEntity));
    cursoRepo = testApp.module.get(getRepositoryToken(CursoEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await beforeEachTestTurma(cursoRepo);
  });

  describe('POST /api/turmas', () => {
    it('deve criar um turma e retornar 201', async () => {
      const curso = await createCurso(cursoRepo);
      const turma = { ...turmaValido, cursoId: curso.id };

      const response = await request(httpServer)
        .post(routeTurmaApi)
        .send(turma)
        .expect(201);

      const body = response.body as ResponseDto<TurmaEntity>;

      expect(body.data).toMatchObject(turma);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('deve retornar 400 com contrato de erro para body inválido', async () => {
      const response = await request(httpServer)
        .post(routeTurmaApi)
        .send({ titulo: 'Sem outros campos' })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeTurmaApi);
    });

    it('deve retornar 400 quando a dataFim > dataInicio', async () => {
      const turma = {
        ...turmaValido,
        dataInicio: new Date('2026-01-02').toISOString(),
        dataFim: new Date('2026-01-01').toISOString(),
      };

      const response = await request(httpServer)
        .post(routeTurmaApi)
        .send(turma)
        .expect(400);

      const body = response.body as ErrorResponseDto;
      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toContain(
        'A data final deve ser maior que a data de início',
      );
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeTurmaApi);
    });

    it('deve retornar 404 para quando o curso não existir', async () => {
      const turma = { ...turmaValido };

      const response = await request(httpServer)
        .post(routeTurmaApi)
        .send(turma)
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeTurmaApi);
    });
  });

  describe('GET /api/turmas', () => {
    it('deve retornar turmas com paginação', async () => {
      const response = await request(httpServer).get(routeTurmaApi).expect(200);
      const body = response.body as PaginatedResponseDto<TurmaEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
    });

    it('deve retornar turmas com paginação usando query params', async () => {
      const query: PaginationQueryDto = { page: 2, limit: 20 };

      const response = await request(httpServer)
        .get(`/api/turmas?page=${query.page}&limit=${query.limit}`)
        .expect(200);
      const body = response.body as PaginatedResponseDto<TurmaEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(query.page);
      expect(body.meta.limit).toBe(query.limit);
    });

    it('deve retornar 400 para query params inválidos', async () => {
      const query = { page: -1, limit: 'abc' };

      const response = await request(httpServer)
        .get(`/api/turmas?page=${query.page}&limit=${query.limit}`)
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/turmas?page=-1&limit=abc');
    });
  });

  describe('GET /api/turmas/:id', () => {
    it('deve retornar um turma existente', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);

      const response = await request(httpServer)
        .get(`/api/turmas/${turma.id}`)
        .expect(200);

      const body = response.body as ResponseDto<TurmaEntity>;

      expect(body.data).toMatchObject({
        ...turmaValido,
        cursoId: turma.cursoId,
      });
    });

    it('deve retornar 404 para turma inexistente', async () => {
      const response = await request(httpServer)
        .get('/api/turmas/00000000-0000-0000-0000-000000000000')
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/turmas/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .get('/api/turmas/123')
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/turmas/123');
    });
  });

  describe('PATCH /api/turmas/:id', () => {
    it('deve atualizar uma turma existente', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);
      const updateData = { titulo: 'Turma atualizada' };

      const response = await request(httpServer)
        .patch(`/api/turmas/${turma.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ResponseDto<TurmaEntity>;

      expect(body.data).toMatchObject({
        ...turmaValido,
        ...updateData,
        cursoId: turma.cursoId,
      });
    });

    it('deve retornar 400 para dados com formatos inválido', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);

      const response = await request(httpServer)
        .patch(`/api/turmas/${turma.id}`)
        .send({ ...turma, titulo: 1 })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`/api/turmas/${turma.id}`);
    });

    it('deve retornar 404 para turma inexistente', async () => {
      const response = await request(httpServer)
        .patch('/api/turmas/00000000-0000-0000-0000-000000000000')
        .send({ titulo: 'Teste' })
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/turmas/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .patch('/api/turmas/123')
        .send({ titulo: 'Teste' })
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/turmas/123');
    });
  });

  describe('DELETE /api/turmas/:id', () => {
    it('deve deletar um turma existente e retornar 204', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);

      await request(httpServer).delete(`/api/turmas/${turma.id}`).expect(204);

      const turmaDeletado = await turmaRepo.findOneBy({ id: turma.id });
      expect(turmaDeletado).toBeNull();
    });

    it('deve retornar 404 para turma inexistente', async () => {
      const response = await request(httpServer)
        .delete('/api/turmas/00000000-0000-0000-0000-000000000000')
        .expect(404);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        '/api/turmas/00000000-0000-0000-0000-000000000000',
      );
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const response = await request(httpServer)
        .delete('/api/turmas/123')
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe('/api/turmas/123');
    });
  });
});
