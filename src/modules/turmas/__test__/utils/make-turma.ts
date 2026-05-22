import { TurmaEntity } from '../../entities/turma.entity';

export const makeTurma = (
  overrides: Partial<TurmaEntity> = {},
): TurmaEntity => ({
  id: 'b3d6f1a2-4c2e-4f3d-9a1b-2e5d7c8f0e4a',
  titulo: 'Turma de NestJS',
  descricao: 'Aprenda NestJS do zero',
  quantidadeVagas: 30,
  status: 'disponível',
  dataInicio: new Date('2024-02-01'),
  dataFim: new Date('2024-03-01'),
  createdAt: new Date('2024-01-01'),
  ...overrides,
});
