/** Ilustrações da fase de Kepler. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo, solzinho } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { anomaliaExcentrica } from '@shared/physics/kepler';

export const sistema: Ilustracao = {
  leg: 'Os planetas mais próximos do Sol dão voltas mais rápidas.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h / 2,
      m = Math.min(w, h);
    solzinho(c, cx, cy, m * 0.05);
    const planetas: [number, string, number][] = [
      [0.16, '#c3b1a2', 4],
      [0.28, '#5fa8ff', 6],
      [0.42, '#e3704f', 5],
    ];
    planetas.forEach(([a, cor, r], i) => {
      const R = a * m;
      c.strokeStyle = 'rgba(115,210,255,.25)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.stroke();
      const ang = (t * 1.3) / Math.pow(a / 0.16, 1.5) + i * 2;
      c.fillStyle = cor;
      c.beginPath();
      c.arc(cx + R * Math.cos(ang), cy + R * Math.sin(ang), r, 0, TAU);
      c.fill();
    });
  },
};

export const elipse: Ilustracao = {
  leg: 'Achatamento exagerado. A soma das distâncias do planeta aos dois focos (d₁ + d₂) é sempre a mesma.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h * 0.44,
      a = w * 0.4,
      e = 0.6,
      b = a * Math.sqrt(1 - e * e),
      f = a * e;
    const F1: [number, number] = [cx + f, cy];
    const F2: [number, number] = [cx - f, cy];
    c.strokeStyle = 'rgba(115,210,255,.5)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(cx, cy, a, b, 0, 0, TAU);
    c.stroke();
    const E = anomaliaExcentrica((t * 0.9) % TAU, e);
    const px = cx + a * Math.cos(E),
      py = cy + b * Math.sin(E);
    c.strokeStyle = COR.sol;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(F1[0], F1[1]);
    c.lineTo(px, py);
    c.stroke();
    c.setLineDash([5, 5]);
    c.strokeStyle = COR.orbita;
    c.beginPath();
    c.moveTo(F2[0], F2[1]);
    c.lineTo(px, py);
    c.stroke();
    c.setLineDash([]);
    solzinho(c, F1[0], F1[1], 8);
    c.strokeStyle = COR.ink;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(F2[0] - 5, F2[1] - 5);
    c.lineTo(F2[0] + 5, F2[1] + 5);
    c.moveTo(F2[0] + 5, F2[1] - 5);
    c.lineTo(F2[0] - 5, F2[1] + 5);
    c.stroke();
    c.fillStyle = '#e3704f';
    c.beginPath();
    c.arc(px, py, 6, 0, TAU);
    c.fill();
    rotulo(c, 'd₁', (F1[0] + px) / 2 + 8, (F1[1] + py) / 2 - 6, COR.sol);
    rotulo(c, 'd₂', (F2[0] + px) / 2 - 8, (F2[1] + py) / 2 - 6, COR.orbita);
    rotulo(c, 'Sol (foco)', F1[0], cy + b + 20, COR.sol);
    rotulo(c, 'foco vazio', F2[0], cy + b + 20, COR.ink);
    const d1 = (Math.hypot(px - F1[0], py - F1[1]) / (2 * a)) * 10;
    const d2 = (Math.hypot(px - F2[0], py - F2[1]) / (2 * a)) * 10;
    rotulo(
      c,
      `d₁ = ${fmt(d1, 1)}   d₂ = ${fmt(d2, 1)}   soma = ${fmt(d1 + d2, 1)}`,
      cx,
      h - 10,
      COR.ink,
      'center',
      12,
    );
  },
};

export const areas: Ilustracao = {
  leg: 'Cada fatia é varrida no mesmo tempo, e todas têm a mesma área. A fatia acesa é a que o planeta percorre agora.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h * 0.52,
      a = w * 0.42,
      e = 0.65,
      b = a * Math.sqrt(1 - e * e);
    const F: [number, number] = [cx + a * e, cy];
    const N = 8;
    const Mn = ((t / 8) * TAU) % TAU;
    const k = Math.floor((Mn / TAU) * N);
    for (let s = 0; s < N; s++) {
      c.beginPath();
      c.moveTo(F[0], F[1]);
      for (let j = 0; j <= 14; j++) {
        const E = anomaliaExcentrica(((s + j / 14) / N) * TAU, e);
        c.lineTo(cx + a * Math.cos(E), cy + b * Math.sin(E));
      }
      c.closePath();
      const acesa = s === k;
      c.fillStyle =
        s % 2 ? `rgba(255,181,71,${acesa ? 0.6 : 0.18})` : `rgba(115,210,255,${acesa ? 0.6 : 0.18})`;
      c.fill();
    }
    c.strokeStyle = 'rgba(115,210,255,.5)';
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(cx, cy, a, b, 0, 0, TAU);
    c.stroke();
    solzinho(c, F[0], F[1], 7);
    const E = anomaliaExcentrica(Mn, e);
    const px = cx + a * Math.cos(E),
      py = cy + b * Math.sin(E);
    c.strokeStyle = COR.ink;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(F[0], F[1]);
    c.lineTo(px, py);
    c.stroke();
    c.fillStyle = '#c3b1a2';
    c.beginPath();
    c.arc(px, py, 6, 0, TAU);
    c.fill();
    rotulo(c, 'perto do Sol: rápido', cx + a * 0.55, cy - b - 12, COR.sol);
    rotulo(c, 'longe: devagar', cx - a * 0.6, cy - b - 12, COR.orbita);
  },
};

export const periodos: Ilustracao = {
  leg: 'A órbita de fora é 2,2 vezes maior, e cada volta dela demora 3,3 vezes mais (2,2³ = 3,3²).',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h * 0.45,
      m = Math.min(w, h),
      r1 = m * 0.16,
      r2 = r1 * 2.2,
      T1 = 2.5,
      T2 = T1 * Math.pow(2.2, 1.5);
    solzinho(c, cx, cy, m * 0.045);
    const orbitas: [number, number, string, number][] = [
      [r1, T1, '#5fa8ff', 5],
      [r2, T2, '#dcb68c', 8],
    ];
    for (const [r, T, cor, s] of orbitas) {
      c.strokeStyle = 'rgba(115,210,255,.25)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx, cy, r, 0, TAU);
      c.stroke();
      const a = -Math.PI / 2 + (t / T) * TAU;
      c.fillStyle = cor;
      c.beginPath();
      c.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), s, 0, TAU);
      c.fill();
    }
    rotulo(c, `de dentro: ${Math.floor(t / T1)} voltas`, w * 0.27, h - 10, '#5fa8ff');
    rotulo(c, `de fora: ${Math.floor(t / T2)} voltas`, w * 0.73, h - 10, '#dcb68c');
  },
};

export const porque: Ilustracao = {
  leg: 'Kepler sabia descrever o movimento, mas não sabia o que liga o planeta ao Sol.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h / 2,
      m = Math.min(w, h),
      r = m * 0.34,
      a = t * 0.5;
    solzinho(c, cx, cy, m * 0.06);
    c.strokeStyle = 'rgba(115,210,255,.3)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.stroke();
    const px = cx + r * Math.cos(a),
      py = cy + r * Math.sin(a);
    c.setLineDash([4, 6]);
    c.strokeStyle = COR.muted;
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(px, py);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#5fa8ff';
    c.beginPath();
    c.arc(px, py, 7, 0, TAU);
    c.fill();
    rotulo(c, '?', (cx + px) / 2, (cy + py) / 2 + 10, COR.sol, 'center', 26 + 4 * Math.sin(t * 3));
  },
};
