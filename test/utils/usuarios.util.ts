import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';

import { CursoEntity } from '@/modules/cursos/entities/curso.entity';
import { CreateUsuarioDto } from '@/modules/usuarios/dtos/create-usuario.dto';
import { UsuarioEntity } from '@/modules/usuarios/entities/usuario.entity';

import { beforeEachTestCurso } from './cursos.util';

export const routeUsuarioApi = '/api/usuarios/';

export const usuario: CreateUsuarioDto = {
  email: 'test@test.com',
  nome: 'Aprenda NestJS do zero',
  turmasIds: [faker.string.uuid(), faker.string.uuid()],
};

export const usuarioValido = structuredClone(usuario);

export async function beforeEachTestUsuario(
  usuarioRepo: Repository<UsuarioEntity>,
  cursoRepo: Repository<CursoEntity>,
) {
  await beforeEachTestCurso(cursoRepo);
  await usuarioRepo.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
}

export async function createUsuario(repo: Repository<UsuarioEntity>) {
  return await repo.save(repo.create(usuario));
}
