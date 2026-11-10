/** Peças de desenho deste jogo, usadas nas cenas e nas ilustrações dos slides. */
import { TAU } from '@shared/math/format';

type Ctx = CanvasRenderingContext2D;

/** Cores das sete réguas, de baixo (perto, ciano) para cima (longe, âmbar), como na capa. */
export const CORES_REGUAS = ['#73d2ff', '#86c9f2', '#9fbde0', '#b9b2c9', '#d6aa98', '#eba76a', '#f2a93b'];

/** Sol com brilho curto, para cenas em que ele fica grande (o solzinho de shared/draw tem brilho longo). */
export function sol(c: Ctx, x: number, y: number, r: number): void {
  const g = c.createRadialGradient(x, y, r * 0.6, x, y, r * 1.6);
  g.addColorStop(0, 'rgba(255,190,80,.45)');
  g.addColorStop(1, 'rgba(255,150,40,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r * 1.6, 0, TAU);
  c.fill();
  const d = c.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  d.addColorStop(0, '#fff1c4');
  d.addColorStop(1, '#ffb547');
  c.fillStyle = d;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

/**
 * Raio (px) de uma estrela desenhada pela magnitude aparente. Cresce bem mais devagar que o brilho de verdade
 * (2,5 vezes por magnitude), senão Vênus e o Sol engoliriam a tela; a ordem dos tamanhos é a mesma.
 */
export const raioPorMagnitude = (m: number): number => Math.min(30, 2 + 2.2 * Math.max(0, 6 - m) ** 0.7);

/** Fração do ciclo de uma Cefeida em que o brilho sobe; o resto é a descida lenta, como nas de verdade. */
const SUBIDA_CEFEIDA = 0.15;

/** Brilho de uma Cefeida, de 0 a 1, ao longo do ciclo (`fase` em ciclos): sobe rápido e desce devagar. */
export function curvaDeLuz(fase: number): number {
  const f = ((fase % 1) + 1) % 1;
  return f < SUBIDA_CEFEIDA ? f / SUBIDA_CEFEIDA : 1 - (f - SUBIDA_CEFEIDA) / (1 - SUBIDA_CEFEIDA);
}

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

/** Lâmpada acesa: o brilho em volta cresce com `forca` (de 0 a 1). */
export function lampada(c: Ctx, x: number, y: number, r: number, forca: number): void {
  const g = c.createRadialGradient(x, y, r * 0.3, x, y, r * (2 + 3 * forca));
  g.addColorStop(0, `rgba(255,220,140,${0.35 + 0.4 * forca})`);
  g.addColorStop(1, 'rgba(255,190,90,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r * (2 + 3 * forca), 0, TAU);
  c.fill();
  c.fillStyle = '#fff3d1';
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.fillStyle = '#8d8e97';
  c.fillRect(x + r * 0.7, y - r * 0.45, r * 0.9, r * 0.9);
}

/** Moeda de 1 real vista de frente. */
export function moeda(c: Ctx, x: number, y: number, r: number): void {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#f4f1e6');
  g.addColorStop(1, '#a8a49a');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.strokeStyle = '#d9b25c';
  c.lineWidth = Math.max(1.5, r * 0.22);
  c.beginPath();
  c.arc(x, y, r * 0.89, 0, TAU);
  c.stroke();
  if (r < 8) return;
  c.fillStyle = '#6d6a62';
  c.font = `700 ${Math.round(r * 0.9)}px "Plus Jakarta Sans",sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('1', x, y + r * 0.05);
  c.textBaseline = 'alphabetic';
}
