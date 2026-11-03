/** Ilustração da fase 2: Saturno cruza o céu; na ocular da altazimutal a imagem gira, na equatorial não. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';

/** Segundos para Saturno cruzar o céu da ilustração. */
const TRAVESSIA = 6;
/** Quanto a imagem gira na altazimutal durante a travessia (radianos). */
const GIRO_TOTAL = 1.4;

function saturno(c: CanvasRenderingContext2D, x: number, y: number, tam: number, giro: number): void {
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

export const montagens: Ilustracao = {
  leg: 'Enquanto Saturno cruza o céu, a imagem gira na ocular da altazimutal e fica parada na equatorial.',
  draw(c, w, h, t) {
    const k = (t % TRAVESSIA) / TRAVESSIA;
    const yh = h * 0.42;
    c.strokeStyle = COR.muted;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(w * 0.05, yh);
    c.lineTo(w * 0.95, yh);
    c.stroke();
    c.setLineDash([4, 5]);
    c.strokeStyle = 'rgba(115,210,255,.5)';
    c.beginPath();
    c.ellipse(w / 2, yh, w * 0.38, h * 0.32, 0, Math.PI, TAU);
    c.stroke();
    c.setLineDash([]);
    const a = Math.PI + k * Math.PI;
    saturno(c, w / 2 + Math.cos(a) * w * 0.38, yh + Math.sin(a) * h * 0.32, 4, 0);
    rotulo(c, 'leste', w * 0.1, yh + 14, COR.muted, 'center', 11);
    rotulo(c, 'oeste', w * 0.9, yh + 14, COR.muted, 'center', 11);

    const r = Math.min(w * 0.17, h * 0.2);
    const y = h * 0.72;
    (
      [
        ['altazimutal', w * 0.28, (k - 0.5) * GIRO_TOTAL],
        ['equatorial', w * 0.72, 0],
      ] as const
    ).forEach(([nome, x, giro]) => {
      c.fillStyle = '#05060f';
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
      c.strokeStyle = COR.muted;
      c.stroke();
      saturno(c, x, y, r * 0.18, giro);
      rotulo(c, nome, x, y + r + 16, COR.ink, 'center', 12);
    });
  },
};
