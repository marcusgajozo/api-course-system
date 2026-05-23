import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArrayOverlap, ILike, Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { TemasEnum } from '@/modules/cursos/enums/temas.enum';
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';

import { makeCursoCreated } from '../__test__/utils/make-curso-created';
import { makeReturnedCurso } from '../__test__/utils/make-returned-curso';
import { CursoEntity } from '../entities/curso.entity';
import { CursosService } from './cursos.service';

describe('(Unit test) CursosService', () => {
  let service: CursosService;
  let repo: jest.Mocked<Repository<CursoEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        {
          provide: getRepositoryToken(CursoEntity),
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

    service = module.get(CursosService);
    repo = module.get(getRepositoryToken(CursoEntity));
  });

  describe('create', () => {
    it('deve criar e retornar o curso', async () => {
      const dto = makeCursoCreated();
      const curso = makeReturnedCurso(dto);

      repo.create.mockReturnValue(curso);
      repo.save.mockResolvedValue(curso);

      await expect(service.create(dto)).resolves.toEqual(curso);
    });
  });

  describe('findOne', () => {
    it('deve retornar o curso quando encontrado', async () => {
      const curso = makeReturnedCurso();
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
      const curso = makeReturnedCurso();
      const cursoAtualizado = makeReturnedCurso({
        titulo: 'Curso de NestJS Avançado',
      });

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(curso);
      repo.save.mockResolvedValue(cursoAtualizado);

      const result = await service.update(curso.id, {
        titulo: 'Curso de NestJS Avançado',
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
      const curso = makeReturnedCurso();
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
    it('deve retornar cursos paginados', async () => {
      const pagination: PaginationQueryDto = { page: 1, limit: 10 };
      const cursos = [makeReturnedCurso()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([cursos, cursos.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([cursos, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });

  describe('findAllCursosTurmaDisponivel', () => {
    it('deve retornar cursos com turmas disponíveis aplicando paginação', async () => {
      const query = { page: 1, limit: 10 };
      const cursos = [makeReturnedCurso()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([cursos, 1]);

      const result = await service.findAllCursosTurmaDisponivel(query);

      expect(result).toEqual([cursos, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { turmas: { status: TurmaStatusEnum.DISPONIVEL } },
        relations: { turmas: true },
      });
    });

    it('deve aplicar os filtros de titulo e temas', async () => {
      const query = {
        page: 1,
        limit: 10,
        titulo: 'nest',
        temas: [TemasEnum.TECNOLOGIA],
      };
      const cursos = [makeReturnedCurso()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([cursos, 1]);

      await service.findAllCursosTurmaDisponivel(query);

      expect(spyFindAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          turmas: { status: TurmaStatusEnum.DISPONIVEL },
          titulo: ILike('%nest%'),
          temas: ArrayOverlap([TemasEnum.TECNOLOGIA]),
        },
        relations: { turmas: true },
      });
    });
  });
});
