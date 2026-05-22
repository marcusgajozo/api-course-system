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
  @IsAfter('dataFim', {
    message: 'A data final deve ser maior que a data de início',
  })
  dataFim: Date;

  @IsUUID()
  cursoId: string;
}
