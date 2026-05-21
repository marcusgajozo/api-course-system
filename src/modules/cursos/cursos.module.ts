import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CursoEntity } from './entities/curso.entity';
import { CursosService } from './services/cursos.service';

@Module({
  imports: [TypeOrmModule.forFeature([CursoEntity])],
  providers: [CursosService],
})
export class CursosModule {}
