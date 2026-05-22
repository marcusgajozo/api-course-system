import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

import { makeTurma } from '../__test__/utils/make-turma';
import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmasService } from './turmas.service';

describe('(Unit test) TurmasService', () => {
  let service: TurmasService;
  let repo: jest.Mocked<Repository<TurmaEntity>>;

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
      ],
    }).compile();

    service = module.get(TurmasService);
    repo = module.get(getRepositoryToken(TurmaEntity));
  });

  describe('create', () => {
    it('deve criar e retornar o curso', async () => {
      const dto: CreateTurmaDto = {
        titulo: 'Turma de NestJS',
        descricao: 'Aprenda NestJS do zero',
        urlImagem: 'http://example.com/nestjs.png',
      };
      const curso = makeTurma(dto);

      repo.create.mockReturnValue(dto as unknown as TurmaEntity);
      repo.save.mockResolvedValue(curso);

      await expect(service.create(dto)).resolves.toEqual(curso);
    });
  });

  describe('findOne', () => {
    it('deve retornar o curso quando encontrado', async () => {
      const curso = makeTurma();
      repo.findOneBy.mockResolvedValue(curso);

      await expect(service.findOne(curso.id)).resolves.toEqual(curso);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o curso', async () => {
      const curso = makeTurma();
      const cursoAtualizado = makeTurma({ titulo: 'Turma de NestJS Avançado' });

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(curso);
      repo.save.mockResolvedValue(cursoAtualizado);

      const result = await service.update(curso.id, {
        titulo: 'Turma de NestJS Avançado',
      });

      expect(result).toEqual(cursoAtualizado);
      expect(spyFindOne).toHaveBeenCalledWith(curso.id);
    });

    it('deve lançar NotFoundException para curso inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { titulo: 'Novo titulo' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o curso sem lançar exceção', async () => {
      const curso = makeTurma();
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(curso);
      const spyDelete = jest.spyOn(repo, 'delete');

      await service.remove(curso.id);

      expect(spyFindOne).toHaveBeenCalledWith(curso.id);
      expect(spyDelete).toHaveBeenCalledWith(curso.id);
    });

    it('deve lançar NotFoundException para curso inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar turmas paginados', async () => {
      const pagination: PaginationQueryDto = { page: 1, limit: 10 };
      const turmas = [makeTurma()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([turmas, turmas.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([turmas, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });
});
