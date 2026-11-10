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

/**
 * Estrela borrada pela difração (e pelo ar): o brilho cai do centro até `raio` (o primeiro anel escuro), com
 * um anel fraco em volta. As luzes se somam: duas estrelas mais perto que `raio` viram uma mancha só.
 */
export function estrelaBorrada(c: Ctx, x: number, y: number, raio: number, brilho = 1): void {
  c.save();
  c.globalCompositeOperation = 'lighter';
  // Perfil gaussiano com σ = 0,45·raio, parecido com o disco de difração: duas estrelas a menos de uns
  // 0,9·raio uma da outra viram uma mancha sem vale no meio, como diz o critério de Rayleigh.
  const g = c.createRadialGradient(x, y, 0, x, y, raio);
  for (let i = 0; i <= 6; i++) {
    const f = i / 6;
    g.addColorStop(f, `rgba(235,240,255,${brilho * Math.exp(-(f * f) / (2 * 0.45 * 0.45)) * (1 - f * f)})`);
  }
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, raio, 0, TAU);
  c.fill();
  c.strokeStyle = `rgba(235,240,255,${0.1 * brilho})`;
  c.lineWidth = Math.max(1, raio * 0.18);
  c.beginPath();
  c.arc(x, y, raio * 1.35, 0, TAU);
  c.stroke();
  c.restore();
}
