export interface Ponto {
  x: number;
  y: number;
}

/**
 * Contrato de uma fase. Cada fase desenha a própria cena 2D a cada quadro e cuida das missões, dos cards,
 * do painel e dos controles; o laço principal só chama estes métodos.
 */
export interface Fase {
  readonly id: number;
  readonly nome: string;

  init(): void;
  update(dt: number): void;
  /** Em pixels CSS; h é a altura livre, acima da caixa de controles da fase. */
  desenha(c: CanvasRenderingContext2D, w: number, h: number): void;
  hud(): void;
  /** Clique ou toque na cena. Devolve true se pegou algo para arrastar. */
  aperta?(p: Ponto): boolean;
  arrasta?(p: Ponto): void;
  solta?(): void;
  cursor?(p: Ponto): string;
  aoMudarAvancado?(): void;
}
