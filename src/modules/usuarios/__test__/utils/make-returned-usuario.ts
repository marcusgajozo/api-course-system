import { UsuarioEntity } from '../../entities/usuario.entity';

export const makeReturnedUsuario = (
  overrides: Partial<UsuarioEntity> = {},
): UsuarioEntity => ({
  id: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  nome: 'Teste',
  email: 'teste@teste.com',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  turmas: [],
  turmasIds: [],
  ...overrides,
});
