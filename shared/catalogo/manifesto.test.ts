import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validaManifesto } from './manifesto';

const pastaJogos = join(process.cwd(), 'games');
const jogos = readdirSync(pastaJogos, { withFileTypes: true }).filter((d) => d.isDirectory());

describe('fichas dos jogos', () => {
  for (const d of jogos) {
    const pasta = join(pastaJogos, d.name);
    it(`${d.name} tem jogo.json válido, index.html e capa.svg`, () => {
      expect(existsSync(join(pasta, 'index.html'))).toBe(true);
      expect(existsSync(join(pasta, 'capa.svg'))).toBe(true);
      const ficha = JSON.parse(readFileSync(join(pasta, 'jogo.json'), 'utf8'));
      expect(validaManifesto(ficha, d.name)).toEqual([]);
    });
  }

  it('aponta os erros de uma ficha incompleta', () => {
    const erros = validaManifesto({ slug: 'Jogo Novo', turmas: [] }, 'jogo-novo');
    expect(erros.length).toBeGreaterThan(3);
  });
});
