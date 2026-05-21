import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';

import { makeCurso } from '../__test__/utils/make-curso';
import { CursosController } from '../controllers/cursos.controller';
import { CreateCursoDto } from '../dtos/create-curso.dto';
import { UpdateCursoDto } from '../dtos/update-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { TemasEnum } from '../enums/temas.enum';
import { CursosService } from '../services/cursos.service';

describe('(Unit test) CursosController', () => {
  let controller: CursosController;
  let service: jest.Mocked<CursosService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CursosController],
      providers: [
        {
          provide: CursosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CursosController);
    service = module.get(CursosService);
  });

  describe('create', () => {
    it('deve chamar service.create e retornar o curso', async () => {
      const dto: CreateCursoDto = {
        titulo: 'NestJS',
        descricao: 'Curso de NestJS',
        temas: [TemasEnum.AGRO, TemasEnum.INOVACAO],
        urlImagem: 'http://example.com/image.png',
      };

      const curso = makeCurso(dto);

      const spyCreate = jest.spyOn(service, 'create').mockResolvedValue(curso);

      await expect(controller.create(dto)).resolves.toEqual(
        new ResponseDto<CursoEntity>(curso),
      );
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll e retornar os cursos paginados', async () => {
      const cursos = [makeCurso(), makeCurso()];
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      const expected: PaginatedResponseDto<CursoEntity> = {
        data: cursos,
        meta: {
          page: query.page,
          limit: query.limit,
          totalCount: 2,
          totalPages: 1,
        },
      };

      const spyFindAll = jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([cursos, cursos.length]);

      await expect(controller.findAll(query)).resolves.toEqual(expected);
      expect(spyFindAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne e retornar o curso', async () => {
      const curso = makeCurso();
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(curso);

      await expect(controller.findOne(id)).resolves.toEqual(
        new ResponseDto<CursoEntity>(curso),
      );
      expect(spyFindOne).toHaveBeenCalledWith(id);
    });

    it('deve lançar erro se curso não for encontrado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Curso não encontrado'));

      await expect(controller.findOne(id)).rejects.toThrow(
        'Curso não encontrado',
      );
      expect(spyFindOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('deve chamar service.update e retornar o curso atualizado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateCursoDto = {
        descricao: 'Curso atualizado',
      };

      const cursoAtualizado = makeCurso({
        ...dto,
        updatedAt: new Date(),
      });

      const responseCurso: ResponseDto<CursoEntity> = {
        data: cursoAtualizado,
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockResolvedValue(cursoAtualizado);

      await expect(controller.update(id, dto)).resolves.toEqual(responseCurso);
      expect(spyServiceUpdate).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove e retornar a resposta de sucesso', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const spyServiceRemove = jest.spyOn(service, 'remove');

      await expect(controller.remove(id)).resolves.toBeUndefined();
      expect(spyServiceRemove).toHaveBeenCalledWith(id);
    });
  });
});
