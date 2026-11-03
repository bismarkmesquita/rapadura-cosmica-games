import { describe, expect, it } from 'vitest';
import { altAz, anguloParalatico, direcaoLocal } from './ceu';

describe('altura e azimute', () => {
  it('uma estrela com declinação igual à latitude passa pelo zênite', () => {
    expect(altAz(0, -3.7, -3.7).alt).toBeCloseTo(90, 6);
  });

  it('o polo celeste fica à altura da latitude', () => {
    expect(altAz(37, 90, 40).alt).toBeCloseTo(40, 6);
    expect(altAz(37, 90, 40).az).toBeCloseTo(0, 6);
  });

  it('uma estrela do equador nasce no leste', () => {
    const { alt, az } = altAz(-90, 0, -23.5);
    expect(alt).toBeCloseTo(0, 6);
    expect(az).toBeCloseTo(90, 6);
  });

  it('a direção é um vetor unitário', () => {
    const [e, n, u] = direcaoLocal(-60, 20, -3.7);
    expect(Math.hypot(e, n, u)).toBeCloseTo(1, 10);
  });
});

describe('ângulo paralático', () => {
  it('é zero no meridiano e muda de sinal de um lado para o outro', () => {
    expect(anguloParalatico(0, 20, 40)).toBeCloseTo(0, 10);
    expect(anguloParalatico(30, 20, 40)).toBeGreaterThan(0);
    expect(anguloParalatico(-30, 20, 40)).toBeLessThan(0);
  });
});
