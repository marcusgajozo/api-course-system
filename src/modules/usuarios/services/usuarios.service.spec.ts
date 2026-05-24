import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';

import { TurmasService } from '@/modules/turmas/services/turmas.service';

import { makeCancelarMatricula } from '../__test__/utils/make-cancelar-matricula';
import { makeMatricular } from '../__test__/utils/make-matricular';
import { makeReturnedUsuario } from '../__test__/utils/make-returned-usuario';
import { makeUsuarioCreated } from '../__test__/utils/make-usuario-created';
import { UsuarioQueryDto } from '../dtos/filter-query.dto';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('(Unit test) UsuariosService', () => {
  let service: UsuariosService;
  let repo: jest.Mocked<Repository<UsuarioEntity>>;
  let turmasService: jest.Mocked<TurmasService>;
  let dataSource: jest.Mocked<DataSource>;

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
          provide: TurmasService,
          useValue: {
            matricularAluno: jest.fn(),
            cancelarMatriculaAluno: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsuariosService);
    repo = module.get(getRepositoryToken(UsuarioEntity));
    turmasService = module.get(TurmasService);
    dataSource = module.get(DataSource);
  });

  describe('create', () => {
    it('deve criar usuário direto quando turmasIds não é informado', async () => {
      const dto = makeUsuarioCreated({ turmasIds: undefined });
      const usuario = makeReturnedUsuario(dto);

      const spySave = jest.spyOn(repo, 'save').mockResolvedValue(usuario);
      const spyTransaction = jest.spyOn(dataSource, 'transaction');

      await expect(service.create(dto)).resolves.toEqual(usuario);
      expect(spySave).toHaveBeenCalledWith(dto);
      expect(spyTransaction).not.toHaveBeenCalled();
    });

    it('deve criar usuário direto quando turmasIds é vazio', async () => {
      const dto = makeUsuarioCreated();
      const usuario = makeReturnedUsuario(dto);

      const spySave = jest.spyOn(repo, 'save').mockResolvedValue(usuario);
      const spyTransaction = jest.spyOn(dataSource, 'transaction');

      await expect(service.create(dto)).resolves.toEqual(usuario);
      expect(spySave).toHaveBeenCalledWith(dto);
      expect(spyTransaction).not.toHaveBeenCalled();
    });

    it('deve criar usuário e matricular nas turmas em transação', async () => {
      const dto = makeUsuarioCreated({ turmasIds: ['turma-uuid-1'] });
      const usuario = makeReturnedUsuario(dto);

      const managerCreate = jest.fn().mockReturnValue(usuario);
      const managerSave = jest.fn().mockResolvedValue(usuario);
      const managerfindOneOrFail = jest.fn().mockResolvedValue(usuario);

      const manager = {
        create: managerCreate,
        save: managerSave,
        findOneOrFail: managerfindOneOrFail,
      } as unknown as EntityManager;

      (dataSource.transaction as jest.Mock).mockImplementation(
        (cb: (manager: EntityManager) => Promise<UsuarioEntity>) => cb(manager),
      );

      const spyMatricularAlunos = jest.spyOn(turmasService, 'matricularAluno');

      await expect(service.create(dto)).resolves.toEqual(usuario);
      expect(managerCreate).toHaveBeenCalledWith(UsuarioEntity, dto);
      expect(managerSave).toHaveBeenCalledWith(usuario);
      expect(spyMatricularAlunos).toHaveBeenCalledWith(
        usuario,
        dto.turmasIds,
        manager,
      );
    });

    it('deve propagar exceção e não criar usuário quando matrícula falha', async () => {
      const dto = makeUsuarioCreated({ turmasIds: ['turma-uuid-1'] });
      const usuario = makeReturnedUsuario(dto);

      const manager = {
        create: jest.fn().mockReturnValue(usuario),
        save: jest.fn().mockResolvedValue(usuario),
      } as unknown as EntityManager;

      (dataSource.transaction as jest.Mock).mockImplementation(
        (cb: (manager: EntityManager) => Promise<UsuarioEntity>) => cb(manager),
      );

      jest
        .spyOn(turmasService, 'matricularAluno')
        .mockRejectedValue(new ConflictException('Turma sem vagas'));

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('deve retornar o usuário quando encontrado', async () => {
      const usuario = makeReturnedUsuario();
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(usuario);

      await expect(service.findOne(usuario.id)).resolves.toEqual(usuario);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o usuário', async () => {
      const usuario = makeReturnedUsuario();

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);
      const spySave = jest.spyOn(repo, 'save').mockResolvedValue(usuario);

      const result = await service.update(usuario.id, { nome: 'Novo nome' });

      expect(result).toEqual(usuario);
      expect(spyFindOne).toHaveBeenCalledWith(usuario.id);
      expect(spySave).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException para usuário inexistente', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.update('id-inexistente', { nome: 'Novo nome' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o usuário sem lançar exceção', async () => {
      const usuario = makeReturnedUsuario();
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);
      const spyDelete = jest.spyOn(repo, 'delete');

      await service.remove(usuario.id);

      expect(spyFindOne).toHaveBeenCalledWith(usuario.id);
      expect(spyDelete).toHaveBeenCalledWith(usuario.id);
    });

    it('deve lançar NotFoundException para usuário inexistente', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar usuários paginados', async () => {
      const pagination: UsuarioQueryDto = { page: 1, limit: 10 };
      const usuarios = [makeReturnedUsuario()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([usuarios, usuarios.length]);

      const result = await service.findAll(pagination);

      expect(result).toEqual([usuarios, 1]);
      expect(spyFindAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
    });

    it('deve aplicar filtros de nome e email', async () => {
      const query: UsuarioQueryDto = {
        page: 1,
        limit: 10,
        nome: 'João',
        email: 'joao@',
      };
      const usuarios = [makeReturnedUsuario()];

      const spyFindAndCount = jest
        .spyOn(repo, 'findAndCount')
        .mockResolvedValue([usuarios, usuarios.length]);

      const result = await service.findAll(query);

      expect(result).toEqual([usuarios, 1]);

      expect(spyFindAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: {
            nome: ILike(`%${query.nome}%`),
            email: ILike(`%${query.email}%`),
          },
        }),
      );
    });
  });

  describe('matricular', () => {
    it('deve matricular usuario', async () => {
      const dto = makeMatricular();
      const usuario = makeReturnedUsuario();

      const spyFindOn = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);

      (dataSource.transaction as jest.Mock).mockImplementation(
        (cb: (manager: EntityManager) => Promise<void>) =>
          cb({} as EntityManager),
      );
      const spyDataSource = jest.spyOn(dataSource, 'transaction');

      const spyMatricularAluno = jest
        .spyOn(turmasService, 'matricularAluno')
        .mockResolvedValue(undefined);

      await expect(service.matricular({ ...dto })).resolves.toBeUndefined();
      expect(spyMatricularAluno).toHaveBeenCalledWith(
        usuario,
        dto.turmasIds,
        {} as EntityManager,
      );
      expect(spyDataSource).toHaveBeenCalled();
      expect(spyFindOn).toHaveBeenCalled();
    });

    it('deve retornar um erro por não encontrar usuário', async () => {
      const dto = makeMatricular();
      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(service.matricular({ ...dto })).rejects.toThrow(
        NotFoundException,
      );
      expect(spyFindOne).toHaveBeenCalled();
    });

    it('deve retornar erro se transaction falhar', async () => {
      const dto = makeMatricular();
      const usuario = makeReturnedUsuario();

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);

      (dataSource.transaction as jest.Mock).mockImplementation(
        (cb: (manager: EntityManager) => Promise<void>) =>
          cb({} as EntityManager),
      );

      const spyMatricularAluno = jest
        .spyOn(turmasService, 'matricularAluno')
        .mockRejectedValue(new ConflictException());

      await expect(service.matricular({ ...dto })).rejects.toThrow(
        ConflictException,
      );

      expect(spyMatricularAluno).toHaveBeenCalled();
      expect(spyFindOne).toHaveBeenCalled();
    });
  });

  describe('cancelarMatricula', () => {
    it('deve cancelar a matricula de usuário', async () => {
      const dto = makeCancelarMatricula();
      const usuario = makeReturnedUsuario();

      const spyFindOne = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(usuario);

      const spyCancelarMatriculaAluno = jest.spyOn(
        turmasService,
        'cancelarMatriculaAluno',
      );

      await expect(
        service.cancelarMatricula({ ...dto }),
      ).resolves.toBeUndefined();
      expect(spyFindOne).toHaveBeenCalledWith(dto.usuarioId);
      expect(spyCancelarMatriculaAluno).toHaveBeenCalledWith(
        dto.usuarioId,
        dto.turmasIds,
      );
    });
  });
});
