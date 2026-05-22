import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { CursosService } from '@/modules/cursos/services/cursos.service';

import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(TurmaEntity)
    private turmaRepository: Repository<TurmaEntity>,
    private cursosService: CursosService,
  ) {}

  async create(dto: CreateTurmaDto): Promise<TurmaEntity> {
    await this.cursosService.findOne(dto.cursoId);

    const turma = this.turmaRepository.create({
      ...dto,
      curso: { id: dto.cursoId },
    });

    return this.turmaRepository.save(turma);
  }

  async findOne(id: string): Promise<TurmaEntity> {
    const turma = await this.turmaRepository.findOneBy({ id });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    return turma;
  }

  async update(id: string, dto: UpdateTurmaDto) {
    const turma = await this.findOne(id);

    if (dto.cursoId) {
      await this.cursosService.findOne(dto.cursoId);

      turma.curso = {
        id: dto.cursoId,
      } as CursoEntity;
    }

    Object.assign(turma, dto);

    return this.turmaRepository.save(turma);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.turmaRepository.delete(id);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<[TurmaEntity[], number]> {
    const { page, limit } = pagination;

    return this.turmaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
