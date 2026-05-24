import { Column, Entity, JoinTable, ManyToMany, RelationId } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';

@Entity('usuarios')
export class UsuarioEntity extends BaseEntity {
  @Column()
  email: string;

  @Column()
  nome: string;

  @ManyToMany(() => TurmaEntity, (turma) => turma.usuarios, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'usuarios_turmas',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'turma_id', referencedColumnName: 'id' },
  })
  turmas: TurmaEntity[];

  @RelationId((usuario: UsuarioEntity) => usuario.turmas)
  turmasIds: string[];
}
