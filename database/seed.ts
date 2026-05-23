import 'dotenv/config';

import { faker } from '@faker-js/faker';

import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { TemasEnum } from '@/modules/cursos/enums/temas.enum';
import { TurmaEntity } from '@/modules/turmas/entities/turma.entity';
import { TurmaStatusEnum } from '@/modules/turmas/enums/turma-status.enum';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { AppDataSource } from './data-source';

async function bootstrap() {
  await AppDataSource.initialize();

  const cursoRepo = AppDataSource.getRepository(CursoEntity);
  const turmaRepo = AppDataSource.getRepository(TurmaEntity);
  const usuarioRepo = AppDataSource.getRepository(UsuarioEntity);

  const temas = Object.values(TemasEnum);

  const cursos: CursoEntity[] = [];
  for (let i = 0; i < 50; i++) {
    const numTemas = faker.number.int({ min: 1, max: 3 });
    const cursoTemas = faker.helpers.arrayElements(temas, numTemas);
    const curso = cursoRepo.create({
      titulo: faker.commerce.productName() + ' ' + faker.word.adjective(),
      descricao: faker.commerce.productDescription(),
      urlImagem: faker.image.url(),
      temas: cursoTemas,
    });
    cursos.push(await cursoRepo.save(curso));
  }

  const turmas: TurmaEntity[] = [];
  for (let i = 0; i < 50; i++) {
    const cursoAleatorio = faker.helpers.arrayElement(cursos);

    const dataInicio = faker.date.soon({ days: 30 });
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + faker.number.int({ min: 1, max: 6 }));

    const turma = turmaRepo.create({
      titulo: `Turma ${faker.string.alpha(2).toUpperCase()}-${faker.number.int({ min: 10, max: 99 })}`,
      descricao: faker.lorem.sentence(),
      quantidadeVagas: faker.number.int({ min: 10, max: 50 }),
      status: faker.helpers.arrayElement(Object.values(TurmaStatusEnum)),
      dataInicio,
      dataFim,
      curso: { id: cursoAleatorio.id },
    });
    turmas.push(await turmaRepo.save(turma));
  }

  for (let i = 0; i < 100; i++) {
    const numTurmas = faker.number.int({ min: 1, max: 3 });
    const turmasAleatorias = faker.helpers
      .arrayElements(turmas, numTurmas)
      .map((t) => ({ id: t.id }));

    const usuario = usuarioRepo.create({
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      turmas: turmasAleatorias,
    });
    await usuarioRepo.save(usuario);
  }

  await AppDataSource.destroy();
}

bootstrap().catch(() => {
  process.exit(1);
});
