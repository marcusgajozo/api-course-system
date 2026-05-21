import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CursosController } from './controllers/cursos.controller';
import { CursoEntity } from './entities/curso.entity';
import { CursosService } from './services/cursos.service';

@Module({
  imports: [TypeOrmModule.forFeature([CursoEntity])],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
