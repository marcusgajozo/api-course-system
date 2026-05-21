import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { UpdateCursoDto } from '../dtos/update-curso.dto';
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
    const [cursos, totalCount] = await this.cursosService.findAll(query);
    return new PaginatedResponseDto<CursoEntity>(cursos, {
      page: query.page,
      limit: query.limit,
      totalCount: totalCount,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CursoEntity> {
    return this.cursosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCursoDto: UpdateCursoDto,
  ): Promise<ResponseDto<CursoEntity>> {
    const updatedCurso = await this.cursosService.update(id, updateCursoDto);
    return new ResponseDto<CursoEntity>(updatedCurso);
  }
}
