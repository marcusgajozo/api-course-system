import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { IsAfter } from '@/common/decorator/is-after.decorator';

import { TurmaStatusEnum } from '../enums/turma-status.enum';

export class CreateTurmaDto {
  @ApiProperty({
    description: 'Título da turma',
    example: 'Turma A - NestJS',
  })
  @IsString()
  titulo: string;

  @ApiProperty({
    description: 'Descrição da turma',
    example: 'Turma matutina de NestJS',
  })
  @IsString()
  descricao: string;

  @ApiProperty({
    description: 'Quantidade de vagas disponíveis',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  quantidadeVagas: number;

  @ApiProperty({
    description: 'Status da turma',
    enum: TurmaStatusEnum,
    enumName: 'TurmaStatusEnum',
  })
  @IsEnum(TurmaStatusEnum)
  status: TurmaStatusEnum;

  @ApiProperty({
    description: 'Data de início da turma',
    example: '2026-06-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  dataInicio: Date;

  @ApiProperty({
    description: 'Data de encerramento da turma',
    example: '2026-12-01T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsAfter('dataInicio', {
    message: 'A data final deve ser maior que a data de início',
  })
  dataFim: Date;

  @ApiProperty({
    description: 'ID do curso associado (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  cursoId: string;
}
