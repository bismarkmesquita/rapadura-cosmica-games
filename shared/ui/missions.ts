export interface Alvo {
  x: number;
  y: number;
  nome: string;
}

export interface MissaoDef {
  id: string;
  texto: string;
  /** Ponto para onde a seta de navegação aponta enquanto a missão está ativa. */
  alvo?: () => Alvo | null;
}

interface Missao extends MissaoDef {
  feita: boolean;
}

/** Lista de missões de uma fase, mostrada no canto da tela. */
export class Missoes {
  private lista: Missao[] = [];

  constructor(
    private titulo: HTMLElement,
    private ul: HTMLElement,
  ) {}

  define(nomeFase: string, lista: MissaoDef[]): void {
    this.lista = lista.map((m) => ({ ...m, feita: false }));
    this.titulo.textContent = nomeFase;
    this.desenha();
  }

  atual(): Missao | undefined {
    return this.lista.find((m) => !m.feita);
  }

  /** Marca a missão como feita. Devolve true se ela ainda não estava feita. */
  conclui(id: string): boolean {
    const m = this.lista.find((x) => x.id === id);
    if (!m || m.feita) return false;
    m.feita = true;
    this.desenha();
    return true;
  }

  concluiTodas(): void {
    this.lista.forEach((m) => (m.feita = true));
    this.desenha();
  }

  alvoAtual(): Alvo | null {
    return this.atual()?.alvo?.() ?? null;
  }

  private desenha(): void {
    const at = this.atual();
    this.ul.innerHTML = this.lista
      .map(
        (m) =>
          `<li class="${m.feita ? 'feita' : m === at ? 'atual' : ''}"><span class="chk">${m.feita ? '✓' : ''}</span><span>${m.texto}</span></li>`,
      )
      .join('');
  }
}
