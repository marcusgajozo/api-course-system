import { Column, Entity, OneToMany, RelationId } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';

import { TemasEnum } from '../enums/temas.enum';

@Entity('cursos')
export class CursoEntity extends BaseEntity {
  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ type: 'enum', enum: TemasEnum, array: true })
  temas: TemasEnum[];

  @Column()
  urlImagem: string;

  @OneToMany(() => TurmaEntity, (turma) => turma.curso)
  turmas: TurmaEntity[];

  @RelationId((curso: CursoEntity) => curso.turmas)
  turmaIds: string[];
}
