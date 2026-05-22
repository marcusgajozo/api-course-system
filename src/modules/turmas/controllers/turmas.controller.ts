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

import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmasService } from '../services/turmas.service';

@Controller('api/turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  async create(
    @Body() createTurmaDto: CreateTurmaDto,
  ): Promise<ResponseDto<TurmaEntity>> {
    const createdTurma = await this.turmasService.create(createTurmaDto);
    return new ResponseDto<TurmaEntity>(createdTurma);
  }

  @Get()
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
  async findOne(
    @Param('id', IsUUIDPipe) id: string,
  ): Promise<ResponseDto<TurmaEntity>> {
    const curso = await this.turmasService.findOne(id);
    return new ResponseDto<TurmaEntity>(curso);
  }

  @Patch(':id')
  async update(
    @Param('id', IsUUIDPipe) id: string,
    @Body() updateTurmaDto: UpdateTurmaDto,
  ): Promise<ResponseDto<TurmaEntity>> {
    const updatedTurma = await this.turmasService.update(id, updateTurmaDto);
    return new ResponseDto<TurmaEntity>(updatedTurma);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', IsUUIDPipe) id: string): Promise<void> {
    return this.turmasService.remove(id);
  }
}
