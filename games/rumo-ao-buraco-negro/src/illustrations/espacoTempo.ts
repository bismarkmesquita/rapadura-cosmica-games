/** Ilustrações da fase de Einstein. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, gradeObliqua, poco, relogio, rotulo, solzinho } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';

export const tecido: Ilustracao = {
  leg: 'Espaço e tempo juntos formam o espaço-tempo. Sem nenhuma massa por perto, o modelo da grade fica plano.',
  draw(c, w, h, t) {
    gradeObliqua(c, w, h, (x, z) => 0.025 * Math.sin(x * 4 + t * 1.5) * Math.cos(z * 3));
    rotulo(c, 'espaço-tempo sem massa: plano', w / 2, 20, COR.orbita, 'center', 13);
  },
};

export const curvatura: Ilustracao = {
  leg: 'Quando a massa aparece, o espaço-tempo afunda em volta dela, como o balão esticado sob a bolinha de ferro.',
  draw(c, w, h, t) {
    const k = 0.5 - 0.5 * Math.cos(t * 1.1);
    const pr = gradeObliqua(c, w, h, poco(0.75 * k, 0.25));
    const [x, y] = pr(0, 0);
    const g = c.createRadialGradient(x, y - 12, 2, x, y - 12, 13);
    g.addColorStop(0, '#fff6d8');
    g.addColorStop(1, COR.sol);
    c.fillStyle = g;
    c.globalAlpha = Math.min(1, k * 3);
    c.beginPath();
    c.arc(x, y - 12, 12, 0, TAU);
    c.fill();
    c.globalAlpha = 1;
    rotulo(
      c,
      k < 0.15 ? 'sem massa: plano' : 'com massa: curvo',
      w / 2,
      20,
      k < 0.15 ? COR.orbita : COR.sol,
      'center',
      13,
    );
  },
};

export const bolinhas: Ilustracao = {
  leg: 'As sondas não são puxadas por uma força invisível: elas seguem as curvas do espaço-tempo.',
  draw(c, w, h, t) {
    const pr = gradeObliqua(c, w, h, poco(0.6, 0.28));
    const [sx, sy] = pr(0, 0);
    solzinho(c, sx, sy - 10, 9);
    c.strokeStyle = 'rgba(127,224,166,.55)';
    c.lineWidth = 1.5;
    c.beginPath();
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * TAU;
      const [x, y] = pr(0.55 * Math.cos(a), 0.55 * Math.sin(a));
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    const a = t * 1.3;
    const [mx, my] = pr(0.55 * Math.cos(a), 0.55 * Math.sin(a));
    c.fillStyle = COR.ok;
    c.beginPath();
    c.arc(mx, my - 4, 5, 0, TAU);
    c.fill();
    const curva = (u: number): [number, number] => [u, -0.85 + 0.32 * Math.exp(-u * u * 5)];
    c.setLineDash([5, 5]);
    c.strokeStyle = 'rgba(115,210,255,.7)';
    c.beginPath();
    for (let i = 0; i <= 50; i++) {
      const [u, v] = curva(-1 + (2 * i) / 50);
      const [x, y] = pr(u, v);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    c.setLineDash([]);
    const [cu, cv] = curva(-1 + 2 * ((t * 0.35) % 1));
    const [px, py] = pr(cu, cv);
    c.fillStyle = COR.orbita;
    c.beginPath();
    c.arc(px, py - 4, 5, 0, TAU);
    c.fill();
    rotulo(c, 'órbita', w * 0.83, h * 0.52, COR.ok, 'center', 11);
    rotulo(c, 'passou e fez curva', w / 2, h * 0.22, COR.orbita, 'center', 11);
  },
};

export const lente: Ilustracao = {
  leg: 'A luz da estrela faz uma curva perto do Sol. Quem observa vê a estrela na direção da linha tracejada, fora do lugar real.',
  draw(c, w, h, t) {
    const S = [w * 0.5, h * 0.62],
      E = [w * 0.06, h * 0.5],
      O = [w * 0.94, h * 0.5],
      ctrl = [w * 0.5, h * 0.3];
    solzinho(c, S[0], S[1], 16);
    c.strokeStyle = '#ffe08a';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(E[0], E[1]);
    c.quadraticCurveTo(ctrl[0], ctrl[1], O[0], O[1]);
    c.stroke();
    const dx = O[0] - ctrl[0],
      dy = O[1] - ctrl[1],
      L = Math.hypot(dx, dy);
    const ap = [O[0] - (dx / L) * w * 0.95, O[1] - (dy / L) * w * 0.95];
    c.setLineDash([5, 5]);
    c.strokeStyle = COR.orbita;
    c.beginPath();
    c.moveTo(O[0], O[1]);
    c.lineTo(ap[0], ap[1]);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = '#fff3c0';
    c.beginPath();
    c.arc(E[0], E[1], 5, 0, TAU);
    c.fill();
    c.globalAlpha = 0.6;
    c.fillStyle = COR.orbita;
    c.beginPath();
    c.arc(ap[0], ap[1], 5, 0, TAU);
    c.fill();
    c.globalAlpha = 1;
    const p = (t * 0.4) % 1,
      q = 1 - p;
    const bx = q * q * E[0] + 2 * q * p * ctrl[0] + p * p * O[0];
    const by = q * q * E[1] + 2 * q * p * ctrl[1] + p * p * O[1];
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(bx, by, 3.5, 0, TAU);
    c.fill();
    c.fillStyle = COR.ink;
    c.beginPath();
    c.arc(O[0], O[1], 5, 0, TAU);
    c.fill();
    rotulo(c, 'estrela de verdade', E[0], E[1] + 22, '#ffe08a', 'left', 11);
    rotulo(c, 'onde a vemos', ap[0] + 6, ap[1] - 10, COR.orbita, 'left', 11);
    rotulo(c, 'observador', O[0], O[1] + 22, COR.ink, 'right', 11);
    rotulo(c, 'Sol', S[0], S[1] + 34, COR.sol, 'center', 11);
  },
};

export const relogios: Ilustracao = {
  leg: 'Perto de uma massa, o tempo passa mais devagar do que longe dela. Aqui o efeito está muito exagerado.',
  draw(c, w, h, t) {
    const r = Math.min(w, h) * 0.17;
    relogio(c, w * 0.28, h * 0.45, r, (t * TAU) / 4, COR.orbita);
    relogio(c, w * 0.72, h * 0.45, r, (t * 0.55 * TAU) / 4, COR.sol);
    solzinho(c, w * 0.72, h * 0.45 + r + 26, 10);
    rotulo(c, 'longe da massa', w * 0.28, h * 0.45 - r - 12, COR.orbita, 'center', 12);
    rotulo(c, 'perto da massa', w * 0.72, h * 0.45 - r - 12, COR.sol, 'center', 12);
    rotulo(c, `${fmt(t, 1)} s`, w * 0.28, h - 14, COR.orbita, 'center', 13);
    rotulo(c, `${fmt(t * 0.55, 1)} s`, w * 0.72, h - 14, COR.sol, 'center', 13);
  },
};
