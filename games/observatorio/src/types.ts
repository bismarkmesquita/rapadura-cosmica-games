import type { Cena3D } from './core/tres';

export interface Ponto {
  x: number;
  y: number;
}

/**
 * Contrato de uma fase. Cada fase desenha a própria cena 2D a cada quadro (e, na Oficina, uma cena 3D por
 * trás) e cuida das missões, dos cards, do painel e dos controles; o laço principal só chama estes métodos.
 */
export interface Fase {
  readonly id: number;
  readonly nome: string;

  init(): void;
  /** Ao sair da fase: libera o que ela criou (cena 3D). */
  sai?(): void;
  update(dt: number): void;
  /** Em pixels CSS; h é a altura livre, acima da caixa de controles da fase. */
  desenha(c: CanvasRenderingContext2D, w: number, h: number): void;
  hud(): void;
  /** Cena 3D desenhada atrás do canvas 2D; sem ela, o 2D desenha o céu de fundo. */
  cena3d?(): Cena3D | null;
  /** Clique ou toque na cena. Devolve true se pegou algo para arrastar. */
  aperta?(p: Ponto): boolean;
  arrasta?(p: Ponto): void;
  solta?(): void;
  cursor?(p: Ponto): string;
  /** Roda do mouse ou pinça: aproxima e afasta. */
  rola?(dy: number): void;
  aoMudarAvancado?(): void;
}
