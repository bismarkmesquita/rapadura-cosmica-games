import { describe, expect, it } from 'vitest';
import {
  diametroAngular,
  diametroPorAngulo,
  distanciaPorModulo,
  distanciaPorParalaxe,
  fluxo,
  luminosidadePorMagBol,
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
  });
});

describe('Cefeidas', () => {
  it('uma Cefeida de 10 dias tem M ≈ −4,05; períodos maiores, mais brilho', () => {
    expect(magnitudeCefeida(10)).toBeCloseTo(-4.05, 10);
    expect(magnitudeCefeida(30)).toBeLessThan(magnitudeCefeida(10));
  });
});
