import { Body, Controller, Post } from '@nestjs/common';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursosService } from '../services/cursos.service';

@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursosService.create(createCursoDto);
  }
}
