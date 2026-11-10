import { describe, expect, it } from 'vitest';
import {
  correcaoBolometrica,
  diametroAngular,
  diametroPorAngulo,
  distanciaPorModulo,
  distanciaPorParalaxe,
  fluxo,
  fracaoAbaixo,
  fracoesDoEspectro,
  luminosidadeEstelar,
  luminosidadePorMagBol,
  magBolPorLuminosidade,
  magnitudeAbsoluta,
  magnitudeAparente,
  magnitudeCefeida,
  radianosParaGraus,
  radianosParaSegundos,
  razaoDeBrilho,
  SEGUNDOS_POR_RADIANO,
} from './distancias';
import { ESTRELAS, LUA, LUMINOSIDADE_SOL_W, PARSEC_ANOS_LUZ, SOL, UA_KM } from './constantes';

describe('diâmetro angular', () => {
  it('Lua e Sol ocupam cerca de meio grau', () => {
    expect(radianosParaGraus(diametroAngular(LUA.diametroKm, LUA.distanciaKm))).toBeCloseTo(0.518, 3);
    expect(radianosParaGraus(diametroAngular(SOL.diametroKm, UA_KM))).toBeCloseTo(0.533, 3);
  });

  it('volta ao diâmetro da Lua a partir do ângulo em segundos de arco', () => {
    const theta = radianosParaSegundos(diametroAngular(LUA.diametroKm, LUA.distanciaKm));
    expect(theta).toBeCloseTo(1864.5, 0);
    expect(diametroPorAngulo(theta, LUA.distanciaKm)).toBeCloseTo(LUA.diametroKm, 0);
  });
});

describe('paralaxe', () => {
  it('Proxima Centauri: 0,768″ dá 1,30 pc, ou 4,25 anos-luz', () => {
    const d = distanciaPorParalaxe(ESTRELAS.proxima.paralaxe);
    expect(d).toBeCloseTo(1.302, 3);
    expect(d * PARSEC_ANOS_LUZ).toBeCloseTo(4.25, 2);
  });
});

describe('luminosidade', () => {
  it('o Sol, com o raio e a temperatura dele, dá 3,83 × 10²⁶ W', () => {
    expect(luminosidadeEstelar(SOL.raioM, SOL.temperaturaK) / LUMINOSIDADE_SOL_W).toBeCloseTo(1, 2);
  });

  it('o dobro do raio dá 4 vezes mais luz; o dobro da temperatura, 16 vezes', () => {
    const base = luminosidadeEstelar(1, 1000);
    expect(luminosidadeEstelar(2, 1000) / base).toBeCloseTo(4, 10);
    expect(luminosidadeEstelar(1, 2000) / base).toBeCloseTo(16, 10);
  });
});

describe('fluxo', () => {
  it('constante solar ≈ 1 361 W/m²', () => {
    expect(fluxo(LUMINOSIDADE_SOL_W, UA_KM * 1000)).toBeCloseTo(1361, 0);
  });

  it('o dobro da distância deixa a luz quatro vezes mais fraca', () => {
    expect(fluxo(100, 1) / fluxo(100, 2)).toBeCloseTo(4, 10);
  });
});

describe('magnitudes', () => {
  it('5 magnitudes valem um fator 100', () => {
    expect(razaoDeBrilho(1, 6)).toBeCloseTo(100, 10);
  });

  it('Sirius tem magnitude absoluta ≈ +1,4', () => {
    expect(magnitudeAbsoluta(ESTRELAS.sirius.mag, ESTRELAS.sirius.distPc)).toBeCloseTo(1.43, 2);
  });

  it('o Sol a 10 pc teria magnitude ≈ 4,8', () => {
    // 1 UA em parsecs.
    expect(magnitudeAbsoluta(SOL.magAparente, 1 / SEGUNDOS_POR_RADIANO)).toBeCloseTo(SOL.magAbsoluta, 1);
  });

  it('módulo de distância e magnitude absoluta são inversos', () => {
    const M = magnitudeAbsoluta(ESTRELAS.vega.mag, ESTRELAS.vega.distPc);
    expect(distanciaPorModulo(ESTRELAS.vega.mag, M)).toBeCloseTo(ESTRELAS.vega.distPc, 10);
    expect(magnitudeAparente(M, ESTRELAS.vega.distPc)).toBeCloseTo(ESTRELAS.vega.mag, 10);
  });

  it('o Sol tem luminosidade 1 pela magnitude bolométrica', () => {
    expect(luminosidadePorMagBol(SOL.magBol)).toBe(1);
    expect(luminosidadePorMagBol(SOL.magBol - 5)).toBeCloseTo(100, 10);
    expect(magBolPorLuminosidade(100)).toBeCloseTo(SOL.magBol - 5, 10);
  });
});

describe('Cefeidas', () => {
  it('uma Cefeida de 10 dias tem M ≈ −4,05; períodos maiores, mais brilho', () => {
    expect(magnitudeCefeida(10)).toBeCloseTo(-4.05, 10);
    expect(magnitudeCefeida(30)).toBeLessThan(magnitudeCefeida(10));
  });
});

describe('corpo negro', () => {
  it('um quarto da energia fica abaixo do pico de Wien', () => {
    expect(fracaoAbaixo(2_897_771.955 / SOL.temperaturaK, SOL.temperaturaK)).toBeCloseTo(0.25, 3);
  });

  it('o Sol emite uns 37% no visível; Spica, azul e quente, menos de 10%', () => {
    const sol = fracoesDoEspectro(SOL.temperaturaK);
    expect(sol.uv + sol.visivel + sol.iv).toBeCloseTo(1, 10);
    expect(sol.visivel).toBeCloseTo(0.366, 2);
    expect(fracoesDoEspectro(ESTRELAS.spica.temperaturaK).visivel).toBeLessThan(0.1);
    expect(fracoesDoEspectro(ESTRELAS.betelgeuse.temperaturaK).iv).toBeGreaterThan(0.8);
  });

  it('a correção bolométrica é −0,09 no Sol e bem negativa nas estrelas quentes e frias', () => {
    expect(correcaoBolometrica(SOL.temperaturaK)).toBeCloseTo(-0.09, 10);
    expect(correcaoBolometrica(ESTRELAS.spica.temperaturaK)).toBeLessThan(-1.5);
    expect(correcaoBolometrica(ESTRELAS.betelgeuse.temperaturaK)).toBeLessThan(-0.5);
  });
});
