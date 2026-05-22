import { CreateUsuarioDto } from '../../dtos/create-usuario.dto';

export const makeUsuarioCreated = (
  overrides: Partial<CreateUsuarioDto> = {},
): CreateUsuarioDto => ({
  email: 'test@test.com',
  nome: 'Test',
  turmasIds: [],
  ...overrides,
});
