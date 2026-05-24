import { faker } from '@faker-js/faker';
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
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';
import { CancelarMatriculaDto } from '@/modules/usuarios/dtos/cancelar-matricula.dto';
import { MatricularDto } from '@/modules/usuarios/dtos/matricular.dto';
import { UpdateUsuarioDto } from '@/modules/usuarios/dtos/update-usuario.dto';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { createTestApp } from '../utils/create-test-app';
import { createTurma } from '../utils/turmas.util';
import {
  beforeEachTestUsuario,
  createUsuario,
  routeUsuarioApi,
  usuarioValido,
} from '../utils/usuarios.util';

describe('(e2e) Usuários', () => {
  let app: INestApplication;
  let httpServer: Server;
  let turmaRepo: Repository<TurmaEntity>;
  let cursoRepo: Repository<CursoEntity>;
  let usuarioRepo: Repository<UsuarioEntity>;

  beforeAll(async () => {
    const testApp = await createTestApp();

    app = testApp.app;
    httpServer = testApp.httpServer;
    turmaRepo = testApp.module.get(getRepositoryToken(TurmaEntity));
    cursoRepo = testApp.module.get(getRepositoryToken(CursoEntity));
    usuarioRepo = testApp.module.get(getRepositoryToken(UsuarioEntity));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await beforeEachTestUsuario(usuarioRepo, cursoRepo);
  });

  describe(`POST ${routeUsuarioApi}`, () => {
    it('deve criar um usuario sem turma e retornar 201', async () => {
      const { turmasIds: _, ...rest } = usuarioValido;

      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(rest)
        .expect(201);

      const body = response.body as ResponseDto<UsuarioEntity>;

      expect(body.data).toMatchObject(rest);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('deve criar um usuario com turma e retornar 201', async () => {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 1);

      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 10);

      const turma = await createTurma(cursoRepo, turmaRepo, {
        dataFim,
        dataInicio,
        status: TurmaStatusEnum.DISPONIVEL,
        quantidadeVagas: 10,
      });

      const usuario = { ...usuarioValido };
      usuario.turmasIds = [turma.id];

      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(usuario)
        .expect(201);

      const body = response.body as ResponseDto<UsuarioEntity>;

      expect(body.data).toMatchObject(usuario);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
    });

    it('deve criar um usuario com turma inexistente e retornar 404', async () => {
      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(usuarioValido);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBe(
        `Turma ${usuarioValido.turmasIds?.[0]} não encontrada`,
      );
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(routeUsuarioApi);
    });

    it('deve criar um usuario com turma indisponível e retornar 409', async () => {
      const turma = await createTurma(cursoRepo, turmaRepo);
      await turmaRepo.update(turma.id, { status: TurmaStatusEnum.ENCERRADO });

      const usuario = structuredClone(usuarioValido);
      usuario.turmasIds = [turma.id];

      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(usuario)
        .expect(409);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(409);
      expect(body.error).toBe('Conflict');
      expect(body.message).toBe(
        `Turma "${turma.titulo}" não está disponível para matrícula`,
      );
    });

    it('deve criar um usuario com turma sem vaga para matricula e retornar 422', async () => {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 1);

      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 10);

      const turma = await createTurma(cursoRepo, turmaRepo, {
        dataFim,
        dataInicio,
        status: TurmaStatusEnum.DISPONIVEL,
        quantidadeVagas: 0,
      });

      const usuario = structuredClone(usuarioValido);
      usuario.turmasIds = [turma.id];

      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(usuario);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(422);
      expect(body.error).toBe('Unprocessable Entity');
      expect(body.message).toBe(
        `Turma "${turma.titulo}" sem vagas disponíveis`,
      );
    });

    it('deve criar um usuario com turma fora do período de matricula e retornar 422', async () => {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() + 1);

      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 10);

      const turma = await createTurma(cursoRepo, turmaRepo, {
        dataFim,
        dataInicio,
        status: TurmaStatusEnum.DISPONIVEL,
        quantidadeVagas: 10,
      });

      const usuario = structuredClone(usuarioValido);
      usuario.turmasIds = [turma.id];

      const response = await request(httpServer)
        .post(routeUsuarioApi)
        .send(usuario);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(422);
      expect(body.error).toBe('Unprocessable Entity');
      expect(body.message).toBe(
        `Matrícula para a turma "${turma.titulo}" fora do período permitido`,
      );
    });
  });

  describe(`GET ${routeUsuarioApi}`, () => {
    it('deve retornar usuários com paginação', async () => {
      const response = await request(httpServer)
        .get(routeUsuarioApi)
        .expect(200);

      const body = response.body as PaginatedResponseDto<UsuarioEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
    });

    it('deve retornar usuários com paginação usando query params', async () => {
      const query: PaginationQueryDto = { page: 2, limit: 20 };

      const response = await request(httpServer)
        .get(`${routeUsuarioApi}?page=${query.page}&limit=${query.limit}`)
        .expect(200);

      const body = response.body as PaginatedResponseDto<UsuarioEntity>;

      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(query.page);
      expect(body.meta.limit).toBe(query.limit);
    });

    it('deve aplicar filtros de nome e email', async () => {
      const u1 = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);
      const u2 = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      await usuarioRepo.update(u1.id, {
        nome: 'Marcus Gajozo',
        email: 'marcus@gajozo.com',
      });
      await usuarioRepo.update(u2.id, {
        nome: 'Outro Usuario',
        email: 'outro@email.com',
      });

      const response = await request(httpServer)
        .get(`${routeUsuarioApi}?nome=Marcus&email=marcus@`)
        .expect(200);

      const body = response.body as PaginatedResponseDto<UsuarioEntity>;

      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const returnedUsuario = body.data.find((item) => item.id === u1.id);
      expect(returnedUsuario).toBeDefined();
    });

    it('deve retornar 400 para query params inválidos', async () => {
      const query = { page: -1, limit: 'abc' };

      const response = await request(httpServer)
        .get(`${routeUsuarioApi}?page=${query.page}&limit=${query.limit}`)
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(
        `${routeUsuarioApi}?page=${query.page}&limit=${query.limit}`,
      );
    });
  });

  describe(`PATCH ${routeUsuarioApi}/:id`, () => {
    it('deve atualizar um usuário existente e retornar 200', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);
      const updateData: UpdateUsuarioDto = { nome: 'Nome atualizado' };

      const response = await request(httpServer)
        .patch(`${routeUsuarioApi}/${usuario.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ResponseDto<TurmaEntity>;

      expect(body.data).toMatchObject({
        ...updateData,
      });
    });

    it('deve retornar 400 para dados com formatos inválido', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);
      const updateData = { nome: 1 };

      const response = await request(httpServer)
        .patch(`${routeUsuarioApi}/${usuario.id}`)
        .send(updateData);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuario.id}`);
    });

    it('deve retornar 404 para turma inexistente', async () => {
      const usuarioId = faker.string.uuid();
      const updateData: UpdateUsuarioDto = { nome: 'Nome atualizado' };

      const response = await request(httpServer)
        .patch(`${routeUsuarioApi}/${usuarioId}`)
        .send(updateData);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const usuarioId = 222;
      const updateData: UpdateUsuarioDto = { nome: 'Nome atualizado' };

      const response = await request(httpServer)
        .patch(`${routeUsuarioApi}/${usuarioId}`)
        .send(updateData)
        .expect(400);

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });
  });

  describe(`GET ${routeUsuarioApi}/:id`, () => {
    it('deve retornar um usuário existente', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      const response = await request(httpServer)
        .get(`${routeUsuarioApi}/${usuario.id}`)
        .expect(200);

      const body = response.body as ResponseDto<UsuarioEntity>;

      const {
        turmas: _,
        createdAt: __,
        updatedAt: ___,
        ...expectedData
      } = usuario;

      expect(body.data).toMatchObject({
        ...expectedData,
      });

      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const usuarioId = faker.string.uuid();

      const response = await request(httpServer).get(
        `${routeUsuarioApi}/${usuarioId}`,
      );

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });

    it('deve retornar 400 para ID com formato inválido', async () => {
      const usuarioId = '123';

      const response = await request(httpServer).get(
        `${routeUsuarioApi}/${usuarioId}`,
      );

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });
  });

  describe(`DELETE ${routeUsuarioApi}/:id`, () => {
    it('deve deletar um usuário existente e retornar 204', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      await request(httpServer)
        .delete(`${routeUsuarioApi}/${usuario.id}`)
        .expect(204);

      const turmaDeletado = await usuarioRepo.findOneBy({ id: usuario.id });
      expect(turmaDeletado).toBeNull();
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const usuarioId = faker.string.uuid();

      const response = await request(httpServer).delete(
        `${routeUsuarioApi}/${usuarioId}`,
      );

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(404);
      expect(body.error).toBe('Not Found');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });

    it('deve retornar 400 para id com formato inválido', async () => {
      const usuarioId = '123';

      const response = await request(httpServer).delete(
        `${routeUsuarioApi}/${usuarioId}`,
      );

      const body = response.body as ErrorResponseDto;

      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.path).toBe(`${routeUsuarioApi}/${usuarioId}`);
    });
  });

  describe(`POST ${routeUsuarioApi}/matricular`, () => {
    it('deve matricular usuario na turma e retornar 204', async () => {
      const turmasIds: string[] = [];
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      for (let i = 0; i < 3; i++) {
        const turma = await createTurma(cursoRepo, turmaRepo);
        turmasIds.push(turma.id);
      }

      const usuarioDto: MatricularDto = {
        turmasIds,
        usuarioId: usuario.id,
      };

      await request(httpServer)
        .post(`${routeUsuarioApi}/matricular`)
        .send(usuarioDto)
        .expect(204);
    });

    it('deve retornar um erro se a matricula de 1 materia falhar e manter o usuario apenas com suas matriculas anteriores', async () => {
      const turmas: TurmaEntity[] = [];
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      for (let i = 0; i < 3; i++) {
        const turma = await createTurma(cursoRepo, turmaRepo);
        turmas.push(turma);
      }

      await turmaRepo.update(turmas[0].id, {
        status: TurmaStatusEnum.ENCERRADO,
      });

      const usuarioDto: MatricularDto = {
        turmasIds: turmas.map((item) => item.id),
        usuarioId: usuario.id,
      };

      const result = await request(httpServer)
        .post(`${routeUsuarioApi}/matricular`)
        .send(usuarioDto);

      const body = result.body as ErrorResponseDto;

      const usuarioFindOneBy = await usuarioRepo.findOneBy({ id: usuario.id });

      expect(body.statusCode).toBe(409);
      expect(usuarioFindOneBy?.turmasIds.length).toBe(1);
    });

    it('deve impedir usuário de matricular em turma do mesmo curso que já é matriculado', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);
      const turma = await createTurma(cursoRepo, turmaRepo);

      const turmaUsuario = await turmaRepo.findOneBy({
        id: usuario.turmasIds[0],
      });

      await turmaRepo.update(turma.id, {
        curso: { id: turmaUsuario?.cursoId },
      });

      const curso = await cursoRepo.findOneBy({
        id: turmaUsuario?.cursoId,
      });

      const usuarioDto: MatricularDto = {
        turmasIds: [turma.id],
        usuarioId: usuario.id,
      };

      const result = await request(httpServer)
        .post(`${routeUsuarioApi}/matricular`)
        .send(usuarioDto);

      const body = result.body as ErrorResponseDto;

      expect(body.statusCode).toBe(409);
      expect(body.message).toBe(
        `Usuário já está matriculado na turma "${curso?.titulo}" deste curso.`,
      );
    });
  });

  describe(`POST ${routeUsuarioApi}/cancelar-matricula`, () => {
    it('deve cancelar a matricula do aluno e retornar 204', async () => {
      const usuario = await createUsuario(usuarioRepo, turmaRepo, cursoRepo);

      expect(usuario.turmasIds.length).toBe(1);

      const cancelarDto: CancelarMatriculaDto = {
        usuarioId: usuario.id,
        turmasIds: usuario.turmasIds,
      };

      await request(httpServer)
        .post(`${routeUsuarioApi}/cancelar-matricula`)
        .send(cancelarDto)
        .expect(204);

      const usuarioAtualizado = await usuarioRepo.findOne({
        where: { id: usuario.id },
        relations: { turmas: true },
      });

      expect(usuarioAtualizado?.turmas.length).toBe(0);
    });
  });
});
