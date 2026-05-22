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

import { CreateUsuarioDto } from '../dtos/create-usuario.dto';
import { UpdateUsuarioDto } from '../dtos/update-usuario.dto';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UsuariosService } from '../services/usuarios.service';

@Controller('api/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<ResponseDto<UsuarioEntity>> {
    const createdUsuario = await this.usuariosService.create(createUsuarioDto);
    return new ResponseDto<UsuarioEntity>(createdUsuario);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UsuarioEntity>> {
    const [usuarios, totalCount] = await this.usuariosService.findAll(query);
    return new PaginatedResponseDto<UsuarioEntity>(usuarios, {
      page: query.page,
      limit: query.limit,
      totalCount: totalCount,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<UsuarioEntity>> {
    const curso = await this.usuariosService.findOne(id);
    return new ResponseDto<UsuarioEntity>(curso);
  }

  @Patch(':id')
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

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }
}
