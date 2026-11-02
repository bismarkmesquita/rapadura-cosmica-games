import type { Fase } from '../types';

/** Estado global mínimo do jogo. O modo Avançado e as réguas valem para todas as fases. */
export const estado = {
  fase: null as Fase | null,
  pausado: false,
  avancado: false,
  /** Fases concluídas: cada uma acende uma régua da escada de distâncias. */
  reguas: new Set<number>(),
};
