import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';

import { TurmaStatusEnum } from '../enums/turma-status.enum';

@Entity('turmas')
export class TurmaEntity extends BaseEntity {
  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ name: 'quantidade_vagas' })
  quantidadeVagas: number;

  @Column({ type: 'enum', enum: TurmaStatusEnum })
  status: TurmaStatusEnum;

  @Column({ name: 'data_inicio', type: 'timestamptz' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'timestamptz' })
  dataFim: Date;

  @ManyToOne(() => CursoEntity, (curso) => curso.turmas, { nullable: false })
  @JoinColumn({ name: 'curso_id' })
  curso: CursoEntity;

  @RelationId((turma: TurmaEntity) => turma.curso)
  cursoId: string;
}
