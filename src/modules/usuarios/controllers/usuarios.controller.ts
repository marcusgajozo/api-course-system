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

import { PaginatedResponseDto } from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';
import { IsUUIDPipe } from '@/common/pipes/is-uuid.pipe';

import { CancelarMatriculaDto } from '../dtos/cancelar-matricula.dto';
import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UsuarioQueryDto } from '../dtos/filter-query.dto';
import { MatricularDto } from '../dtos/matricular.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UsuariosService } from '../services/usuarios.service';

@ApiTags('Usuários')
@Controller('/api/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de matrícula' })
  @ApiResponse({
    status: 422,
    description: 'Turma sem vagas ou fora do período',
  })
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<ResponseDto<UsuarioEntity>> {
    const createdUsuario = await this.usuariosService.create(createUsuarioDto);
    return new ResponseDto<UsuarioEntity>(createdUsuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários com paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de paginação inválidos',
  })
  async findAll(
    @Query() query: UsuarioQueryDto,
  ): Promise<PaginatedResponseDto<UsuarioEntity>> {
    const [usuarios, totalCount] = await this.usuariosService.findAll(query);
    return new PaginatedResponseDto<UsuarioEntity>(usuarios, {
      page: query.page,
      limit: query.limit,
      totalCount: totalCount,
    });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<UsuarioEntity>> {
    const curso = await this.usuariosService.findOneWithRelations(id);
    return new ResponseDto<UsuarioEntity>(curso);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id', IsUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<ResponseDto<UsuarioEntity>> {
    const updatedUsuario = await this.usuariosService.update(
      id,
      updateUsuarioDto,
    );
    return new ResponseDto<UsuarioEntity>(updatedUsuario);
  }

  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }

  @Post('/matricular')
  @HttpCode(204)
  @ApiOperation({ summary: 'Matricular usuário em turmas' })
  @ApiResponse({ status: 204, description: 'Matrícula realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário ou turma não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de matrícula' })
  @ApiResponse({
    status: 422,
    description: 'Turma sem vagas ou fora do período',
  })
  async matricular(@Body() matricularDto: MatricularDto): Promise<void> {
    return this.usuariosService.matricular(matricularDto);
  }

  @Post('/cancelar-matricula')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancelar matrícula do usuário em turmas' })
  @ApiResponse({ status: 204, description: 'Matrícula cancelada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 422, description: 'Erro ao cancelar matrícula' })
  async cancelarMatricula(
    @Body() cancelarMatriculaDto: CancelarMatriculaDto,
  ): Promise<void> {
    return this.usuariosService.cancelarMatricula(cancelarMatriculaDto);
  }
}
