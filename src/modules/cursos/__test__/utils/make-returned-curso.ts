import { CursoEntity } from '../../entities/curso.entity';
import { TemasEnum } from '../../enums/temas.enum';

export const makeReturnedCurso = (
  overrides: Partial<CursoEntity> = {},
): CursoEntity => ({
  id: 'b3d6f1a2-4c2e-4f3d-9a1b-2e5d7c8f0e4a',
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  temas: [TemasEnum.INOVACAO],
  urlImagem: 'http://example.com/nestjs.png',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  turmaIds: [],
  turmas: [],
  ...overrides,
});
