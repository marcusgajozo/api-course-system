import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { CursosService } from '@/modules/cursos/services/cursos.service';

import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { UsuarioEntity } from '../entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private usuarioRepository: Repository<UsuarioEntity>,
    private cursosService: CursosService,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioEntity> {
    return this.usuarioRepository.save(dto);
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
}
