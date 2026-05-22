import { Repository } from 'typeorm';

import { CreateCursoDto } from '@/modules/cursos/dtos/create-curso.dto';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TemasEnum } from '@/modules/cursos/enums/temas.enum';

export const cursoValido: CreateCursoDto = {
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  temas: [TemasEnum.INOVACAO, TemasEnum.TECNOLOGIA],
  urlImagem: 'http://example.com/nestjs.png',
};

export async function createCurso(repo: Repository<CursoEntity>) {
  return await repo.save(repo.create(cursoValido));
}
