import type { CardDef } from '@shared/ui/cards';
import { BOTOES } from '../content/jogo';
import { estado } from '../core/estado';
import { fluxo } from '../core/flow';
import { acao, cards, conquistaRegua } from '../core/ui';

/**
 * Conta há quanto tempo uma condição está valendo sem parar. As missões só contam quando o aluno para na
 * posição certa, e não quando passa por ela arrastando.
 */
export class Firmeza {
  private t = 0;

  constructor(private segundos = 0.6) {}

  conta(dt: number, ok: boolean): boolean {
    this.t = ok ? this.t + dt : 0;
    return this.t >= this.segundos;
  }

  zera(): void {
    this.t = 0;
  }
}

export interface DesafioDef {
  titulo: string;
  texto: string;
  formula: string;
  unidade: string;
  resposta: number;
  tolerancia: number;
  msgAcerto: string;
}

/**
 * Fecha a fase: acende a régua, mostra o desafio de conta (só no modo Avançado, e sempre opcional) e o card
 * final, que leva à fase seguinte.
 */
export function terminaFase(id: number, fim: CardDef, desafio?: DesafioDef): void {
  conquistaRegua(id);
  const proxima = fluxo.existeFase(id + 1);
  const card: CardDef = {
    ...fim,
    botao: proxima ? BOTOES.proxima(id + 1) : BOTOES.menu,
    aoFechar: () => (proxima ? fluxo.iniciaFase(id + 1) : fluxo.vaiMenu()),
  };
  if (estado.avancado && desafio) acao.calculo({ ...desafio, aoTerminar: () => cards.enfileira(card) });
  else cards.enfileira(card);
}

/** O ponto (px, py) está a até r de (x, y). */
export const perto = (px: number, py: number, x: number, y: number, r: number): boolean =>
  Math.hypot(px - x, py - y) <= r;
