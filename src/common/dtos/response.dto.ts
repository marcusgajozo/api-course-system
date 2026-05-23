import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: 'Dados da resposta' })
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}
