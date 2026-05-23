import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';
import { ResponseDto } from '@/common/dtos/response.dto';

import { makeReturnedUsuario } from '../__test__/utils/make-returned-usuario';
import { makeUsuarioCreated } from '../__test__/utils/make-usuario-created';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UsuariosService } from '../services/usuarios.service';
import { UsuariosController } from './usuarios.controller';

describe('(Unit test) UsuariosController', () => {
  let controller: UsuariosController;
  let service: jest.Mocked<UsuariosService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
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

    controller = module.get(UsuariosController);
    service = module.get(UsuariosService);
  });

  describe('create', () => {
    it('deve chamar service.create e retornar a usuario', async () => {
      const dto = makeUsuarioCreated();
      const usuario = makeReturnedUsuario(dto);

      const spyCreate = jest
        .spyOn(service, 'create')
        .mockResolvedValue(usuario);

      await expect(controller.create(dto)).resolves.toEqual(
        new ResponseDto<UsuarioEntity>(usuario),
      );
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });

    it('deve lançar erro se criar conta informando turma indisponível', async () => {
      const dto = makeUsuarioCreated();

      const spyCreate = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error());

      await expect(controller.create(dto)).rejects.toThrow(Error);
      expect(spyCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll e retornar as usuarios paginados', async () => {
      const usuarios = [makeReturnedUsuario(), makeReturnedUsuario()];
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      const expected: PaginatedResponseDto<UsuarioEntity> = {
        data: usuarios,
        meta: {
          page: query.page,
          limit: query.limit,
          totalCount: 2,
          totalPages: 1,
        },
      };

      const spyFindAll = jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([usuarios, usuarios.length]);

      await expect(controller.findAll(query)).resolves.toEqual(expected);
      expect(spyFindAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne e retornar a usuario', async () => {
      const usuario = makeReturnedUsuario();

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);

      await expect(controller.findOne(usuario.id)).resolves.toEqual(
        new ResponseDto<UsuarioEntity>(usuario),
      );
      expect(spyFindOne).toHaveBeenCalledWith(usuario.id);
    });

    it('deve lançar erro se usuario não for encontrado', async () => {
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('')).rejects.toThrow(NotFoundException);
      expect(spyFindOne).toHaveBeenCalledWith('');
    });
  });

  describe('update', () => {
    it('deve chamar service.update e retornar a usuario atualizado', async () => {
      const usuario = makeReturnedUsuario();

      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockResolvedValue(usuario);

      await expect(controller.update(usuario.id, usuario)).resolves.toEqual(
        new ResponseDto<UsuarioEntity>(usuario),
      );
      expect(spyServiceUpdate).toHaveBeenCalledWith(usuario.id, usuario);
    });

    it('deve lançar erro se usuario não for encontrado', async () => {
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
