import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { makeReturnedCurso } from '@/modules/cursos/__test__/utils/make-returned-curso';
import { CursosService } from '@/modules/cursos/services/cursos.service';

import { makeReturnedTurma } from '../__test__/utils/make-returned-turma';
import { makeTurmaCreated } from '../__test__/utils/make-turma-created';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmasService } from './turmas.service';

describe('(Unit test) TurmasService', () => {
  let service: TurmasService;
  let repo: jest.Mocked<Repository<TurmaEntity>>;
  let cursosService: jest.Mocked<CursosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurmasService,
        {
          provide: getRepositoryToken(TurmaEntity),
          useValue: {
            findOneBy: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CursosService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TurmasService);
    repo = module.get(getRepositoryToken(TurmaEntity));
    cursosService = module.get(CursosService);
  });

  describe('create', () => {
    it('deve criar e retornar a turma', async () => {
      const dto = makeTurmaCreated();
      const turma = makeReturnedTurma(dto);
      const curso = makeReturnedCurso();

      const spyCursoFindOne = jest
        .spyOn(cursosService, 'findOne')
        .mockResolvedValue(curso);

      cursosService.findOne.mockResolvedValue(curso);
      repo.create.mockReturnValue(turma);
      repo.save.mockResolvedValue(turma);

      await expect(service.create(dto)).resolves.toEqual(turma);

      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(dto.cursoId);
    });

    it('deve lançar NotFoundException se o curso não existir', async () => {
      const dto = makeTurmaCreated();

      cursosService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('deve retornar a turma quando encontrado', async () => {
      const turma = makeReturnedTurma();
      repo.findOneBy.mockResolvedValue(turma);

      await expect(service.findOne(turma.id)).resolves.toEqual(turma);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar a turma', async () => {
      const turma = makeReturnedTurma();

      const spyCursoFindOne = jest.spyOn(cursosService, 'findOne');

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(turma);

      repo.save.mockResolvedValue(turma);

      const result = await service.update(turma.id, turma);

      expect(result).toEqual(turma);
      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(turma.cursoId);
      expect(spyFindOne).toHaveBeenCalledWith(turma.id);
    });

    it('deve lançar NotFoundException para turma inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { titulo: 'Novo titulo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException para curso inexistente', async () => {
      const turma = makeReturnedTurma();
      repo.findOneBy.mockResolvedValue(turma);

      const spyCursoFindOne = jest
        .spyOn(cursosService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(service.update(turma.id, turma)).rejects.toThrow(
        NotFoundException,
      );

      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(turma.cursoId);
    });
  });

  describe('remove', () => {
    it('deve remover o turma sem lançar exceção', async () => {
      const turma = makeReturnedTurma();
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(turma);
      const spyDelete = jest.spyOn(repo, 'delete');

      await service.remove(turma.id);

      expect(spyFindOne).toHaveBeenCalledWith(turma.id);
      expect(spyDelete).toHaveBeenCalledWith(turma.id);
    });

    it('deve lançar NotFoundException para turma inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar turmas paginados', async () => {
      const pagination: PaginationQueryDto = { page: 1, limit: 10 };
      const turmas = [makeReturnedTurma()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([turmas, turmas.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([turmas, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });

  describe('matricularAluno', () => {});
});
