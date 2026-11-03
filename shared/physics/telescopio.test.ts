import { describe, expect, it } from 'vitest';
import {
  anguloEixoPolar,
  aumento,
  aumentoMaximoUtil,
  escalaDePlaca,
  ganhoDeLuz,
  magnitudeLimite,
  pupilaDeSaida,
  razaoFocal,
  resolucaoRayleigh,
} from './telescopio';

// Telescópio de referência da aula: D = 200 mm, F = 1 000 mm, oculares de 25 mm e 10 mm.
describe('telescópio de 200 mm, f/5', () => {
  it('dá 40× e 100× com as oculares de 25 e 10 mm, e no máximo uns 400×', () => {
    expect(aumento(1000, 25)).toBe(40);
    expect(aumento(1000, 10)).toBe(100);
    expect(razaoFocal(1000, 200)).toBe(5);
    expect(aumentoMaximoUtil(200)).toBe(400);
    // No aumento máximo útil, a pupila de saída fica em meio milímetro.
    expect(pupilaDeSaida(200, 400)).toBe(0.5);
  });

  it('junta umas 800 vezes mais luz que o olho e chega à magnitude 13', () => {
    expect(ganhoDeLuz(200)).toBeCloseTo(816, 0);
    expect(magnitudeLimite(200)).toBeCloseTo(13.3, 1);
    expect(magnitudeLimite(7)).toBe(6);
  });

  it('separa estrelas a 0,7″ (Rayleigh, 550 nm) e tem escala de placa de 206″/mm', () => {
    expect(resolucaoRayleigh(200)).toBeCloseTo(0.69, 2);
    expect(escalaDePlaca(1000)).toBeCloseTo(206.3, 1);
  });
});

describe('montagem equatorial', () => {
  it('o eixo polar sobe tanto quanto a latitude: quase deitado em Fortaleza, em pé no Polo Norte', () => {
    expect(anguloEixoPolar(-3.7)).toBeCloseTo(3.7, 10);
    expect(anguloEixoPolar(90)).toBe(90);
  });
});
