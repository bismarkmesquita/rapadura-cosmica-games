import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { montaCatalogo, pastasDeJogos } from './catalogo';
import type { ManifestoJogo } from './manifesto';

const ficha = (slug: string, extra: Partial<ManifestoJogo> = {}): ManifestoJogo => ({
  slug,
  titulo: 'Jogo de teste',
  resumo: 'Um jogo de teste.',
  aula: 'Teste',
  turmas: ['EF1'],
  temas: ['Teste'],
  fases: 1,
  duracaoMinutos: 10,
  tecnologias: [],
  status: 'beta',
  versao: '0.1.0',
  atualizadoEm: '2026-01-01',
  ...extra,
});

let pastas: string[] = [];

function pastaComJogos(jogos: Record<string, object | null>): string {
  const pasta = mkdtempSync(join(tmpdir(), 'catalogo-'));
  pastas.push(pasta);
  for (const [slug, conteudo] of Object.entries(jogos)) {
    mkdirSync(join(pasta, slug));
    writeFileSync(join(pasta, slug, 'index.html'), '<!doctype html>');
    writeFileSync(join(pasta, slug, 'capa.svg'), '<svg/>');
    if (conteudo) writeFileSync(join(pasta, slug, 'jogo.json'), JSON.stringify(conteudo));
  }
  return pasta;
}

afterEach(() => {
  pastas.forEach((p) => rmSync(p, { recursive: true, force: true }));
  pastas = [];
});

describe('jogos do repositório', () => {
  const pastaJogos = join(process.cwd(), 'games');

  it('todos têm jogo.json válido e capa.svg', () => {
    expect(() => montaCatalogo(pastaJogos)).not.toThrow();
  });

  it('cada pasta com index.html tem ficha', () => {
    expect(pastasDeJogos(pastaJogos).length).toBeGreaterThan(0);
  });

  // O site tira a barra final de /games/<slug>/, então um "./src/main.ts" viraria /games/src/main.ts no `npm run dev`.
  it('o index.html carrega arquivos pelo caminho da pasta, não por "./"', () => {
    for (const slug of pastasDeJogos(pastaJogos)) {
      const html = readFileSync(join(pastaJogos, slug, 'index.html'), 'utf8');
      expect(html, slug).not.toMatch(/(src|href)="\.\//);
      expect(html, slug).toContain(`src="/${slug}/src/main.ts"`);
    }
  });
});

describe('montaCatalogo', () => {
  it('ordena do mais recente, tira os rascunhos e acrescenta url e capa', () => {
    const pasta = pastaComJogos({
      antigo: ficha('antigo', { atualizadoEm: '2026-01-01' }),
      novo: ficha('novo', { atualizadoEm: '2026-05-01', status: 'publicado' }),
      oculto: ficha('oculto', { status: 'rascunho' }),
    });
    const cat = montaCatalogo(pasta);
    expect(cat.versaoCatalogo).toBe(1);
    expect(cat.jogos.map((j) => j.slug)).toEqual(['novo', 'antigo']);
    expect(cat.jogos[0]).toMatchObject({ url: '/games/novo/', capa: '/games/novo/capa.svg' });
  });

  it('falha com uma ficha inválida, mesmo de rascunho', () => {
    const pasta = pastaComJogos({ ruim: ficha('ruim', { status: 'rascunho', fases: 0 }) });
    expect(() => montaCatalogo(pasta)).toThrow(/ruim: fases/);
  });

  it('falha quando falta o jogo.json', () => {
    const pasta = pastaComJogos({ sem: null });
    expect(() => montaCatalogo(pasta)).toThrow(/sem\/jogo.json/);
  });
});
