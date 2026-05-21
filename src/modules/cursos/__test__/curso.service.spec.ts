import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { TemasEnum } from '../enums/temas.enum';
import { CursosService } from '../services/cursos.service';

describe('(Unit Tests) CursoService', () => {
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
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CursosService);
    repo = module.get(getRepositoryToken(CursoEntity));
  });

  it('deve criar um curso', () => {
    const id = 'b3d6f1a2-4c2e-4f3d-9a1b-2e5d7c8f0e4a';

    const cursoData: CreateCursoDto = {
      titulo: 'Curso de NestJS',
      descricao: 'Aprenda NestJS do zero',
      temas: [TemasEnum.INOVACAO],
      urlImagem: 'http://example.com/nestjs.png',
    };
    const cursoSalvo = { id, ...cursoData } as unknown as CursoEntity;

    repo.create.mockReturnValue(cursoData as unknown as CursoEntity);
    repo.save.mockResolvedValue(cursoSalvo);

    return expect(service.create(cursoData)).resolves.toEqual(cursoSalvo);
  });

  it('deve atualizar um curso', () => {
    const id = 'b3d6f1a2-4c2e-4f3d-9a1b-2e5d7c8f0e4a';

    const cursoExistente: CursoEntity = {
      id,
      titulo: 'Curso de NestJS',
      descricao: 'Aprenda NestJS do zero',
      temas: [TemasEnum.INOVACAO],
      urlImagem: 'http://example.com/nestjs.png',
      createdAt: new Date(),
    };

    const cursoAtualizado = {
      ...cursoExistente,
      titulo: 'Curso de NestJS Avançado',
    };

    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(cursoExistente);

    repo.save.mockResolvedValue(cursoAtualizado);

    void expect(
      service.update(id, { titulo: 'Curso de NestJS Avançado' }),
    ).resolves.toEqual(cursoAtualizado);

    expect(findOneSpy).toHaveBeenCalledWith(id);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
  });
});
