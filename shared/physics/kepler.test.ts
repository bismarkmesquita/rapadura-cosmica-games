import { describe, expect, it } from 'vitest';
import { anomaliaExcentrica, periodoEmAnos, posicaoOrbital, visVivaSolar } from './kepler';

describe('equação de Kepler', () => {
  it('satisfaz M = E − e·sen(E) para várias excentricidades', () => {
    for (const e of [0, 0.2, 0.6, 0.88]) {
      for (const M of [0.1, 1, 2.5, 4]) {
        const E = anomaliaExcentrica(M, e);
        expect(E - e * Math.sin(E)).toBeCloseTo(M, 8);
      }
    }
  });

  it('põe o planeta no periélio, a(1 − e), quando M = 0', () => {
    const [x, y] = posicaoOrbital({ a: 1.524, e: 0.093, T: 1.88, M0: 0, w: 0 }, 0);
    expect(Math.hypot(x, y)).toBeCloseTo(1.524 * (1 - 0.093), 6);
  });
});

describe('3ª lei de Kepler', () => {
  it('dá cerca de 11,9 anos para Júpiter', () => {
    expect(periodoEmAnos(5.203)).toBeCloseTo(11.87, 1);
  });
});

describe('vis-viva', () => {
  it('dá cerca de 59 km/s no periélio de Mercúrio e 39 km/s no afélio', () => {
    const a = 0.387;
    const e = 0.206;
    expect(visVivaSolar(a * (1 - e), a)).toBeCloseTo(59, 0);
    expect(visVivaSolar(a * (1 + e), a)).toBeCloseTo(38.9, 0);
  });
});
