import { describe, expect, it } from 'vitest';
import {
  G,
  MASSA_SOL,
  MASSA_TERRA,
  RAIO_TERRA,
  avanca,
  densidadeBuracoNegro,
  gravidadeCentral,
  raioSchwarzschild,
  ritmoDoTempo,
  trajetoriaCanhao,
  velocidadeEscape,
  velocidadeOrbital,
} from './gravity';

describe('valores conhecidos', () => {
  it('raio de Schwarzschild do Sol ≈ 2,95 km e da Terra ≈ 8,9 mm', () => {
    expect(raioSchwarzschild(MASSA_SOL) / 1000).toBeCloseTo(2.95, 1);
    expect(raioSchwarzschild(MASSA_TERRA) * 1000).toBeCloseTo(8.87, 1);
  });

  it('órbita rasante ≈ 7,9 km/s e escape ≈ 11,2 km/s na Terra', () => {
    const GM = G * MASSA_TERRA;
    expect(velocidadeOrbital(GM, RAIO_TERRA) / 1000).toBeCloseTo(7.9, 1);
    expect(velocidadeEscape(GM, RAIO_TERRA) / 1000).toBeCloseTo(11.2, 1);
  });

  it('densidade de um buraco negro de 10⁷ massas solares ≈ 1,8 × 10⁵ kg/m³ (Seletiva 2017)', () => {
    expect(densidadeBuracoNegro(1e7 * MASSA_SOL) / 1e5).toBeCloseTo(1.8, 1);
  });

  it('ritmo do tempo a 2 raios de Schwarzschild ≈ 71%', () => {
    expect(ritmoDoTempo(1, 2)).toBeCloseTo(Math.SQRT1_2, 6);
  });
});

describe('integração da órbita', () => {
  it('uma órbita circular volta ao ponto de partida depois de um período', () => {
    const GM = 1;
    const r = 1;
    const corpo = { x: r, y: 0, vx: 0, vy: velocidadeOrbital(GM, r) };
    const periodo = 2 * Math.PI;
    const passos = 4000;
    for (let i = 0; i < passos; i++) avanca(corpo, periodo / passos, (x, y) => gravidadeCentral(GM, x, y));
    expect(Math.hypot(corpo.x - r, corpo.y)).toBeLessThan(0.02);
  });

  it('o canhão de Newton cai, orbita ou escapa conforme a velocidade', () => {
    expect(trajetoriaCanhao(1, 0.5).fim).toBe('caiu');
    expect(trajetoriaCanhao(1, 1).fim).toBe('orbita');
    expect(trajetoriaCanhao(1, 1.48).fim).toBe('escapou');
  });
});
