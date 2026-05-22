import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';

import { makeReturnedTurma } from '../__test__/utils/make-returned-turma';
import { makeTurmaCreated } from '../__test__/utils/make-turma-created';
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
    it('deve chamar service.create e retornar a turma', async () => {
      const dto = makeTurmaCreated();
      const turma = makeReturnedTurma(dto);

      const spyCreate = jest.spyOn(service, 'create').mockResolvedValue(turma);

      await expect(controller.create(dto)).resolves.toEqual(
        new ResponseDto<TurmaEntity>(turma),
      );
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });

    it('deve lançar erro se curso não for encontrado', async () => {
      const dto = makeTurmaCreated();

      const spyCreate = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll e retornar as turmas paginados', async () => {
      const turmas = [makeReturnedTurma(), makeReturnedTurma()];
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
    it('deve chamar service.findOne e retornar a turma', async () => {
      const turma = makeReturnedTurma();

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(turma);

      await expect(controller.findOne(turma.id)).resolves.toEqual(
        new ResponseDto<TurmaEntity>(turma),
      );
      expect(spyFindOne).toHaveBeenCalledWith(turma.id);
    });

    it('deve lançar erro se turma não for encontrado', async () => {
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('')).rejects.toThrow(NotFoundException);
      expect(spyFindOne).toHaveBeenCalledWith('');
    });
  });

  describe('update', () => {
    it('deve chamar service.update e retornar a turma atualizado', async () => {
      const turma = makeReturnedTurma();

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockResolvedValue(turma);

      await expect(controller.update(turma.id, turma)).resolves.toEqual(
        new ResponseDto<TurmaEntity>(turma),
      );
      expect(spyServiceUpdate).toHaveBeenCalledWith(turma.id, turma);
    });

    it('deve lançar erro se turma não for encontrado', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.update('', {})).rejects.toThrow(
        NotFoundException,
      );

      expect(spyServiceUpdate).toHaveBeenCalledWith('', {});
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove e retornar a resposta de sucesso', async () => {
      const spyServiceRemove = jest.spyOn(service, 'remove');

      await expect(controller.remove('')).resolves.toBeUndefined();
      expect(spyServiceRemove).toHaveBeenCalledWith('');
    });
  });
});
