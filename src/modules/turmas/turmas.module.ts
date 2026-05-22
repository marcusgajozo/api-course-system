import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TurmasController } from './controllers/turmas.controller';
import { TurmaEntity } from './entities/turma.entity';
import { TurmasService } from './services/turmas.service';

@Module({
  imports: [TypeOrmModule.forFeature([TurmaEntity])],
  controllers: [TurmasController],
  providers: [TurmasService],
})
export class TurmasModule {}
