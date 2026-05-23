import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { makeReturnedCurso } from '@/modules/cursos/__test__/utils/make-returned-curso';
import { CursosService } from '@/modules/cursos/services/cursos.service';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { makeReturnedTurma } from '../__test__/utils/make-returned-turma';
import { makeTurmaCreated } from '../__test__/utils/make-turma-created';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmaStatusEnum } from '../enums/turma-status.enum';
import { TurmasService } from './turmas.service';

describe('(Unit test) TurmasService', () => {
  let service: TurmasService;
  let repo: jest.Mocked<Repository<TurmaEntity>>;
  let cursosService: jest.Mocked<CursosService>;
  let defaultManager: jest.Mocked<EntityManager>;

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
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
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
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TurmasService);
    repo = module.get(getRepositoryToken(TurmaEntity));
    cursosService = module.get(CursosService);
    defaultManager = module.get(EntityManager);
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

  describe('matricularAluno', () => {
    it('deve matricular o aluno com sucesso deixa turma com status DISPONÍVEL', async () => {
      const usuario = { id: 'usuario-1' } as UsuarioEntity;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const turma = makeReturnedTurma({
        status: TurmaStatusEnum.DISPONIVEL,
        dataFim: tomorrow,
        quantidadeVagas: 10,
      });

      turma.usuarios = [];

      const spyFindOne = jest
        .spyOn(defaultManager, 'findOne')
        .mockResolvedValue(turma);

      const spySave = jest
        .spyOn(defaultManager, 'save')
        .mockResolvedValue(turma);

      await expect(
        service.matricularAluno(usuario, [turma.id]),
      ).resolves.toBeUndefined();

      expect(spyFindOne).toHaveBeenCalledWith(TurmaEntity, {
        where: { id: turma.id },
        relations: { usuarios: true },
      });
      expect(turma.usuarios).toContain(usuario);
      expect(spySave).toHaveBeenCalledWith(TurmaEntity, turma);
      expect(turma.status).toBe(TurmaStatusEnum.DISPONIVEL);
    });

    it('deve lançar NotFoundException se a turma não for encontrada', async () => {
      const usuario = { id: 'usuario-1' } as UsuarioEntity;

      defaultManager.findOne.mockResolvedValue(null);

      await expect(
        service.matricularAluno(usuario, ['turma-inexistente']),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se a turma não estiver disponível', async () => {
      const usuario = { id: 'usuario-1' } as UsuarioEntity;
      const turma = makeReturnedTurma({
        status: TurmaStatusEnum.ENCERRADO,
      });

      defaultManager.findOne.mockResolvedValue(turma);

      await expect(
        service.matricularAluno(usuario, [turma.id]),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar ConflictException se a turma não tiver vagas disponíveis', async () => {
      const usuario = { id: 'usuario-1' } as UsuarioEntity;
      const turma = makeReturnedTurma({
        status: TurmaStatusEnum.DISPONIVEL,
        quantidadeVagas: 1,
      });
      turma.usuarios = [{ id: 'usuario-2' } as UsuarioEntity];

      defaultManager.findOne.mockResolvedValue(turma);

      await expect(
        service.matricularAluno(usuario, [turma.id]),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelarMatriculaAluno', () => {
    it('deve cancelar a matrícula do aluno nas turmas informadas', async () => {
      const usuarioId = 'usuario-uuid-1';
      const turmasIds = ['turma-uuid-1', 'turma-uuid-2'];
      const turma = makeReturnedTurma();

      const mockRemove = jest.fn().mockResolvedValue(undefined);

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue({
        relation: jest.fn().mockReturnValue({
          of: jest.fn().mockReturnValue({
            remove: mockRemove,
          }),
        }),
      } as unknown as SelectQueryBuilder<TurmaEntity>);

      repo.findOne.mockResolvedValue(turma);
      repo.save.mockResolvedValue(turma);

      await expect(
        service.cancelarMatriculaAluno(usuarioId, turmasIds),
      ).resolves.toBeUndefined();

      expect(mockRemove).toHaveBeenCalledWith(turmasIds);
    });
  });
});
