import { Test } from '@nestjs/testing';

import { CursosController } from '../controllers/cursos.controller';
import { CreateCursoDto } from '../dtos/create-curso.dto';
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
});
