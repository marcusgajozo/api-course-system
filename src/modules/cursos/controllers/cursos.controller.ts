import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { CursosService } from '../services/cursos.service';

@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  async create(@Body() createCursoDto: CreateCursoDto): Promise<CursoEntity> {
    return this.cursosService.create(createCursoDto);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<CursoEntity>> {
    const [cursos, total] = await this.cursosService.findAll(query);
    return new PaginatedResponseDto<CursoEntity>(cursos, {
      page: query.page,
      limit: query.limit,
      totalCount: total,
    });
  }
}
