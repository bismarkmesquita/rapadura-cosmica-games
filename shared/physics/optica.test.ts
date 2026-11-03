import { describe, expect, it } from 'vitest';
import { focoCassegrain, GEOMETRIA, tracaCassegrain, tracaNewtoniano, tracaRefrator } from './optica';

describe('refrator', () => {
  it('leva a luz à ocular; a luz branca separa as cores, com o azul focando antes', () => {
    expect(tracaRefrator(false).chegou).toBe(true);
    const branca = tracaRefrator(true);
    expect(new Set(branca.raios.map((r) => r.cor)).size).toBe(3);
    const focoDe = (cor: string): number => branca.raios.find((r) => r.cor === cor)!.pontos[2][0];
    // O raio vai de frente (x grande) para trás: foco "antes" = x maior.
    expect(focoDe('#6ea8ff')).toBeGreaterThan(focoDe('#ff7f6e'));
  });
});

describe('newtoniano', () => {
  it('só a 45° o espelho secundário manda a luz para a ocular', () => {
    expect(tracaNewtoniano(45).chegou).toBe(true);
    expect(tracaNewtoniano(44).chegou).toBe(true);
    expect(tracaNewtoniano(30).chegou).toBe(false);
    expect(tracaNewtoniano(70).chegou).toBe(false);
  });
});

describe('Cassegrain', () => {
  const { posicaoIdeal, ocular } = GEOMETRIA.cassegrain;

  it('com o convexo na posição ideal, o foco cai na ocular, atrás do furo', () => {
    expect(focoCassegrain('convexo', posicaoIdeal)).toBeCloseTo(ocular, 1);
    expect(tracaCassegrain('convexo', posicaoIdeal).chegou).toBe(true);
  });

  it('com espelho plano ou côncavo, o foco fica na frente do primário', () => {
    expect(focoCassegrain('plano', posicaoIdeal)!).toBeGreaterThan(0);
    expect(tracaCassegrain('plano', posicaoIdeal).chegou).toBe(false);
    expect(tracaCassegrain('concavo', posicaoIdeal).chegou).toBe(false);
  });

  it('fora da posição certa, a imagem desfoca', () => {
    expect(tracaCassegrain('convexo', posicaoIdeal + 0.5).chegou).toBe(false);
    expect(tracaCassegrain('convexo', posicaoIdeal - 0.5).chegou).toBe(false);
  });
});
