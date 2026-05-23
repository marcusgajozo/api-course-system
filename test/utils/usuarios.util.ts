import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';
import { CreateUsuarioDto } from '@/modules/usuarios/dtos/create-usuario.dto';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { beforeEachTestCurso } from './cursos.util';
import { createTurma } from './turmas.util';

export const routeUsuarioApi = '/api/usuarios';

export const usuario: CreateUsuarioDto = {
  email: 'test@test.com',
  nome: 'Aprenda NestJS do zero',
  turmasIds: [faker.string.uuid(), faker.string.uuid()],
};

export const usuarioValido = structuredClone(usuario);

export async function beforeEachTestUsuario(
  usuarioRepo: Repository<UsuarioEntity>,
  cursoRepo: Repository<CursoEntity>,
) {
  await beforeEachTestCurso(cursoRepo);
  await usuarioRepo.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
}

export async function createUsuario(
  usuarioRepo: Repository<UsuarioEntity>,
  turmaRepo: Repository<TurmaEntity>,
  cursoRepo: Repository<CursoEntity>,
) {
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
  return await usuarioRepo.save(
    usuarioRepo.create({ ...usuario, turmas: [{ id: turma.id }] }),
  );
}
