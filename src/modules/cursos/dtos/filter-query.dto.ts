import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

import { TemasEnum } from '../enums/temas.enum';

export class FilterQueryDto {
  @ApiPropertyOptional({ description: 'Filtro pelo título do curso' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Filtro pelos temas (valores separados por vírgula)',
    example: 'INOVACAO,TECNOLOGIA',
  })
  @IsOptional()
  @Transform(({ value }): unknown => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }
    return value as unknown;
  })
  @IsArray()
  @IsEnum(TemasEnum, {
    each: true,
    message: 'Cada tema deve ser um valor válido (ex: INOVACAO, TECNOLOGIA)',
  })
  temas?: TemasEnum[];
}

export class CursosQueryDto extends IntersectionType(
  PaginationQueryDto,
  FilterQueryDto,
) {}
