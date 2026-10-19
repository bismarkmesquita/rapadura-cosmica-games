import '@shared/styles/tokens.css';
import '@shared/styles/ui.css';
import './portal.css';
import { $ } from '@shared/ui/dom';
import { CANAL } from '@shared/brand/canal';
import { linksCanal, seloCanal } from '@shared/brand/selo';
import { listaJogos, type JogoNoPortal } from './catalogo';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function cartaoJogo(j: JogoNoPortal): HTMLLIElement {
  const li = el('li', 'jogo');
  const a = el('a', 'jogo__link');
  a.href = j.url;
  if (j.capa) {
    const img = el('img', 'jogo__capa');
    img.src = j.capa;
    img.alt = '';
    a.append(img);
  }
  const corpo = el('div', 'jogo__corpo');
  const etiquetas = el('div', 'jogo__etiquetas');
  for (const t of j.turmas) etiquetas.append(el('span', 'etiqueta', t));
  if (j.status === 'beta') etiquetas.append(el('span', 'etiqueta etiqueta--beta', 'Beta'));
  corpo.append(
    etiquetas,
    el('h3', 'jogo__titulo', j.titulo),
    el('p', 'jogo__resumo', j.resumo),
    el(
      'p',
      'jogo__meta',
      `Aula: ${j.aula} · ${j.fases} ${j.fases === 1 ? 'fase' : 'fases'} · ~${j.duracaoMinutos} min`,
    ),
    el('span', 'btn prim jogo__jogar', 'Jogar'),
  );
  a.append(corpo);
  li.append(a);
  return li;
}

function monta(): void {
  $('seloPortal').append(seloCanal());
  const jogos = listaJogos();
  const lista = $('listaJogos');
  jogos.forEach((j) => lista.append(cartaoJogo(j)));
  $('semJogos').hidden = jogos.length > 0;
  $('textoCanal').textContent =
    `${CANAL.slogan}. Aulas de astronomia e astronáutica para quem quer se preparar para as olimpíadas, com ${CANAL.apresentador}.`;
  $('linksCanal').append(linksCanal());
  $('rodapeTexto').textContent = `© ${new Date().getFullYear()} ${CANAL.nome}`;
}

monta();
