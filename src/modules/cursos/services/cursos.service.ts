import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CursoEntity } from '../entities/curso.entity';

export class CursosService {
  constructor(
    @InjectRepository(CursoEntity)
    private cursoRepository: Repository<CursoEntity>,
  ) {}
}
