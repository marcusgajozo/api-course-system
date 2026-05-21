import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { TemasEnum } from '../enums/temas.enum';
import { CursosService } from '../services/cursos.service';
import { makeCurso } from './utils/make-curso';

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
      const dto: CreateCursoDto = {
        titulo: 'Curso de NestJS',
        descricao: 'Aprenda NestJS do zero',
        temas: [TemasEnum.INOVACAO],
        urlImagem: 'http://example.com/nestjs.png',
      };
      const curso = makeCurso(dto);

      repo.create.mockReturnValue(dto as unknown as CursoEntity);
      repo.save.mockResolvedValue(curso);

      await expect(service.create(dto)).resolves.toEqual(curso);
    });
  });

  describe('findOne', () => {
    it('deve retornar o curso quando encontrado', async () => {
      const curso = makeCurso();
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
      const curso = makeCurso();
      const cursoAtualizado = makeCurso({ titulo: 'Curso de NestJS Avançado' });

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
      const curso = makeCurso();
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
      const cursos = [makeCurso()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([cursos, cursos.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([cursos, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });
});
