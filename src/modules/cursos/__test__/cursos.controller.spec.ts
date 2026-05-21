import { Test } from '@nestjs/testing';

import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '@/common/dtos/pagination.dto';

import { CursosController } from '../controllers/cursos.controller';
import { CreateCursoDto } from '../dtos/create-curso.dto';
import { CursoEntity } from '../entities/curso.entity';
import { TemasEnum } from '../enums/temas.enum';
import { CursosService } from '../services/cursos.service';
import { makeCurso } from './utils/make-curso';

describe('CursosController', () => {
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

      await expect(controller.create(dto)).resolves.toEqual(curso);
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
});
