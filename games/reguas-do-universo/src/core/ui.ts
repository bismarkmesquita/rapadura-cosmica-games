import { Cards } from '@shared/ui/cards';
import { Missoes } from '@shared/ui/missions';
import { PainelAcao } from '@shared/ui/actionPanel';
import { Toast } from '@shared/ui/toast';
import { $ } from '@shared/ui/dom';
import { ILUSTRACOES } from '../illustrations';
import { AVANCADO, FASES_MENU, reguaConquistada } from '../content/jogo';
import { estado } from './estado';

/** Instâncias da interface compartilhada, ligadas ao HTML deste jogo. */
export const cards = new Cards($('cardCamada'), $('card'), ILUSTRACOES, undefined, {
  rotulo: AVANCADO.bloco,
  visivel: () => estado.avancado,
  aberto: true,
});
export const toast = new Toast($('toast'));
export const missoes = new Missoes($('faseNome'), $('listaMissoes'));
export const acao = new PainelAcao($('acao'), $('acaoEyebrow'), $('acaoTitulo'), $('acaoCorpo'));

export function painel(html: string): void {
  $('painelBox').innerHTML = html;
  $('painel').classList.toggle('vazio', !html);
}

/** Controles da fase (barras, botões), embaixo e no centro da tela. Texto vazio esconde a caixa. */
export function controles(html: string, ligar?: (caixa: HTMLElement) => void): void {
  const caixa = $('controlesBox');
  caixa.innerHTML = html;
  $('controles').classList.toggle('vazio', !html);
  ligar?.(caixa);
}

export function desenhaReguas(): void {
  $('reguasHud').innerHTML = FASES_MENU.map(
    (f) => `<i class="${estado.reguas.has(f.id) ? 'acesa' : ''}" title="${f.regua}"></i>`,
  ).join('');
}

/** Acende a régua da fase (uma vez só) e avisa. */
export function conquistaRegua(id: number): void {
  if (estado.reguas.has(id)) return;
  estado.reguas.add(id);
  desenhaReguas();
  const f = FASES_MENU.find((x) => x.id === id);
  if (f) toast.mostra(reguaConquistada(f.regua), 4);
}

export function atualizaBotaoAvancado(): void {
  for (const id of ['btnAvancado', 'btnAvancadoMenu']) {
    const b = $(id);
    b.setAttribute('aria-pressed', String(estado.avancado));
    b.classList.toggle('ligado', estado.avancado);
  }
  // O Formulário é parte do Avançado: sem ele, nenhuma fórmula na tela.
  for (const id of ['btnFormulas', 'pFormulas']) $(id).hidden = !estado.avancado;
}

export function atualizaVisibilidadeHud(): void {
  const jogando = $('menu').hidden && !!estado.fase;
  for (const id of ['missoes', 'painel', 'controles', 'topoBtns']) $(id).hidden = !jogando;
}
