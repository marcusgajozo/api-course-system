import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class CancelarMatriculaDto {
  @ApiProperty({
    description: 'ID do usuário (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  usuarioId: string;

  @ApiProperty({
    description: 'IDs das turmas para cancelar matrícula',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  turmasIds: string[];
}
