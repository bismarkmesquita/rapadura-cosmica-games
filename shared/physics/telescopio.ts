/**
 * Telescópios: aumento, razão focal, luz coletada, magnitude limite, resolução e escala de placa.
 * Comprimentos em milímetros e ângulos em segundos de arco, como nas provas de olimpíada.
 */
import { LAMBDA_VISIVEL_NM, PUPILA_MM } from './constantes';
import { SEGUNDOS_POR_RADIANO } from './distancias';

/** Aumento: distância focal da objetiva dividida pela da ocular. */
export const aumento = (Fobj: number, focular: number): number => Fobj / focular;

/** Razão focal (o "f/" do telescópio). */
export const razaoFocal = (F: number, D: number): number => F / D;

/** Aumento útil máximo, pela regra prática de 2 vezes a abertura em milímetros. */
export const aumentoMaximoUtil = (Dmm: number): number => 2 * Dmm;

/** Quantas vezes mais luz a abertura junta que a pupila do olho. */
export const ganhoDeLuz = (Dmm: number, pupilaMm = PUPILA_MM): number => (Dmm / pupilaMm) ** 2;

/** Magnitude limite visual aproximada: 6 a olho nu, mais 5·log₁₀(D/d). */
export const magnitudeLimite = (Dmm: number, pupilaMm = PUPILA_MM): number =>
  6 + 5 * Math.log10(Dmm / pupilaMm);

/** Resolução pelo critério de Rayleigh, em segundos de arco. */
export const resolucaoRayleigh = (Dmm: number, lambdaNm = LAMBDA_VISIVEL_NM): number =>
  ((1.22 * lambdaNm * 1e-9) / (Dmm * 1e-3)) * SEGUNDOS_POR_RADIANO;

/** Escala de placa: segundos de arco do céu em cada milímetro do sensor. */
export const escalaDePlaca = (Fmm: number): number => SEGUNDOS_POR_RADIANO / Fmm;

/** Ângulo do eixo polar de uma montagem equatorial com o horizonte: a latitude do lugar (em módulo). */
export const anguloEixoPolar = (latitudeGraus: number): number => Math.abs(latitudeGraus);
