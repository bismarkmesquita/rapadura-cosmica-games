/** Ilustrações das fases do Observatório: aumentos, baldes de luz, estrelas duplas e o ar tremendo. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { estrelaBorrada, saturno } from '../scene/desenho';

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

/** Duas estrelas se aproximando até virarem uma mancha só. */
export const dupla: Ilustracao = {
  leg: 'Cada estrela vira um pequeno disco. Quando os discos se misturam, a dupla parece uma estrela só.',
  draw(c, w, h, t) {
    // Vai e volta em 6 s: da dupla bem separada até a mancha única.
    const k = 0.5 - 0.5 * Math.cos((t / 6) * TAU);
    const sep = w * (0.3 - 0.24 * k);
    const raio = w * 0.09;
    for (const lado of [-1, 1]) estrelaBorrada(c, w / 2 + (lado * sep) / 2, h * 0.45, raio);
    rotulo(
      c,
      sep > raio ? 'duas estrelas' : 'parece uma só',
      w / 2,
      h * 0.8,
      sep > raio ? COR.ok : COR.ink,
      'center',
      13,
    );
  },
};

/** Um raio de luz atravessa camadas de ar em movimento e chega torto. */
export const ar: Ilustracao = {
  leg: 'Cada camada de ar desvia um pouquinho a luz, e o desvio muda o tempo todo: a estrela dança.',
  draw(c, w, h, t) {
    const camadas = 5;
    for (let i = 0; i < camadas; i++) {
      const y = h * (0.2 + (0.6 * i) / (camadas - 1));
      c.strokeStyle = 'rgba(115,210,255,.3)';
      c.lineWidth = 1.5;
      c.beginPath();
      for (let k = 0; k <= 30; k++) {
        const x = (k / 30) * w;
        const yy = y + Math.sin(k * 0.6 + t * 2 + i) * 4;
        if (k) c.lineTo(x, yy);
        else c.moveTo(x, yy);
      }
      c.stroke();
    }
    c.strokeStyle = COR.sol;
    c.lineWidth = 2.5;
    c.beginPath();
    let x = w / 2;
    c.moveTo(x, h * 0.06);
    for (let i = 0; i < camadas; i++) {
      x += Math.sin(t * 3.1 + i * 1.7) * w * 0.03;
      c.lineTo(x, h * (0.2 + (0.6 * i) / (camadas - 1)));
    }
    c.lineTo(x, h * 0.9);
    c.stroke();
    estrelaBorrada(c, w / 2, h * 0.06, 6);
    rotulo(c, 'telescópio', x, h - 4, COR.ink, 'center', 12);
  },
};

/** Os três alvos da missão final, ganhando o ✓ um por um. */
export const missao: Ilustracao = {
  leg: 'Saturno, uma galáxia fraca e uma estrela dupla: cada um pede uma coisa diferente do telescópio.',
  draw(c, w, h, t) {
    const r = Math.min(w * 0.13, h * 0.2);
    const y = h * 0.42;
    const feitos = Math.floor(t / 0.9) % 5;
    ['Saturno', 'galáxia', 'dupla'].forEach((nome, i) => {
      const x = w * (0.2 + 0.3 * i);
      c.fillStyle = '#05060f';
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
      c.strokeStyle = i < feitos ? COR.ok : COR.muted;
      c.lineWidth = i < feitos ? 3 : 1.5;
      c.stroke();
      if (i === 0) saturno(c, x, y, r * 0.2, -0.25);
      else if (i === 1) {
        const g = c.createRadialGradient(x, y, 0, x, y, r * 0.5);
        g.addColorStop(0, 'rgba(255,236,200,.7)');
        g.addColorStop(1, 'rgba(255,236,200,0)');
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(x, y, r * 0.5, r * 0.22, -0.5, 0, TAU);
        c.fill();
      } else for (const lado of [-1, 1]) estrelaBorrada(c, x + lado * r * 0.25, y, r * 0.25);
      rotulo(
        c,
        `${i < feitos ? '✓ ' : ''}${nome}`,
        x,
        y + r + 18,
        i < feitos ? COR.ok : COR.ink,
        'center',
        12,
      );
    });
  },
};
