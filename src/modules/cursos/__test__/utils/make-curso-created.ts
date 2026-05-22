import { CreateCursoDto } from '../../dtos/create-curso.dto';
import { TemasEnum } from '../../enums/temas.enum';

export const makeCursoCreated = (
  overrides: Partial<CreateCursoDto> = {},
): CreateCursoDto => ({
  titulo: 'Curso de NestJS',
  descricao: 'Aprenda NestJS do zero',
  temas: [TemasEnum.INOVACAO],
  urlImagem: 'http://example.com/nestjs.png',
  ...overrides,
});
