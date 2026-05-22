import { MatricularDto } from '../../dtos/matricular.dto';

export const makeMatricular = (
  overrides: Partial<MatricularDto> = {},
): MatricularDto => ({
  usuarioId: '',
  turmasIds: [],
  ...overrides,
});
