import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, IsUrl } from 'class-validator';

import { TemasEnum } from '../enums/temas.enum';

export class CreateCursoDto {
  @ApiProperty({ description: 'Titulo do curso', example: 'Curso de NestJS' })
  @IsString()
  titulo: string;

  @ApiProperty({
    description: 'Descricao do curso',
    example: 'Aprenda NestJS do zero ao avancado',
  })
  @IsString()
  descricao: string;

  @ApiProperty({
    description: 'Temas do curso',
    enum: TemasEnum,
    enumName: 'TemasEnum',
    isArray: true,
  })
  @IsArray()
  @IsEnum(TemasEnum, { each: true })
  temas: TemasEnum[];

  @ApiProperty({
    description: 'URL da imagem do curso',
    example: 'https://example.com/image.png',
  })
  @IsUrl()
  urlImagem: string;
}
