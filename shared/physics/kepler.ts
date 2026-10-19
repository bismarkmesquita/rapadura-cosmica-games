import { TAU } from '../math/format';

/** Resolve a equação de Kepler M = E − e·sen(E) pelo método de Newton. */
export function anomaliaExcentrica(anomaliaMedia: number, e: number, iteracoes = 8): number {
  let E = anomaliaMedia;
  for (let i = 0; i < iteracoes; i++) E -= (E - e * Math.sin(E) - anomaliaMedia) / (1 - e * Math.cos(E));
  return E;
}

export interface Orbita {
  /** Semieixo maior (qualquer unidade). */
  a: number;
  /** Excentricidade, de 0 (círculo) a quase 1. */
  e: number;
  /** Período (qualquer unidade de tempo). */
  T: number;
  /** Anomalia média no tempo zero, em radianos. */
  M0: number;
  /** Argumento do periélio, em radianos. */
  w: number;
}

/**
 * Posição no plano da órbita, com o foco (a estrela) na origem.
 * Devolve [x, y, anomalia média].
 */
export function posicaoOrbital(o: Orbita, t: number): [number, number, number] {
  const anomaliaMedia = o.M0 + (TAU * t) / o.T;
  const E = anomaliaExcentrica(anomaliaMedia, o.e);
  const x = o.a * (Math.cos(E) - o.e);
  const y = o.a * Math.sqrt(1 - o.e * o.e) * Math.sin(E);
  return [x * Math.cos(o.w) - y * Math.sin(o.w), x * Math.sin(o.w) + y * Math.cos(o.w), anomaliaMedia];
}

/** 3ª lei de Kepler para o Sistema Solar: T (anos) a partir de a (UA). */
export const periodoEmAnos = (aEmUA: number): number => Math.pow(aEmUA, 1.5);

/** Velocidade orbital (km/s) em volta do Sol pela equação vis-viva, com r e a em UA. */
export function visVivaSolar(rEmUA: number, aEmUA: number): number {
  return 29.78 * Math.sqrt(Math.max(0, 2 / rEmUA - 1 / aEmUA));
}
