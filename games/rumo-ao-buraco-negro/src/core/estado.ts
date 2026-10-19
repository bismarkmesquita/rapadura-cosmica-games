import type { Fase } from '../types';

/** Estado global mínimo do jogo. */
export const estado = {
  fase: null as Fase | null,
  pausado: false,
  hudOculto: false,
};

export interface Nave {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Direção para onde a nave aponta, em radianos, no plano de voo. */
  ang: number;
  motor: boolean;
  trilha: [number, number][];
  /** Presa ao canhão de Newton (não sofre física). */
  acoplada: boolean;
  /** Velocidade de giro suavizada, usada para inclinar a nave nas curvas. */
  giro: number;
}

/** A nave usa coordenadas de um plano: x e y do jogo viram x e z na cena 3D. */
export const nave: Nave = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  ang: 0,
  motor: false,
  trilha: [],
  acoplada: false,
  giro: 0,
};

/** Coloca a nave parada numa posição nova, sem rastro. */
export function posicionaNave(p: Partial<Nave>): void {
  Object.assign(nave, { vx: 0, vy: 0, motor: false, trilha: [], acoplada: false, giro: 0 }, p);
}
