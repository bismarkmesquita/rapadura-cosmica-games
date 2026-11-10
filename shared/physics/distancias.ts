/**
 * Réguas da astronomia: ângulos, paralaxe, fluxo e magnitudes. Unidades da própria astronomia (segundos de
 * arco, parsecs, magnitudes), como nas provas de olimpíada.
 */
import { MAG_BOL_SOL, SOL, STEFAN_BOLTZMANN } from './constantes';

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

/** Luminosidade (W) de uma estrela de raio R (m) e temperatura da superfície T (K): Stefan–Boltzmann. */
export const luminosidadeEstelar = (R: number, T: number): number =>
  4 * Math.PI * R * R * STEFAN_BOLTZMANN * T ** 4;

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
/** Magnitude bolométrica absoluta a partir da luminosidade em luminosidades solares. */
export const magBolPorLuminosidade = (L: number): number => MAG_BOL_SOL - 2.5 * Math.log10(L);

/** Relação período–luminosidade das Cefeidas clássicas, banda V (Benedict et al., 2007). Período em dias. */
export const magnitudeCefeida = (periodoDias: number): number => -2.43 * (Math.log10(periodoDias) - 1) - 4.05;

/** Segunda constante de radiação, hc/k, em nm·K. */
const C2_NM_K = 14_387_769;

/**
 * Fração da energia de um corpo negro à temperatura T (K) emitida abaixo do comprimento de onda λ (nm).
 * Série exata da integral de Planck; com 100 termos o erro fica muito abaixo do que aparece no jogo.
 */
export function fracaoAbaixo(lambdaNm: number, T: number): number {
  const x = C2_NM_K / (lambdaNm * T);
  let soma = 0;
  for (let n = 1; n <= 100; n++)
    soma += (Math.exp(-n * x) / n) * (x ** 3 + (3 * x ** 2) / n + (6 * x) / n ** 2 + 6 / n ** 3);
  return (15 / Math.PI ** 4) * soma;
}

/** Faixas do espectro em nm: ultravioleta abaixo de 400, visível de 400 a 700, infravermelho acima de 700. */
export const FAIXAS_NM = { visivelMin: 400, visivelMax: 700 };

/** Fração da energia no ultravioleta, no visível e no infravermelho (somam 1). */
export function fracoesDoEspectro(T: number): { uv: number; visivel: number; iv: number } {
  const uv = fracaoAbaixo(FAIXAS_NM.visivelMin, T);
  const visivel = fracaoAbaixo(FAIXAS_NM.visivelMax, T) - uv;
  return { uv, visivel, iv: 1 - uv - visivel };
}

/** Intensidade de Planck em λ (nm), sem as constantes da frente: serve para desenhar a forma da curva. */
export const formaPlanck = (lambdaNm: number, T: number): number =>
  1 / (lambdaNm ** 5 * (Math.exp(C2_NM_K / (lambdaNm * T)) - 1));

/**
 * Correção bolométrica (BC = M_bol − M_V) aproximada por um corpo negro: compara a fração de luz visível da
 * estrela com a do Sol, calibrada pela do Sol (4,74 − 4,83 = −0,09). As tabelas reais usam a banda V e os
 * espectros de verdade, mas a tendência é a mesma: perto de zero para o Sol, negativa para quentes e frias.
 */
export function correcaoBolometrica(T: number): number {
  const bcSol = SOL.magBol - SOL.magAbsoluta;
  return bcSol + 2.5 * Math.log10(fracoesDoEspectro(T).visivel / fracoesDoEspectro(SOL.temperaturaK).visivel);
}
