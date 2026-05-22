import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';

@Entity('usuarios')
export class UsuarioEntity extends BaseEntity {
  @Column()
  email: string;

  @Column()
  nome: string;
}
