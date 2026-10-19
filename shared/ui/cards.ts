import { rodaIlustracao, type CatalogoIlustracoes } from './illustration';

/** Um card explicativo. Os textos ficam em content/ de cada jogo. */
export interface CardDef {
  /** Linha pequena acima do título (ex.: "Kepler · 1609 · 1ª lei"). */
  eyebrow?: string;
  titulo: string;
  /** HTML do texto principal, para todas as turmas. */
  corpo: string;
  /** HTML do aprofundamento opcional para o EF2 (fórmulas), mostrado recolhido. */
  ef2?: string;
  /** Nome da ilustração animada no catálogo do jogo. */
  ilus?: string;
  /** Dica curta ao lado do botão. */
  dica?: string;
  /** Texto do botão (padrão: "Continuar"). */
  botao?: string;
  /** Chamado ao fechar o card. */
  aoFechar?: (() => void) | null;
}

/** Fila de cards: um card por vez, na ordem em que foram pedidos. */
export class Cards {
  private fila: (CardDef & { revisao?: boolean })[] = [];
  private pararIlus: (() => void) | null = null;
  ultimo: CardDef | null = null;

  constructor(
    private camada: HTMLElement,
    private el: HTMLElement,
    private catalogo: CatalogoIlustracoes,
    private aoAbrir: () => void = () => {},
  ) {}

  get aberto(): boolean {
    return !this.camada.hidden;
  }

  /** Coloca o card no fim da fila e abre se não houver outro aberto. */
  enfileira(c: CardDef): void {
    this.fila.push(c);
    if (!this.aberto) this.abreProximo();
  }

  /** Reabre o último card só para leitura, sem repetir a ação de fechar. */
  revisa(): void {
    if (!this.ultimo) return;
    this.fila.unshift({ ...this.ultimo, aoFechar: null, revisao: true });
    this.abreProximo();
  }

  limpa(): void {
    this.fila = [];
    this.camada.hidden = true;
    this.pararIlus?.();
  }

  /** Confirma o card aberto (Enter ou espaço). */
  confirma(): void {
    this.el.querySelector<HTMLButtonElement>('[data-card-ok]')?.click();
  }

  private abreProximo(): void {
    this.pararIlus?.();
    const c = this.fila.shift();
    if (!c) {
      this.camada.hidden = true;
      return;
    }
    if (!c.revisao) this.ultimo = c;
    const il = c.ilus ? this.catalogo[c.ilus] : undefined;
    this.el.classList.toggle('com-ilus', !!il);
    this.el.innerHTML =
      `<div class="eyebrow">${c.eyebrow ?? ''}</div><h2>${c.titulo}</h2>` +
      `<div class="grade"><div class="texto">${c.corpo}` +
      (c.ef2 ? `<details class="ef2"><summary>Aprofundar (EF2)</summary><div>${c.ef2}</div></details>` : '') +
      `</div>` +
      (il ? `<figure><canvas aria-hidden="true"></canvas><figcaption>${il.leg}</figcaption></figure>` : '') +
      `</div><div class="acoes">` +
      (c.dica ? `<span class="dica">${c.dica}</span>` : '') +
      `<button class="btn prim" data-card-ok>${c.botao ?? 'Continuar'} ↵</button></div>`;
    this.camada.hidden = false;
    this.aoAbrir();
    const canvas = this.el.querySelector('canvas');
    if (il && canvas)
      requestAnimationFrame(() => (this.pararIlus = rodaIlustracao(canvas, il, () => this.aberto)));
    const ok = this.el.querySelector<HTMLButtonElement>('[data-card-ok]');
    if (ok) {
      ok.onclick = () => {
        this.camada.hidden = true;
        c.aoFechar?.();
        this.abreProximo();
      };
      setTimeout(() => ok.focus(), 30);
    }
  }
}
