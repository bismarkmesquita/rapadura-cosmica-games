import { rodaIlustracao, type CatalogoIlustracoes } from './illustration';

/** Um card explicativo. Os textos ficam em content/ de cada jogo. */
export interface CardDef {
  /** Linha pequena acima do título (ex.: "Kepler · 1609 · 1ª lei"). */
  eyebrow?: string;
  titulo: string;
  /** HTML do texto principal, para todos os alunos (sem contas). */
  corpo: string;
  /** HTML do bloco Avançado (fórmulas e números exatos), opcional. */
  avancado?: string;
  /** Nome da ilustração animada no catálogo do jogo. */
  ilus?: string;
  /** Dica curta ao lado do botão. */
  dica?: string;
  /** Texto do botão (padrão: "Continuar"). */
  botao?: string;
  /** Chamado ao fechar o card. */
  aoFechar?: (() => void) | null;
  /** Segundo botão, ao lado do principal. Sem `aoClicar`, só fecha o card e o aluno continua na fase. */
  secundario?: { rotulo: string; aoClicar?: () => void };
}

/**
 * Como aparece o bloco Avançado. Por padrão ele fica recolhido em todo card; um jogo com o botão global de modo
 * Avançado mostra o bloco aberto, e só com o modo ligado.
 */
export interface OpcoesAvancado {
  rotulo: string;
  visivel: () => boolean;
  aberto?: boolean;
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
    private opcoesAvancado: OpcoesAvancado = { rotulo: 'Avançado', visivel: () => true },
  ) {
    el.classList.add('card--slide');
  }

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
    this.fila.unshift({
      ...this.ultimo,
      aoFechar: null,
      botao: undefined,
      secundario: undefined,
      revisao: true,
    });
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
    const ap = this.opcoesAvancado;
    this.el.classList.toggle('com-ilus', !!il);
    this.el.innerHTML =
      `<div class="eyebrow">${c.eyebrow ?? ''}</div><h2>${c.titulo}</h2>` +
      `<div class="grade"><div class="texto">${c.corpo}` +
      (c.avancado && ap.visivel()
        ? `<details class="avancado"${ap.aberto ? ' open' : ''}><summary>${ap.rotulo}</summary><div>${c.avancado}</div></details>`
        : '') +
      `</div>` +
      (il ? `<figure><canvas aria-hidden="true"></canvas><figcaption>${il.leg}</figcaption></figure>` : '') +
      `</div><div class="acoes">` +
      (c.dica ? `<span class="dica">${c.dica}</span>` : '') +
      (c.secundario ? `<button class="btn" data-card-secundario>${c.secundario.rotulo}</button>` : '') +
      `<button class="btn prim" data-card-ok>${c.botao ?? 'Continuar'} ↵</button></div>`;
    this.camada.hidden = false;
    this.aoAbrir();
    const texto = this.el.querySelector<HTMLElement>('.texto');
    if (texto) {
      const marcaContinua = (): void => {
        texto.classList.toggle('continua', texto.scrollTop + texto.clientHeight < texto.scrollHeight - 2);
      };
      texto.onscroll = marcaContinua;
      requestAnimationFrame(marcaContinua);
    }
    const canvas = this.el.querySelector('canvas');
    if (il && canvas)
      requestAnimationFrame(() => (this.pararIlus = rodaIlustracao(canvas, il, () => this.aberto)));
    const ok = this.el.querySelector<HTMLButtonElement>('[data-card-ok]');
    if (ok) {
      ok.onclick = () => {
        this.camada.hidden = true;
        c.aoFechar?.();
        // aoFechar pode ter aberto outro card (o resumo final, a introdução da fase seguinte): não fechar esse.
        if (!this.aberto) this.abreProximo();
      };
      // Sem rolar: num slide mais alto que a tela, o foco no botão levaria a vista para o fim e esconderia o título.
      setTimeout(() => ok.focus({ preventScroll: true }), 30);
    }
    const secundario = this.el.querySelector<HTMLButtonElement>('[data-card-secundario]');
    if (secundario)
      secundario.onclick = () => {
        this.camada.hidden = true;
        c.secundario?.aoClicar?.();
        if (!this.aberto) this.abreProximo();
      };
  }
}
