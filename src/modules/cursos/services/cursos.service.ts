import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOverlap, FindOptionsWhere, ILike, Repository } from 'typeorm';

import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursosQueryDto } from '../dtos/filter-query.dto';
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
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: { turmas: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso não encontrado');
    }

    return curso;
  }

  async update(id: string, dto: UpdateCursoDto): Promise<CursoEntity> {
    const curso = await this.findOne(id);
    Object.assign(curso, dto);
    return this.cursoRepository.save(curso);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.cursoRepository.delete(id);
  }

  async findAll(query: CursosQueryDto): Promise<[CursoEntity[], number]> {
    const { page, limit, temas, titulo } = query;

    const where: FindOptionsWhere<CursoEntity> = {};

    if (titulo) {
      where.titulo = ILike(`%${titulo}%`);
    }

    if (temas && temas.length > 0) {
      where.temas = ArrayOverlap(temas);
    }

    return this.cursoRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });
  }

  async findAllCursosTurmaDisponivel(
    query: CursosQueryDto,
  ): Promise<[CursoEntity[], number]> {
    const { page, limit, temas, titulo } = query;

    const where: FindOptionsWhere<CursoEntity> = {
      turmas: { status: TurmaStatusEnum.DISPONIVEL },
    };

    if (titulo) {
      where.titulo = ILike(`%${titulo}%`);
    }

    if (temas && temas.length > 0) {
      where.temas = ArrayOverlap(temas);
    }

    return this.cursoRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where,
      relations: { turmas: true },
    });
  }
}
