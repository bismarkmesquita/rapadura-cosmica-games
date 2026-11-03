import type { CardDef } from '@shared/ui/cards';
import { fimDeFase } from '@shared/ui/fimDeFase';
import { BOTOES } from '../content/jogo';
import { estado } from '../core/estado';
import { fluxo } from '../core/flow';
import { acao, cards, conquistaRegua, controles } from '../core/ui';

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
 * Fecha a fase: acende a régua, mostra o desafio de conta (só no modo Avançado, e sempre opcional) e o botão
 * de avançar. A cena continua na tela até o aluno pedir o card final, que leva à fase seguinte.
 */
export function terminaFase(id: number, fim: CardDef, desafio?: DesafioDef): void {
  conquistaRegua(id);
  const proxima = fluxo.existeFase(id + 1);
  const card: CardDef = {
    ...fim,
    botao: proxima ? BOTOES.proxima(id + 1) : BOTOES.menu,
    aoFechar: () => (proxima ? fluxo.iniciaFase(id + 1) : fluxo.vaiMenu()),
  };
  const avancar = (): void => fimDeFase(acao, cards, card);
  if (estado.avancado && desafio) acao.calculo({ ...desafio, aoTerminar: avancar });
  else avancar();
}

/** O ponto (px, py) está a até r de (x, y). */
export const perto = (px: number, py: number, x: number, y: number, r: number): boolean =>
  Math.hypot(px - x, py - y) <= r;

export interface PerguntaDef {
  titulo: string;
  texto: string;
  opcoes: { texto: string; certa: boolean; resposta: string }[];
}

/**
 * Pergunta de múltipla escolha na caixa de controles (e não no painel do canto, que cobriria a cena). Resposta
 * errada mostra a explicação dela e deixa tentar de novo; a certa fecha a caixa e chama `aoAcertar`.
 */
export function pergunta(P: PerguntaDef, aoAcertar: (indice: number) => void): void {
  controles(
    `<p class="pergunta"><b>${P.titulo}</b> ${P.texto}</p><div class="opcoes">` +
      P.opcoes.map((o, i) => `<button class="btn" data-opcao="${i}">${o.texto}</button>`).join('') +
      `</div><p class="res" data-res></p>`,
    (caixa) => {
      const res = caixa.querySelector<HTMLElement>('[data-res]');
      caixa.querySelectorAll<HTMLButtonElement>('[data-opcao]').forEach((b) => {
        const i = Number(b.dataset.opcao);
        b.onclick = () => {
          if (!P.opcoes[i].certa) {
            if (res) res.textContent = P.opcoes[i].resposta;
            return;
          }
          controles('');
          aoAcertar(i);
        };
      });
    },
  );
}
