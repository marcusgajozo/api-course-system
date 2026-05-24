import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

export class FilterQueryDto {
  @ApiPropertyOptional({ description: 'Filtro pelo título da turma' })
  @IsOptional()
  @IsString()
  titulo?: string;
}

export class TurmasQueryDto extends IntersectionType(
  PaginationQueryDto,
  FilterQueryDto,
) {}
