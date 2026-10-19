import { TAU } from '../math/format';

/** Constantes físicas reais (SI). */
export const G = 6.674e-11;
export const C_LUZ = 2.998e8;
export const MASSA_SOL = 1.989e30;
export const MASSA_TERRA = 5.972e24;
export const RAIO_TERRA = 6.371e6;

export const velocidadeOrbital = (GM: number, r: number): number => Math.sqrt(GM / r);
export const velocidadeEscape = (GM: number, r: number): number => Math.sqrt((2 * GM) / r);
export const raioSchwarzschild = (massa: number): number => (2 * G * massa) / (C_LUZ * C_LUZ);

/** Densidade média dentro do raio de Schwarzschild: ρ = 3c⁶ / (32π G³ M²). */
export const densidadeBuracoNegro = (massa: number): number =>
  (3 * Math.pow(C_LUZ, 6)) / (32 * Math.PI * Math.pow(G, 3) * massa * massa);

/** Ritmo do tempo perto de uma massa, comparado a um observador muito longe: √(1 − Rs/r). */
export const ritmoDoTempo = (rs: number, r: number): number =>
  Math.sqrt(Math.max(0, 1 - rs / Math.max(r, rs)));

/** Aceleração da gravidade de uma massa central na origem, no plano. `suave` evita a singularidade. */
export function gravidadeCentral(GM: number, x: number, y: number, suave = 0): [number, number] {
  const r2 = x * x + y * y + suave;
  const r = Math.sqrt(r2);
  return [(-GM * x) / (r2 * r), (-GM * y) / (r2 * r)];
}

export interface Corpo {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Avança um corpo sob uma aceleração qualquer (Euler semi-implícito, em subpassos). */
export function avanca(
  corpo: Corpo,
  dt: number,
  aceleracao: (x: number, y: number) => [number, number],
  subpassos = 4,
): void {
  const h = dt / subpassos;
  for (let i = 0; i < subpassos; i++) {
    const [ax, ay] = aceleracao(corpo.x, corpo.y);
    corpo.vx += ax * h;
    corpo.vy += ay * h;
    corpo.x += corpo.vx * h;
    corpo.y += corpo.vy * h;
  }
}

export type DestinoTrajetoria = 'caiu' | 'orbita' | 'escapou';

/**
 * Trajetória de um projétil lançado horizontalmente do topo de um planeta,
 * em unidades adimensionais (GM = 1, raio do planeta = 0,9). Usada nas ilustrações.
 */
export function trajetoriaCanhao(
  r0: number,
  v: number,
  passos = 3200,
  dt = 0.005,
): { pts: [number, number][]; fim: DestinoTrajetoria } {
  const pts: [number, number][] = [];
  const c: Corpo = { x: 0, y: -r0, vx: v, vy: 0 };
  let ang = 0;
  let angAnt = Math.atan2(c.y, c.x);
  let fim: DestinoTrajetoria = 'orbita';
  for (let i = 0; i < passos; i++) {
    avanca(c, dt, (x, y) => gravidadeCentral(1, x, y), 1);
    pts.push([c.x, c.y]);
    const a = Math.atan2(c.y, c.x);
    let d = a - angAnt;
    d = ((((d + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    ang += d;
    angAnt = a;
    const r = Math.hypot(c.x, c.y);
    if (r < 0.9) {
      fim = 'caiu';
      break;
    }
    if (Math.abs(ang) >= TAU) break;
    if (r > 4) {
      fim = 'escapou';
      break;
    }
  }
  return { pts, fim };
}
