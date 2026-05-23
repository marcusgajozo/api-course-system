import { CancelarMatriculaDto } from '../../dtos/cancelar-matricula.dto';

export const makeCancelarMatricula = (
  overrides: Partial<CancelarMatriculaDto> = {},
): CancelarMatriculaDto => ({
  usuarioId: '',
  turmasIds: [],
  ...overrides,
});
