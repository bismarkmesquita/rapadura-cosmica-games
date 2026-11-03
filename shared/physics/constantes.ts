/**
 * Constantes e dados de astros das aulas de distâncias e de telescópios, num arquivo só.
 * Fontes: IAU 2015 (luminosidade e magnitude bolométrica do Sol), IAU 2012 (UA), Wikipédia (Sol, Lua,
 * estrelas) e Kepler & Saraiva, "Astronomia e Astrofísica" (UFRGS).
 */
export const UA_KM = 149_597_870.7;
export const PARSEC_ANOS_LUZ = 3.2616;
export const LUMINOSIDADE_SOL_W = 3.828e26;
export const MAG_BOL_SOL = 4.74;

export const SOL = {
  diametroKm: 1_392_700,
  temperaturaK: 5772,
  magAparente: -26.74,
  magAbsoluta: 4.83,
  magBol: MAG_BOL_SOL,
};

export const LUA = {
  diametroKm: 3_474.8,
  magCheia: -12.74,
  distanciaKm: 384_400,
  /** Médias do perigeu e do apogeu: a distância muda um pouco a cada mês. */
  perigeuKm: 362_600,
  apogeuKm: 405_400,
};

/** Vênus num brilho típico de "estrela d'alva" (no máximo chega a −4,9). */
export const VENUS_MAG = -4.5;
/** Estrela mais fraca que se vê a olho nu, num céu escuro. */
export const LIMITE_OLHO_NU_MAG = 6;

/** Pupila do olho adaptado ao escuro. */
export const PUPILA_MM = 7;
/** Meio da faixa visível, usado nas contas de resolução. */
export const LAMBDA_VISIVEL_NM = 550;

/**
 * Magnitude aparente (banda V), distância, temperatura da superfície (K) e luminosidade (L☉). A distância de
 * Rigel é incerta (Hipparcos, 2007). Spica: a estrela principal do par. Betelgeuse: temperatura de Levesque &
 * Massey (2020) e luminosidade de Joyce et al. (2020); outras estimativas dão de 65 mil a 87 mil L☉.
 */
export const ESTRELAS = {
  sirius: { nome: 'Sirius', mag: -1.46, distPc: 2.64 },
  vega: { nome: 'Vega', mag: 0.03, distPc: 7.68 },
  rigel: { nome: 'Rigel', mag: 0.13, distPc: 264 },
  proxima: { nome: 'Proxima Centauri', mag: 11.13, paralaxe: 0.768 },
  polaris: { nome: 'Polaris', mag: 1.98 },
  alcor: { nome: 'Alcor', mag: 4.01 },
  spica: { nome: 'Spica', mag: 0.97, temperaturaK: 25_300, luminosidade: 20_500 },
  betelgeuse: { nome: 'Betelgeuse', mag: 0.42, temperaturaK: 3_600, luminosidade: 87_000 },
};
