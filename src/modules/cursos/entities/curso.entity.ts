import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';

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
}
