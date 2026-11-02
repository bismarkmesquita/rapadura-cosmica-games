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
  magAparente: -26.74,
  magAbsoluta: 4.83,
  magBol: MAG_BOL_SOL,
};

export const LUA = {
  diametroKm: 3_474.8,
  distanciaKm: 384_400,
  /** Médias do perigeu e do apogeu: a distância muda um pouco a cada mês. */
  perigeuKm: 362_600,
  apogeuKm: 405_400,
};

/** Pupila do olho adaptado ao escuro. */
export const PUPILA_MM = 7;
/** Meio da faixa visível, usado nas contas de resolução. */
export const LAMBDA_VISIVEL_NM = 550;

/** Magnitude aparente (banda V) e distância. A distância de Rigel é incerta (Hipparcos, 2007). */
export const ESTRELAS = {
  sirius: { nome: 'Sirius', mag: -1.46, distPc: 2.64 },
  vega: { nome: 'Vega', mag: 0.03, distPc: 7.68 },
  rigel: { nome: 'Rigel', mag: 0.13, distPc: 264 },
  proxima: { nome: 'Proxima Centauri', mag: 11.13, paralaxe: 0.768 },
};
