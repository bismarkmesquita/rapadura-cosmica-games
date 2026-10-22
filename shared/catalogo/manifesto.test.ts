import { describe, expect, it } from 'vitest';
import { validaManifesto } from './manifesto';

describe('validaManifesto', () => {
  it('aponta os erros de uma ficha incompleta', () => {
    const erros = validaManifesto({ slug: 'Jogo Novo', turmas: [] }, 'jogo-novo');
    expect(erros.length).toBeGreaterThan(3);
  });
});
