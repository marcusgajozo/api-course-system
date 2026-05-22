import { IsString, IsUrl } from 'class-validator';

export class CreateTurmaDto {
  @IsString()
  titulo: string;

  @IsString()
  descricao: string;

  @IsUrl()
  urlImagem: string;
}
