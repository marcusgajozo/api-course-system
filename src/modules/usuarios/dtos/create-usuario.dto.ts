import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  email: string;

  @IsString()
  nome: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  turmasIds?: string[];
}
