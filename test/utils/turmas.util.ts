import { Repository } from 'typeorm';

import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { CreateTurmaDto } from '@/modules/turmas/dtos/create-turma.dto';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';

import { createCurso } from './cursos.util';

export const routeTurmaApi = '/api/turmas/';

export const turma: CreateTurmaDto = {
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  quantidadeVagas: 30,
  status: TurmaStatusEnum.DISPONIVEL,
  dataInicio: new Date('2026-01-01'),
  dataFim: new Date('2026-01-10'),
  cursoId: '00000000-0000-0000-0000-000000000000',
};

export const turmaValido = structuredClone(turma);

export async function beforeEachTestTurma(cursoRepo: Repository<CursoEntity>) {
  await cursoRepo.query('TRUNCATE TABLE cursos RESTART IDENTITY CASCADE');
}

export async function createTurma(
  cursoRepo: Repository<CursoEntity>,
  turmaRepo: Repository<TurmaEntity>,
) {
  const curso = await createCurso(cursoRepo);
  return await turmaRepo.save(
    turmaRepo.create({ ...turma, curso: { id: curso.id } }),
  );
}
