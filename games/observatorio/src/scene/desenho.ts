/** Peças de desenho deste jogo, usadas nas cenas e nas ilustrações dos slides. */
import { TAU } from '@shared/math/format';

type Ctx = CanvasRenderingContext2D;

/** Estrela com brilho em volta. */
export function estrela(c: Ctx, x: number, y: number, r: number, cor: string): void {
  c.save();
  c.shadowColor = cor;
  c.shadowBlur = r * 4;
  c.fillStyle = cor;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}
