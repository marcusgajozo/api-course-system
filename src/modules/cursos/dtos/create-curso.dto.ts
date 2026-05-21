import { IsEnum, IsString, IsUrl } from 'class-validator';

import { TemasEnum } from '../enums/temas.enum';

export class CreateCursoDto {
  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsEnum(TemasEnum, { each: true })
  temas: TemasEnum[];

  @IsUrl()
  urlImagem: string;
}
