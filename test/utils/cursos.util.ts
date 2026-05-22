import { Repository } from 'typeorm';

import { CreateCursoDto } from '@/modules/cursos/dtos/create-curso.dto';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TemasEnum } from '@/modules/cursos/enums/temas.enum';

export const routeCursoApi = '/api/cursos/';

export const curso: CreateCursoDto = {
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  temas: [TemasEnum.INOVACAO, TemasEnum.TECNOLOGIA],
  urlImagem: 'http://example.com/nestjs.png',
};

export const cursoValido = structuredClone(curso);

export async function beforeEachTestCurso(cursoRepo: Repository<CursoEntity>) {
  await cursoRepo.query('TRUNCATE TABLE cursos RESTART IDENTITY CASCADE');
}

export async function createCurso(repo: Repository<CursoEntity>) {
  return await repo.save(repo.create(curso));
}
