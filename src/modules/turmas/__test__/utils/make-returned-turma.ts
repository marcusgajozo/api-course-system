import { TurmaEntity } from '../../entities/turma.entity';
import { TurmaStatusEnum } from '../../enums/turma-status.enum';

export function makeReturnedTurma(
  overrides: Partial<TurmaEntity> = {},
): TurmaEntity {
  return {
    id: 'b3d6f1a2-4c2e-4f3d-9a1b-2e5d7c8f0e4a',
    usuarios: [],
    usuariosIds: [],
    titulo: 'Turma de NestJS',
    descricao: 'Aprenda NestJS do zero',
    quantidadeVagas: 30,
    status: TurmaStatusEnum.DISPONIVEL,
    dataInicio: new Date('2024-02-01'),
    dataFim: new Date('2024-03-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    curso: {
      id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
      titulo: 'Curso de Backend',
      descricao: 'Aprenda a criar APIs com Node.js',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      urlImagem: 'http://example.com/curso-image.png',
      temas: [],
      turmaIds: [],
      turmas: [],
    },
    cursoId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    ...overrides,
  };
}
