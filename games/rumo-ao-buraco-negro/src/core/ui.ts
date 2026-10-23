import { Cards } from '@shared/ui/cards';
import { Missoes } from '@shared/ui/missions';
import { PainelAcao } from '@shared/ui/actionPanel';
import { Toast } from '@shared/ui/toast';
import { teclasHud } from '@shared/ui/hud';
import { ControlesToque, telaDeToque, type BotaoToque, type TeclasVirtuais } from '@shared/ui/toque';
import { $ } from '@shared/ui/dom';
import { ILUSTRACOES } from '../illustrations';
import { TOQUE } from '../content/jogo';
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

export const toque = telaDeToque();
let controles: ControlesToque | null = null;

/** Monta os controles na tela, em celular e tablet. As teclas virtuais vêm de main.ts. */
export function ligaToque(teclas: TeclasVirtuais): void {
  document.body.classList.add('toque');
  controles = new ControlesToque(teclas);
  controles.monta($('toqueSistema'), TOQUE.sistema);
  controles.monta($('toqueDirecao'), TOQUE.direcao);
  controles.monta($('toqueMotor'), TOQUE.motor);
}

/** Botões extras da fase nos controles de toque (lista vazia tira os da fase anterior). */
export function toqueDaFase(lista: BotaoToque[]): void {
  controles?.monta($('toqueExtras'), lista);
}

export function sincronizaToque(): void {
  controles?.sincroniza();
}

export function atualizaVisibilidadeHud(): void {
  const jogando = $('menu').hidden;
  for (const id of ['missoes', 'painel', 'teclas']) $(id).hidden = !jogando || estado.hudOculto;
  $('topoBtns').hidden = !jogando;
  $('toque').hidden = !jogando || !toque;
  document.body.classList.toggle('camera-fixa', !!estado.fase?.camFixa);
}
