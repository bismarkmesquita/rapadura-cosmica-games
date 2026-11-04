import { describe, expect, it } from 'vitest';
import { altAz, anguloHorarioNaAltura, anguloParalatico, direcaoLocal } from './ceu';

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

describe('ângulo horário numa altura', () => {
  it('leva o astro exatamente à altura pedida', () => {
    const H = anguloHorarioNaAltura(5, 20, -30.03);
    expect(H).not.toBeNull();
    expect(altAz(H as number, 20, -30.03).alt).toBeCloseTo(5, 6);
    expect(altAz(-(H as number), 20, -30.03).alt).toBeCloseTo(5, 6);
  });

  it('no equador, um astro do equador celeste se põe a 90° do meridiano', () => {
    expect(anguloHorarioNaAltura(0, 0, 0)).toBeCloseTo(90, 6);
  });

  it('devolve null quando o astro nunca passa por aquela altura', () => {
    expect(anguloHorarioNaAltura(5, 20, 90)).toBeNull();
    expect(anguloHorarioNaAltura(5, -80, 45)).toBeNull();
    expect(anguloHorarioNaAltura(5, 80, 45)).toBeNull();
  });
});

describe('ângulo paralático', () => {
  it('é zero no meridiano e muda de sinal de um lado para o outro', () => {
    expect(anguloParalatico(0, 20, 40)).toBeCloseTo(0, 10);
    expect(anguloParalatico(30, 20, 40)).toBeGreaterThan(0);
    expect(anguloParalatico(-30, 20, 40)).toBeLessThan(0);
  });
});
