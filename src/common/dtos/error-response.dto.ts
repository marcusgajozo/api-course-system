import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'Código de status HTTP', example: 404 })
  statusCode: number;

  @ApiProperty({ description: 'Tipo do erro', example: 'Not Found' })
  error: string;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Recurso não encontrado',
  })
  message: string | string[];

  @ApiProperty({
    description: 'Data e hora do erro',
    example: '2026-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Rota que gerou o erro',
    example: '/api/cursos/123',
  })
  path: string;
}
