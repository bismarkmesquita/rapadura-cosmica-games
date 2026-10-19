import { lerNumero } from '../math/format';

/** Painel no canto da tela para ações da fase e desafios opcionais de cálculo. */
export class PainelAcao {
  constructor(
    private raiz: HTMLElement,
    private eyebrow: HTMLElement,
    private titulo: HTMLElement,
    private corpo: HTMLElement,
  ) {}

  mostra(eyebrow: string, titulo: string, html: string, ligar?: (corpo: HTMLElement) => void): void {
    this.eyebrow.textContent = eyebrow;
    this.titulo.textContent = titulo;
    this.corpo.innerHTML = html;
    this.raiz.hidden = false;
    ligar?.(this.corpo);
  }

  esconde(): void {
    this.raiz.hidden = true;
  }

  /** Botão único de ação (ex.: "Ver o fim da estrela"). */
  botao(eyebrow: string, titulo: string, texto: string, rotulo: string, aoClicar: () => void): void {
    this.mostra(
      eyebrow,
      titulo,
      `<p>${texto}</p><div class="row"><button class="btn prim" data-acao>${rotulo}</button></div>`,
      (c) => {
        c.querySelector<HTMLButtonElement>('[data-acao]')!.onclick = aoClicar;
      },
    );
  }

  /**
   * Desafio de cálculo opcional (EF2). Sempre tem "Pular desafio",
   * para a aula do EF1 seguir sem a conta.
   */
  calculo(op: {
    eyebrow?: string;
    titulo: string;
    texto: string;
    formula: string;
    unidade: string;
    resposta: number;
    tolerancia: number;
    msgAcerto: string;
    aoTerminar?: () => void;
  }): void {
    this.mostra(
      op.eyebrow ?? 'Desafio EF2 · opcional',
      op.titulo,
      `<p>${op.texto}</p><div style="margin:2px 0 8px">${op.formula}</div>` +
        `<label>Resposta: <input data-in inputmode="decimal" placeholder="${op.unidade}"> ${op.unidade}</label>` +
        `<div class="row"><button class="btn prim" data-ok>Conferir</button><button class="btn" data-pular>Pular desafio</button></div>` +
        `<div class="res" data-res></div>`,
      (c) => {
        const entrada = c.querySelector<HTMLInputElement>('[data-in]')!;
        const ok = c.querySelector<HTMLButtonElement>('[data-ok]')!;
        const pular = c.querySelector<HTMLButtonElement>('[data-pular]')!;
        const res = c.querySelector<HTMLElement>('[data-res]')!;
        ok.onclick = () => {
          const v = lerNumero(entrada.value);
          if (Number.isNaN(v)) {
            res.textContent = 'Digite um número.';
            return;
          }
          if (Math.abs(v - op.resposta) <= op.tolerancia) {
            res.innerHTML = `<span style="color:var(--ok)">${op.msgAcerto}</span>`;
            ok.disabled = true;
            pular.textContent = 'Continuar';
          } else {
            res.innerHTML =
              '<span style="color:var(--alerta)">Ainda não. Confira as potências de 10 e as unidades.</span>';
          }
        };
        pular.onclick = () => {
          this.esconde();
          op.aoTerminar?.();
        };
      },
    );
  }
}
