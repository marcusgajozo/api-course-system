import { IsArray, IsUUID } from 'class-validator';

export class MatricularDto {
  @IsUUID()
  usuarioId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  turmasIds: string[];
}
