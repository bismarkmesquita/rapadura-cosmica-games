import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validaManifesto, type ManifestoJogo } from './manifesto';

/**
 * Caminho público dos jogos. Precisa ser igual aqui e no site (rapaduracosmica.com.br), porque o site
 * repassa /games/<slug>/ para este projeto por um rewrite.
 */
export const BASE = '/games/';

export interface JogoNoCatalogo extends ManifestoJogo {
  url: string;
  capa: string;
}

/** Formato de dist/games/catalogo.json, lido pela página /games do site. */
export interface Catalogo {
  versaoCatalogo: 1;
  jogos: JogoNoCatalogo[];
}

/** Pastas de games/ com index.html: cada uma vira uma página do build. */
export function pastasDeJogos(pastaJogos: string): string[] {
  return readdirSync(pastaJogos, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(pastaJogos, d.name, 'index.html')))
    .map((d) => d.name);
}

/**
 * Lê e valida as fichas de todos os jogos (roda no Node, durante o build).
 * Lança um erro com todos os problemas encontrados, para o build parar em vez de publicar um catálogo errado.
 */
export function montaCatalogo(pastaJogos: string): Catalogo {
  const erros: string[] = [];
  const jogos: JogoNoCatalogo[] = [];

  for (const pasta of pastasDeJogos(pastaJogos)) {
    let ficha: Partial<ManifestoJogo>;
    try {
      ficha = JSON.parse(readFileSync(join(pastaJogos, pasta, 'jogo.json'), 'utf8'));
    } catch (e) {
      erros.push(`${pasta}/jogo.json: ${(e as Error).message}`);
      continue;
    }
    const problemas = validaManifesto(ficha, pasta);
    if (!existsSync(join(pastaJogos, pasta, 'capa.svg'))) problemas.push('capa.svg não encontrada');
    if (problemas.length) {
      erros.push(...problemas.map((p) => `${pasta}: ${p}`));
      continue;
    }
    const jogo = ficha as ManifestoJogo;
    if (jogo.status === 'rascunho') continue;
    jogos.push({ ...jogo, url: `${BASE}${pasta}/`, capa: `${BASE}${pasta}/capa.svg` });
  }

  if (erros.length) throw new Error(`Fichas de jogo inválidas:\n- ${erros.join('\n- ')}`);
  jogos.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  return { versaoCatalogo: 1, jogos };
}
