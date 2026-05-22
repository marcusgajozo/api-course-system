import { CreateTurmaDto } from '../../dtos/create-turma.dto';
import { TurmaStatusEnum } from '../../enums/turma-status.enum';

export const makeTurmaCreated = (
  overrides: Partial<CreateTurmaDto> = {},
): CreateTurmaDto => ({
  titulo: 'Turma de NestJS',
  descricao: 'Aprenda NestJS do zero',
  quantidadeVagas: 30,
  status: TurmaStatusEnum.DISPONIVEL,
  dataInicio: new Date('2024-02-01'),
  dataFim: new Date('2024-03-01'),
  cursoId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  ...overrides,
});
