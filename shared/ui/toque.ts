/**
 * Controles na tela para celulares e tablets. Os botões "apertam teclas virtuais": o jogo trata o toque
 * exatamente como o teclado, então a física e as fases não precisam saber de onde veio o comando.
 */

/** Tela de toque sem mouse (celular, tablet). Notebooks com tela de toque continuam no modo teclado. */
export const telaDeToque = (): boolean => matchMedia('(hover: none) and (pointer: coarse)').matches;

/** Escolhe o texto certo para o aparelho, para os cards e missões não falarem de teclas no celular. */
export const porDispositivo = (teclado: string, toque: string): string => (telaDeToque() ? toque : teclado);

export interface BotaoToque {
  tecla: string;
  rotulo: string;
  /** Nome para leitores de tela, quando o rótulo é um símbolo. */
  nome?: string;
  /**
   * "segurar": a tecla fica apertada enquanto o dedo está no botão (acelerar, virar);
   * "alternar": cada toque liga ou desliga (turbo); sem modo: um toque, como apertar e soltar.
   */
  modo?: 'segurar' | 'alternar';
  /** Classe extra, para o layout do jogo destacar um botão (ex.: o de acelerar). */
  classe?: string;
}

export interface TeclasVirtuais {
  aperta(tecla: string): void;
  solta(tecla: string): void;
  apertada(tecla: string): boolean;
}

export class ControlesToque {
  private botoes: { el: HTMLButtonElement; def: BotaoToque }[] = [];

  constructor(private teclas: TeclasVirtuais) {}

  /** Coloca os botões no container (apagando os que estavam lá). */
  monta(container: HTMLElement, defs: BotaoToque[]): void {
    this.botoes = this.botoes.filter((b) => b.el.parentElement !== container);
    container.replaceChildren(...defs.map((def) => this.criaBotao(def)));
  }

  /** Acende os botões cujas teclas estão apertadas (o jogo solta tudo ao abrir um card ou pausar). */
  sincroniza(): void {
    for (const { el, def } of this.botoes) el.classList.toggle('ativo', this.teclas.apertada(def.tecla));
  }

  private criaBotao(def: BotaoToque): HTMLButtonElement {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'btn-toque' + (def.classe ? ` ${def.classe}` : '');
    el.textContent = def.rotulo;
    if (def.nome) el.setAttribute('aria-label', def.nome);
    const t = this.teclas;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (def.modo === 'alternar') {
        if (t.apertada(def.tecla)) t.solta(def.tecla);
        else t.aperta(def.tecla);
      } else {
        t.aperta(def.tecla);
        if (def.modo === 'segurar') el.setPointerCapture(e.pointerId);
        else t.solta(def.tecla);
      }
      this.sincroniza();
    });
    if (def.modo === 'segurar') {
      const larga = (): void => {
        t.solta(def.tecla);
        this.sincroniza();
      };
      el.addEventListener('pointerup', larga);
      el.addEventListener('pointercancel', larga);
    }
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    this.botoes.push({ el, def });
    return el;
  }
}
