/**
 * Réguas da astronomia: ângulos, paralaxe, fluxo e magnitudes. Unidades da própria astronomia (segundos de
 * arco, parsecs, magnitudes), como nas provas de olimpíada.
 */
import { MAG_BOL_SOL } from './constantes';

/** Segundos de arco num radiano. É também o número de UA num parsec. */
export const SEGUNDOS_POR_RADIANO = 206_264.806;

/** Ângulo, em radianos, que um objeto de diâmetro D ocupa visto à distância d (mesma unidade). */
export const diametroAngular = (D: number, d: number): number => 2 * Math.atan(D / (2 * d));

export const radianosParaSegundos = (rad: number): number => rad * SEGUNDOS_POR_RADIANO;
export const radianosParaGraus = (rad: number): number => (rad * 180) / Math.PI;

/** Diâmetro real a partir do ângulo em segundos de arco (ângulo pequeno), na unidade de d. */
export const diametroPorAngulo = (thetaSeg: number, d: number): number =>
  (thetaSeg * d) / SEGUNDOS_POR_RADIANO;

/** Distância em parsecs para uma paralaxe em segundos de arco. */
export const distanciaPorParalaxe = (pSeg: number): number => 1 / pSeg;

/** Fluxo, em W/m², a uma distância d (m) de uma fonte de luminosidade L (W). */
export const fluxo = (L: number, d: number): number => L / (4 * Math.PI * d * d);

/** m₁ − m₂ a partir dos fluxos. */
export const diferencaMagnitude = (F1: number, F2: number): number => -2.5 * Math.log10(F1 / F2);

/** F₁/F₂: quantas vezes o objeto de magnitude m₁ brilha mais que o de magnitude m₂. */
export const razaoDeBrilho = (m1: number, m2: number): number => 10 ** (-0.4 * (m1 - m2));

export const magnitudeAbsoluta = (m: number, dPc: number): number => m - 5 * Math.log10(dPc / 10);
export const magnitudeAparente = (M: number, dPc: number): number => M + 5 * Math.log10(dPc / 10);
/** Distância em parsecs pelo módulo de distância m − M. */
export const distanciaPorModulo = (m: number, M: number): number => 10 ** ((m - M + 5) / 5);

/** Luminosidade, em luminosidades solares, a partir da magnitude bolométrica absoluta. */
export const luminosidadePorMagBol = (Mbol: number): number => 10 ** (-0.4 * (Mbol - MAG_BOL_SOL));

/** Relação período–luminosidade das Cefeidas clássicas, banda V (Benedict et al., 2007). Período em dias. */
export const magnitudeCefeida = (periodoDias: number): number => -2.43 * (Math.log10(periodoDias) - 1) - 4.05;
