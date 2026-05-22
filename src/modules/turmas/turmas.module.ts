import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CursosModule } from '../cursos/cursos.module';
import { TurmasController } from './controllers/turmas.controller';
import { TurmaEntity } from './entities/turma.entity';
import { TurmasService } from './services/turmas.service';

@Module({
  imports: [TypeOrmModule.forFeature([TurmaEntity]), CursosModule],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
