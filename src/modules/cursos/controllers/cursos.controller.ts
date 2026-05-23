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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

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

@ApiTags('Cursos')
@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() createCursoDto: CreateCursoDto,
  ): Promise<ResponseDto<CursoEntity>> {
    const createdCurso = await this.cursosService.create(createCursoDto);
    return new ResponseDto<CursoEntity>(createdCurso);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos retornada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
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
  @ApiOperation({ summary: 'Buscar curso por ID' })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do curso (UUID)' })
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<CursoEntity>> {
    const curso = await this.cursosService.findOne(id);
    return new ResponseDto<CursoEntity>(curso);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar curso' })
  @ApiResponse({ status: 200, description: 'Curso atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do curso (UUID)' })
  async update(
    @Param('id', IsUUIDPipe) id: string,
    @Body() updateCursoDto: UpdateCursoDto,
  ): Promise<ResponseDto<CursoEntity>> {
    const updatedCurso = await this.cursosService.update(id, updateCursoDto);
    return new ResponseDto<CursoEntity>(updatedCurso);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover curso' })
  @ApiResponse({ status: 204, description: 'Curso removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do curso (UUID)' })
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.cursosService.remove(id);
  }
}
