import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { UpdateCursoDto } from '../dtos/update-curso.dto';
import { CursoEntity } from '../entities/curso.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(CursoEntity)
    private cursoRepository: Repository<CursoEntity>,
  ) {}

  async create(dto: CreateCursoDto): Promise<CursoEntity> {
    const curso = this.cursoRepository.create(dto);
    return this.cursoRepository.save(curso);
  }

  async findOne(id: string): Promise<CursoEntity> {
    const curso = await this.cursoRepository.findOneBy({ id });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    return curso;
  }

  async update(id: string, dto: UpdateCursoDto): Promise<CursoEntity> {
    const curso = await this.findOne(id);
    const date = new Date();
    curso.updatedAt = date;
    Object.assign(curso, dto);
    return this.cursoRepository.save(curso);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.cursoRepository.delete(id);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<[CursoEntity[], number]> {
    const { page, limit } = pagination;

    return this.cursoRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
