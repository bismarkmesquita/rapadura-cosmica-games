import type { ManifestoJogo } from '@shared/catalogo/manifesto';

export interface JogoNoPortal extends ManifestoJogo {
  url: string;
  capa?: string;
}

/** Fichas e capas de todos os jogos, lidas na hora do build. */
const fichas = import.meta.glob<ManifestoJogo>('/games/*/jogo.json', { eager: true, import: 'default' });
const capas = import.meta.glob<string>('/games/*/capa.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Jogos visíveis no portal (sem os rascunhos), do mais recente para o mais antigo. */
export function listaJogos(): JogoNoPortal[] {
  return Object.entries(fichas)
    .map(([caminho, ficha]) => {
      const pasta = caminho.split('/')[2];
      return { ...ficha, url: `/games/${pasta}/`, capa: capas[`/games/${pasta}/capa.svg`] };
    })
    .filter((j) => j.status !== 'rascunho')
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}
