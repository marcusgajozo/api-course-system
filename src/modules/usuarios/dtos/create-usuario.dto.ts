import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  email: string;

  @IsString()
  nome;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  turmasIds?: string[];
}
