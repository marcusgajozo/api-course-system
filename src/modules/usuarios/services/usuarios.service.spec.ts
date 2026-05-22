import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { makeReturnedCurso } from '@/modules/cursos/__test__/utils/make-returned-curso';
import { CursosService } from '@/modules/cursos/services/cursos.service';

import { makeReturnedUsuario } from '../__test__/utils/make-returned-usuario';
import { makeUsuarioCreated } from '../__test__/utils/make-usuario-created';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('(Unit test) UsuariosService', () => {
  let service: UsuariosService;
  let repo: jest.Mocked<Repository<UsuarioEntity>>;
  let cursosService: jest.Mocked<CursosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(UsuarioEntity),
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
      ],
    }).compile();

    service = module.get(UsuariosService);
    repo = module.get(getRepositoryToken(UsuarioEntity));
    cursosService = module.get(CursosService);
  });

  describe('create', () => {
    it('deve criar e retornar a usuario', async () => {
      const dto = makeUsuarioCreated();
      const usuario = makeReturnedUsuario(dto);
      const curso = makeReturnedCurso();

      const spyCursoFindOne = jest
        .spyOn(cursosService, 'findOne')
        .mockResolvedValue(curso);

      cursosService.findOne.mockResolvedValue(curso);
      repo.create.mockReturnValue(usuario);
      repo.save.mockResolvedValue(usuario);

      await expect(service.create(dto)).resolves.toEqual(usuario);

      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(dto.cursoId);
    });

    it('deve lançar NotFoundException se o curso não existir', async () => {
      const dto = makeUsuarioCreated();

      cursosService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('deve retornar a usuario quando encontrado', async () => {
      const usuario = makeReturnedUsuario();
      repo.findOneBy.mockResolvedValue(usuario);

      await expect(service.findOne(usuario.id)).resolves.toEqual(usuario);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar a usuario', async () => {
      const usuario = makeReturnedUsuario();

      const spyCursoFindOne = jest.spyOn(cursosService, 'findOne');

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);

      repo.save.mockResolvedValue(usuario);

      const result = await service.update(usuario.id, usuario);

      expect(result).toEqual(usuario);
      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(usuario.cursoId);
      expect(spyFindOne).toHaveBeenCalledWith(usuario.id);
    });

    it('deve lançar NotFoundException para usuario inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { titulo: 'Novo titulo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException para curso inexistente', async () => {
      const usuario = makeReturnedUsuario();
      repo.findOneBy.mockResolvedValue(usuario);

      const spyCursoFindOne = jest
        .spyOn(cursosService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(service.update(usuario.id, usuario)).rejects.toThrow(
        NotFoundException,
      );

      expect(spyCursoFindOne).toHaveBeenCalledTimes(1);
      expect(spyCursoFindOne).toHaveBeenCalledWith(usuario.cursoId);
    });
  });

  describe('remove', () => {
    it('deve remover o usuario sem lançar exceção', async () => {
      const usuario = makeReturnedUsuario();
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);
      const spyDelete = jest.spyOn(repo, 'delete');

      await service.remove(usuario.id);

      expect(spyFindOne).toHaveBeenCalledWith(usuario.id);
      expect(spyDelete).toHaveBeenCalledWith(usuario.id);
    });

    it('deve lançar NotFoundException para usuario inexistente', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar usuarios paginados', async () => {
      const pagination: PaginationQueryDto = { page: 1, limit: 10 };
      const usuarios = [makeReturnedUsuario()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([usuarios, usuarios.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([usuarios, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({ skip: 0, take: 10 });
    });
  });
});
