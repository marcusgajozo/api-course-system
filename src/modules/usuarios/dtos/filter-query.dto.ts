import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

export class FilterQueryDto {
  @ApiPropertyOptional({ description: 'Filtro pelo nome do usuário' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Filtro pelo email do usuário' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class UsuarioQueryDto extends IntersectionType(
  PaginationQueryDto,
  FilterQueryDto,
) {}
