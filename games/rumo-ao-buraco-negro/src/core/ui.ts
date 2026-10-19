import { Cards } from '@shared/ui/cards';
import { Missoes } from '@shared/ui/missions';
import { PainelAcao } from '@shared/ui/actionPanel';
import { Toast } from '@shared/ui/toast';
import { teclasHud } from '@shared/ui/hud';
import { $ } from '@shared/ui/dom';
import { ILUSTRACOES } from '../illustrations';
import { estado } from './estado';
import { soltaTudo } from './input';

/** Instâncias da interface compartilhada, ligadas ao HTML deste jogo. */
export const cards = new Cards($('cardCamada'), $('card'), ILUSTRACOES, soltaTudo);
export const toast = new Toast($('toast'));
export const missoes = new Missoes($('faseNome'), $('listaMissoes'));
export const acao = new PainelAcao($('acao'), $('acaoEyebrow'), $('acaoTitulo'), $('acaoCorpo'));

export function painel(html: string): void {
  $('painelBox').innerHTML = html;
}

/** Caixa "Você está perto de..." no canto inferior esquerdo; null esconde. */
export function info(html: string | null): void {
  const caixa = $('info');
  if (html === null || estado.hudOculto) {
    caixa.hidden = true;
    return;
  }
  $('infoBox').innerHTML = html;
  caixa.hidden = false;
}

export function teclasDaFase(lista: [string, string][]): void {
  $('teclas').innerHTML = teclasHud(lista);
}

export function atualizaVisibilidadeHud(): void {
  const jogando = $('menu').hidden;
  for (const id of ['missoes', 'painel', 'teclas']) $(id).hidden = !jogando || estado.hudOculto;
  $('topoBtns').hidden = !jogando;
}
