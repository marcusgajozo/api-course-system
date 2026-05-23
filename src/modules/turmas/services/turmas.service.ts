import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { CursosService } from '@/modules/cursos/services/cursos.service';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmaStatusEnum } from '../enums/turma-status.enum';

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(TurmaEntity)
    private turmaRepository: Repository<TurmaEntity>,
    private readonly defaultManager: EntityManager,
    private cursosService: CursosService,
  ) {}

  async create(dto: CreateTurmaDto): Promise<TurmaEntity> {
    await this.cursosService.findOne(dto.cursoId);

    const turma = this.turmaRepository.create({
      ...dto,
      curso: { id: dto.cursoId },
    });

    return this.turmaRepository.save(turma);
  }

  async findOne(id: string): Promise<TurmaEntity> {
    const turma = await this.turmaRepository.findOneBy({ id });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    return turma;
  }

  async update(id: string, dto: UpdateTurmaDto) {
    const turma = await this.findOne(id);

    if (dto.cursoId) {
      await this.cursosService.findOne(dto.cursoId);

      turma.curso = {
        id: dto.cursoId,
      } as CursoEntity;
    }

    Object.assign(turma, dto);

    return this.turmaRepository.save(turma);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.turmaRepository.delete(id);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<[TurmaEntity[], number]> {
    const { page, limit } = pagination;

    return this.turmaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async matricularAluno(
    usuario: UsuarioEntity,
    turmasIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const currentManager = manager || this.defaultManager;

    for (const turmaId of turmasIds) {
      const turma = await currentManager.findOne(TurmaEntity, {
        where: { id: turmaId },
        relations: { usuarios: true, curso: true },
      });

      if (!turma) {
        throw new NotFoundException(`Turma ${turmaId} não encontrada`);
      }

      const usuarioJaMatriculadoNoCurso = await currentManager.findOne(
        TurmaEntity,
        {
          where: {
            curso: { id: turma.curso.id },
            usuarios: { id: usuario.id },
          },
        },
      );

      if (usuarioJaMatriculadoNoCurso) {
        throw new ConflictException(
          `Usuário já está matriculado na turma "${usuarioJaMatriculadoNoCurso.titulo}" deste curso.`,
        );
      }

      if (turma.status !== TurmaStatusEnum.DISPONIVEL) {
        throw new ConflictException(
          `Turma "${turma.titulo}" não está disponível para matrícula`,
        );
      }

      if (turma.usuarios.length >= turma.quantidadeVagas) {
        throw new UnprocessableEntityException(
          `Turma "${turma.titulo}" sem vagas disponíveis`,
        );
      }

      const currentDate = new Date();
      if (currentDate < turma.dataInicio || currentDate > turma.dataFim) {
        throw new UnprocessableEntityException(
          `Matrícula para a turma "${turma.titulo}" fora do período permitido`,
        );
      }

      turma.usuarios.push(usuario);
      this.atualizaStatusTurma(turma);

      await currentManager.save(TurmaEntity, turma);
    }
  }

  async cancelarMatriculaAluno(usuarioId: string, turmasIds: string[]) {
    await this.turmaRepository
      .createQueryBuilder()
      .relation(UsuarioEntity, 'turmas')
      .of(usuarioId)
      .remove(turmasIds);

    for (const turmaId of turmasIds) {
      const turma = await this.turmaRepository.findOne({
        where: { id: turmaId },
        relations: { usuarios: true },
      });

      if (turma) {
        this.atualizaStatusTurma(turma);
        await this.turmaRepository.save(turma);
      }
    }
  }

  private atualizaStatusTurma(turma: TurmaEntity): void {
    if (
      turma.usuarios.length >= turma.quantidadeVagas ||
      turma.dataFim <= new Date()
    ) {
      turma.status = TurmaStatusEnum.ENCERRADO;
    } else {
      turma.status = TurmaStatusEnum.DISPONIVEL;
    }
  }
}
