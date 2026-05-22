import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { IsUUIDPipe } from '@/common/pipes/is-uuid.pipe';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { UpdateCursoDto } from '../dtos/update-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { CursosService } from '../services/cursos.service';

@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  async create(
    @Body() createCursoDto: CreateCursoDto,
  ): Promise<ResponseDto<CursoEntity>> {
    const createdCurso = await this.cursosService.create(createCursoDto);
    return new ResponseDto<CursoEntity>(createdCurso);
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
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<CursoEntity>> {
    const curso = await this.cursosService.findOne(id);
    return new ResponseDto<CursoEntity>(curso);
  }

  @Patch(':id')
  async update(
    @Param('id', IsUUIDPipe) id: string,
    @Body() updateCursoDto: UpdateCursoDto,
  ): Promise<ResponseDto<CursoEntity>> {
    const updatedCurso = await this.cursosService.update(id, updateCursoDto);
    return new ResponseDto<CursoEntity>(updatedCurso);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.cursosService.remove(id);
  }
}
