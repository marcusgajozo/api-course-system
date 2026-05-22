import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';

import { makeTurma } from '../__test__/utils/make-turma';
import { CreateTurmaDto } from '../dtos/create-turma.dto';
import { UpdateTurmaDto } from '../dtos/update-turma.dto';
import { TurmaEntity } from '../entities/turma.entity';
import { TurmasService } from '../services/turmas.service';
import { TurmasController } from './turmas.controller';

describe('(Unit test) TurmasController', () => {
  let controller: TurmasController;
  let service: jest.Mocked<TurmasService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TurmasController],
      providers: [
        {
          provide: TurmasService,
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

    controller = module.get(TurmasController);
    service = module.get(TurmasService);
  });

  describe('create', () => {
    it('deve chamar service.create e retornar o curso', async () => {
      const dto: CreateTurmaDto = {
        titulo: 'NestJS',
        descricao: 'Turma de NestJS',

        urlImagem: 'http://example.com/image.png',
      };

      const curso = makeTurma(dto);

      const spyCreate = jest.spyOn(service, 'create').mockResolvedValue(curso);

      await expect(controller.create(dto)).resolves.toEqual(
        new ResponseDto<TurmaEntity>(curso),
      );
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll e retornar os turmas paginados', async () => {
      const turmas = [makeTurma(), makeTurma()];
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      const expected: PaginatedResponseDto<TurmaEntity> = {
        data: turmas,
        meta: {
          page: query.page,
          limit: query.limit,
          totalCount: 2,
          totalPages: 1,
        },
      };

      const spyFindAll = jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([turmas, turmas.length]);

      await expect(controller.findAll(query)).resolves.toEqual(expected);
      expect(spyFindAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne e retornar o curso', async () => {
      const curso = makeTurma();
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(curso);

      await expect(controller.findOne(id)).resolves.toEqual(
        new ResponseDto<TurmaEntity>(curso),
      );
      expect(spyFindOne).toHaveBeenCalledWith(id);
    });

    it('deve lançar erro se curso não for encontrado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Turma não encontrado'));

      await expect(controller.findOne(id)).rejects.toThrow(
        'Turma não encontrado',
      );
      expect(spyFindOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('deve chamar service.update e retornar o curso atualizado', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateTurmaDto = {
        descricao: 'Turma atualizado',
      };

      const cursoAtualizado = makeTurma({
        ...dto,
        updatedAt: new Date(),
      });

      const responseTurma: ResponseDto<TurmaEntity> = {
        data: cursoAtualizado,
      };

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockResolvedValue(cursoAtualizado);

      await expect(controller.update(id, dto)).resolves.toEqual(responseTurma);
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
