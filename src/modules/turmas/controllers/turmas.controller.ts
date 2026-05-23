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

import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmasService } from '../services/turmas.service';

@ApiTags('Turmas')
@Controller('api/turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova turma' })
  @ApiResponse({ status: 201, description: 'Turma criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async create(
    @Body() createTurmaDto: CreateTurmaDto,
  ): Promise<ResponseDto<TurmaEntity>> {
    const createdTurma = await this.turmasService.create(createTurmaDto);
    return new ResponseDto<TurmaEntity>(createdTurma);
  }

  @Get()
  @ApiOperation({ summary: 'Listar turmas com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de turmas retornada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TurmaEntity>> {
    const [turmas, totalCount] = await this.turmasService.findAll(query);
    return new PaginatedResponseDto<TurmaEntity>(turmas, {
      page: query.page,
      limit: query.limit,
      totalCount: totalCount,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar turma por ID' })
  @ApiResponse({ status: 200, description: 'Turma encontrada' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da turma (UUID)' })
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<TurmaEntity>> {
    const curso = await this.turmasService.findOne(id);
    return new ResponseDto<TurmaEntity>(curso);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar turma' })
  @ApiResponse({ status: 200, description: 'Turma atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da turma (UUID)' })
  async update(
    @Param('id', IsUUIDPipe) id: string,
    @Body() updateTurmaDto: UpdateTurmaDto,
  ): Promise<ResponseDto<TurmaEntity>> {
    const updatedTurma = await this.turmasService.update(id, updateTurmaDto);
    return new ResponseDto<TurmaEntity>(updatedTurma);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover turma' })
  @ApiResponse({ status: 204, description: 'Turma removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiParam({ name: 'id', description: 'ID da turma (UUID)' })
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.turmasService.remove(id);
  }

  @Get('/usuarios/:id')
  @ApiOperation({ summary: 'Listar turmas matriculadas de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de turmas retornada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  async findAllTurmasUsuario(
    @Param('id', IsUUIDPipe) usuarioId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TurmaEntity>> {
    const [turmas, totalCount] = await this.turmasService.findAllTurmasUsuario(
      usuarioId,
      query,
    );

    return new PaginatedResponseDto<TurmaEntity>(turmas, {
      page: query.page,
      limit: query.limit,
      totalCount: totalCount,
    });
  }
}
