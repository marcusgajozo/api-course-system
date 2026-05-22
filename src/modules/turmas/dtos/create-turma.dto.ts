import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { TurmaStatusEnum } from '../enums/turma-status.enum';

export class CreateTurmaDto {
  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsNumber()
  @Min(0)
  quantidadeVagas: number;

  @IsEnum(TurmaStatusEnum)
  status: TurmaStatusEnum;

  @IsDate()
  @Type(() => Date)
  dataInicio: Date;

  @IsDate()
  @Type(() => Date)
  dataFim: Date;

  @IsUUID()
  cursoId: string;
}
