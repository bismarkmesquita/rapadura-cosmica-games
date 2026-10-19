import type * as THREE from 'three';

/**
 * Contrato de uma fase do jogo. Cada fase cuida da própria cena 3D, das missões,
 * dos cards e do painel; o laço principal só chama estes métodos.
 */
export interface Fase {
  readonly id: number;
  readonly nome: string;
  /** Limites do zoom no modo mapa. */
  readonly dMin: number;
  readonly dMax: number;
  /** Tamanho da nave nesta fase (a nave do jogo mede cerca de 4 unidades). */
  readonly escalaNave: number;
  /** Se definido, a câmera fica sempre no mapa com este ângulo (como na versão 2D). */
  readonly camFixa?: { az: number; el: number };
  /** Altura do plano de voo da nave (padrão 0). */
  readonly alturaVoo?: number;
  /** Cor do rastro da nave. */
  readonly corTrilha: string;
  /** Grupo com todos os objetos 3D da fase; removido ao trocar de fase. */
  grupo: THREE.Group | null;

  init(): void;
  update(dt: number): void;
  sync(dt: number): void;
  overlay(): void;
  hud(): void;
  tecla?(k: string): void;
  alvoCamera?(): THREE.Vector3 | null;
  esticamento?(): number;
}
