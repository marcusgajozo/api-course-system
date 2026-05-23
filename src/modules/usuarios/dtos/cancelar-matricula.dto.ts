import { IsArray, IsUUID } from 'class-validator';

export class CancelarMatriculaDto {
  @IsUUID()
  usuarioId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  turmasIds: string[];
}
