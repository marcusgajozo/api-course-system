import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(TurmaEntity)
    private cursoRepository: Repository<TurmaEntity>,
  ) {}

  async create(dto: CreateTurmaDto): Promise<TurmaEntity> {
    const curso = this.cursoRepository.create(dto);
    return this.cursoRepository.save(curso);
  }

  async findOne(id: string): Promise<TurmaEntity> {
    const curso = await this.cursoRepository.findOneBy({ id });

    if (!curso) {
      throw new NotFoundException('Turma não encontrado');
    }

    return curso;
  }

  async update(id: string, dto: UpdateTurmaDto): Promise<TurmaEntity> {
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
  ): Promise<[TurmaEntity[], number]> {
    const { page, limit } = pagination;

    return this.cursoRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
