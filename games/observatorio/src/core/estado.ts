import type { Fase } from '../types';

/** Estado global mínimo do jogo. O modo Avançado e as fases concluídas valem para o jogo todo. */
export const estado = {
  fase: null as Fase | null,
  pausado: false,
  avancado: false,
  /** Fases concluídas: cada uma acende um tracinho no painel das missões e um ✓ no menu. */
  concluidas: new Set<number>(),
};
