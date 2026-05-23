import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { CreateTurmaDto } from '@/modules/turmas/dtos/create-turma.dto';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';

import { createCurso } from './cursos.util';

export const routeTurmaApi = '/api/turmas/';

const dataInicio = new Date();
dataInicio.setDate(dataInicio.getDate() - 1);

const dataFim = new Date();
dataFim.setDate(dataFim.getDate() + 10);

export const turma: CreateTurmaDto = {
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  quantidadeVagas: 10,
  status: TurmaStatusEnum.DISPONIVEL,
  dataInicio,
  dataFim,
  cursoId: faker.string.uuid(),
};

export const turmaValido = structuredClone(turma);

export async function beforeEachTestTurma(cursoRepo: Repository<CursoEntity>) {
  await cursoRepo.query('TRUNCATE TABLE cursos RESTART IDENTITY CASCADE');
}

export async function createTurma(
  cursoRepo: Repository<CursoEntity>,
  turmaRepo: Repository<TurmaEntity>,
  turmaDto?: Partial<CreateTurmaDto>,
) {
  let cursoId = turmaDto?.cursoId;

  if (!cursoId) {
    const curso = await createCurso(cursoRepo);
    cursoId = curso.id;
  }
  return await turmaRepo.save(
    turmaRepo.create({ ...{ ...turma, ...turmaDto }, curso: { id: cursoId } }),
  );
}
