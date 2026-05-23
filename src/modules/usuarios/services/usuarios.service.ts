import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { TurmasService } from '@/modules/turmas/services/turmas.service';

import { CancelarMatriculaDto } from '../dtos/cancelar-matricula.dto';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { MatricularDto } from '../dtos/matricular.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { UsuarioEntity } from '../entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private usuarioRepository: Repository<UsuarioEntity>,
    private turmasService: TurmasService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioEntity> {
    if (!dto.turmasIds?.length) {
      return this.usuarioRepository.save(dto);
    }

    return this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(UsuarioEntity, dto);
      await manager.save(usuario);
      await this.turmasService.matricularAluno(
        usuario,
        dto.turmasIds!,
        manager,
      );

      return manager.findOneOrFail(UsuarioEntity, {
        where: { id: usuario.id },
      });
    });
  }

  async findOne(id: string): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException('Usuario não encontrada');
    }

    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    Object.assign(usuario, dto);

    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.usuarioRepository.delete(id);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<[UsuarioEntity[], number]> {
    const { page, limit } = pagination;

    return this.usuarioRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async matricular(dto: MatricularDto) {
    const usuario = await this.findOne(dto.usuarioId);
    await this.dataSource.transaction(async (manager) => {
      await this.turmasService.matricularAluno(usuario, dto.turmasIds, manager);
    });
  }

  async cancelarMatricula(dto: CancelarMatriculaDto) {
    await this.findOne(dto.usuarioId);
    await this.turmasService.cancelarMatriculaAluno(
      dto.usuarioId,
      dto.turmasIds,
    );
  }
}
