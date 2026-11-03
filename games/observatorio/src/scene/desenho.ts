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

/** Saturno com os anéis; `giro` gira a imagem (radianos), `tam` é o raio do disco. */
export function saturno(c: Ctx, x: number, y: number, tam: number, giro = 0): void {
  c.save();
  c.translate(x, y);
  c.rotate(giro);
  c.strokeStyle = '#f2d39a';
  c.lineWidth = Math.max(1.5, tam * 0.28);
  c.beginPath();
  c.ellipse(0, 0, tam * 2.3, tam * 0.75, 0, 0, TAU);
  c.stroke();
  c.fillStyle = '#e3b35c';
  c.beginPath();
  c.arc(0, 0, tam, 0, TAU);
  c.fill();
  c.restore();
}
