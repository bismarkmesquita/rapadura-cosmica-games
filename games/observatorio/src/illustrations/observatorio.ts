/** Ilustrações das fases do Observatório: aumentos, baldes de luz, estrelas duplas e o ar tremendo. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { saturno } from '../scene/desenho';

/** Saturno com 40×, 100× e 400×: tamanhos na proporção dos aumentos; o último, escuro e borrado. */
export const aumentos: Ilustracao = {
  leg: 'Saturno com 40×, 100× e 400×: pequeno e nítido, bom, grande e borrado.',
  draw(c, w, h) {
    const r = Math.min(w * 0.15, h * 0.3);
    (
      [
        [40, 0, 1],
        [100, 0, 1],
        [400, 5, 0.55],
      ] as const
    ).forEach(([A, borrao, brilho], i) => {
      const x = w * (0.18 + 0.32 * i);
      const y = h * 0.45;
      c.save();
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fillStyle = '#05060f';
      c.fill();
      c.clip();
      const tam = (r * 0.11 * A) / 100;
      const copias = borrao ? 10 : 1;
      for (let k = 0; k < copias; k++) {
        const a = (k / copias) * TAU;
        c.globalAlpha = brilho / (copias > 1 ? 4 : 1);
        saturno(c, x + Math.cos(a) * borrao, y + Math.sin(a) * borrao, tam, -0.25);
      }
      c.globalAlpha = 1;
      c.restore();
      c.strokeStyle = COR.muted;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.stroke();
      rotulo(c, `${A}×`, x, y + r + 18, COR.ink, 'center', 13);
    });
  },
};

/** Chuva de luz caindo num copinho (o olho) e num balde (o telescópio). */
export const baldes: Ilustracao = {
  leg: 'A boca maior junta mais "gotas" de luz no mesmo tempo, como um balde na chuva.',
  draw(c, w, h, t) {
    const baldesDef: [string, number, number][] = [
      ['olho', w * 0.25, w * 0.05],
      ['telescópio', w * 0.68, w * 0.22],
    ];
    const yBoca = h * 0.62;
    c.fillStyle = '#9fd8ff';
    for (let i = 0; i < 60; i++) {
      const x = (((i * 53) % 100) / 100) * w;
      const y = ((t * 0.4 + ((i * 37) % 100) / 100) % 1) * yBoca;
      c.globalAlpha = 0.7;
      c.fillRect(x, y, 2, 7);
    }
    c.globalAlpha = 1;
    for (const [nome, x, meia] of baldesDef) {
      c.strokeStyle = nome === 'olho' ? COR.sol : COR.orbita;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x - meia, yBoca);
      c.lineTo(x - meia * 0.75, yBoca + h * 0.2);
      c.lineTo(x + meia * 0.75, yBoca + h * 0.2);
      c.lineTo(x + meia, yBoca);
      c.stroke();
      rotulo(c, nome, x, h - 8, COR.ink, 'center', 12);
    }
  },
};
