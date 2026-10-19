import { CANAL } from './canal';

/**
 * Selo do canal para colocar em menus, pausas e telas finais dos jogos.
 * Enquanto não houver o logo oficial em shared/brand/, usa uma marca em texto.
 */
export function seloCanal(opcoes: { compacto?: boolean } = {}): HTMLElement {
  const a = document.createElement('a');
  a.className = 'selo-canal' + (opcoes.compacto ? ' selo-canal--compacto' : '');
  a.href = CANAL.site;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', `${CANAL.nome}: abrir o site do canal`);
  a.innerHTML =
    `<span class="selo-canal__planeta" aria-hidden="true"></span>` +
    `<span class="selo-canal__texto"><b>${CANAL.nome}</b>` +
    (opcoes.compacto ? '' : `<small>${CANAL.slogan}</small>`) +
    `</span>`;
  return a;
}

/** Linha com os links do canal (site e YouTube), para telas finais e pausa. */
export function linksCanal(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'links-canal';
  div.innerHTML =
    `<a class="btn" href="${CANAL.site}" target="_blank" rel="noopener">Site do canal</a>` +
    `<a class="btn" href="${CANAL.youtube}" target="_blank" rel="noopener">Canal no YouTube</a>`;
  return div;
}
