import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';

@Entity('turmas')
export class TurmaEntity extends BaseEntity {
  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ name: 'quantidade_vagas' })
  quantidadeVagas: number;

  @Column()
  status: string;

  @Column({ name: 'data_inicio', type: 'timestamptz' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'timestamptz' })
  dataFim: Date;
}
