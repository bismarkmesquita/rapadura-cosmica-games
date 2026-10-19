/** Ilustrações da fase de Newton. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, luazinha, rotulo, seta, terrinha } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { trajetoriaCanhao, type DestinoTrajetoria } from '@shared/physics/gravity';

interface Trajeto {
  v: number;
  pts: [number, number][];
  fim: DestinoTrajetoria;
  rotulo?: string;
}

const TRAJ_CANHAO: Trajeto[] = [0.5, 0.75, 1, 1.18, 1.48].map((v) => ({ v, ...trajetoriaCanhao(1, v) }));
const TRAJ_ESCAPE: Trajeto[] = (
  [
    [1, '7,9 km/s'],
    [1.2, '9,5 km/s'],
    [1.45, '11,5 km/s'],
  ] as [number, string][]
).map(([v, rotulo]) => ({ v, rotulo, ...trajetoriaCanhao(1, v) }));

const corTrajeto = (tr: Trajeto): string =>
  tr.fim === 'caiu' ? COR.alerta : tr.fim === 'escapou' ? COR.sol : tr.v === 1 ? COR.ok : COR.orbita;

function desenhaTrajetos(
  c: CanvasRenderingContext2D,
  t: number,
  lista: Trajeto[],
  S: number,
  cx: number,
  cy: number,
): void {
  const p = Math.min(1, (t % 7) / 5.5);
  for (const tr of lista) {
    const n = Math.max(1, Math.floor(tr.pts.length * p));
    const cor = corTrajeto(tr);
    c.strokeStyle = cor;
    c.globalAlpha = 0.25;
    c.lineWidth = 1.5;
    c.beginPath();
    tr.pts.forEach(([x, y], i) => (i ? c.lineTo(cx + x * S, cy + y * S) : c.moveTo(cx + x * S, cy + y * S)));
    c.stroke();
    c.globalAlpha = 1;
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const [x, y] = tr.pts[i];
      if (i) c.lineTo(cx + x * S, cy + y * S);
      else c.moveTo(cx + x * S, cy + y * S);
    }
    c.stroke();
    const [bx, by] = tr.pts[n - 1];
    c.fillStyle = cor;
    c.beginPath();
    c.arc(cx + bx * S, cy + by * S, 3.5, 0, TAU);
    c.fill();
    if (tr.rotulo) {
      const [lx, ly] = tr.pts[Math.floor(tr.pts.length * 0.22)];
      rotulo(c, tr.rotulo, cx + lx * S + (tr.v > 1.3 ? 28 : 6), cy + ly * S - 6, cor, 'left', 11);
    }
  }
}

function desenhaQueda(c: CanvasRenderingContext2D, w: number, h: number, t: number, lua: boolean): void {
  const cx = w / 2,
    cy = h / 2,
    m = Math.min(w, h),
    ro = m * 0.34,
    th = t * 0.6 - Math.PI / 2;
  terrinha(c, cx, cy, m * (lua ? 0.12 : 0.15));
  c.strokeStyle = 'rgba(127,224,166,.35)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(cx, cy, ro, 0, TAU);
  c.stroke();
  const px = cx + ro * Math.cos(th),
    py = cy + ro * Math.sin(th),
    tx = -Math.sin(th),
    ty = Math.cos(th);
  c.setLineDash([5, 6]);
  c.strokeStyle = COR.muted;
  c.beginPath();
  c.moveTo(px, py);
  c.lineTo(px + tx * m * 0.42, py + ty * m * 0.42);
  c.stroke();
  c.setLineDash([]);
  rotulo(
    c,
    'sem gravidade',
    px + tx * m * 0.44,
    py + ty * m * 0.44 + 4,
    COR.muted,
    tx > 0 ? 'left' : 'right',
    11,
  );
  seta(c, px, py, px + tx * m * 0.16, py + ty * m * 0.16, COR.orbita, 2.5);
  seta(c, px, py, px - ((px - cx) / ro) * m * 0.12, py - ((py - cy) / ro) * m * 0.12, COR.sol, 2.5);
  if (lua) luazinha(c, px, py, m * 0.045);
  else {
    c.fillStyle = COR.ink;
    c.beginPath();
    c.arc(px, py, 5, 0, TAU);
    c.fill();
  }
  rotulo(c, 'velocidade', w - 10, 18, COR.orbita, 'right', 11);
  rotulo(c, 'gravidade', w - 10, 34, COR.sol, 'right', 11);
  rotulo(c, 'caminho real', w - 10, 50, COR.ok, 'right', 11);
}

export const atracao: Ilustracao = {
  leg: 'A força que derruba a maçã é a mesma que mantém a Lua girando em volta da Terra.',
  draw(c, w, h, t) {
    const ex = w / 2,
      ey = h * 1.12,
      er = h * 0.5;
    terrinha(c, ex, ey, er);
    const topo = ey - er;
    c.fillStyle = '#6b4a2f';
    c.fillRect(ex - 3, topo - h * 0.11, 6, h * 0.11);
    c.fillStyle = '#3f8f5a';
    c.beginPath();
    c.arc(ex, topo - h * 0.14, h * 0.065, 0, TAU);
    c.fill();
    const p = (t % 1.8) / 1.4;
    const ay = topo - h * 0.12 + Math.min(1, p) ** 2 * h * 0.11;
    c.fillStyle = '#e04848';
    c.beginPath();
    c.arc(ex + h * 0.045, Math.min(ay, topo - 4), 4.5, 0, TAU);
    c.fill();
    seta(c, ex + h * 0.045 + 14, topo - h * 0.12, ex + h * 0.045 + 14, topo - h * 0.05, COR.sol, 2);
    rotulo(c, 'maçã', ex + h * 0.045 + 22, topo - h * 0.08, COR.ink, 'left', 11);
    const R = er + h * 0.5,
      ang = -Math.PI / 2 + Math.sin(t * 0.35) * 0.55;
    const mx = ex + R * Math.cos(ang),
      my = ey + R * Math.sin(ang);
    luazinha(c, mx, my, h * 0.05);
    const ux = (ex - mx) / R,
      uy = (ey - my) / R;
    seta(c, mx + ux * h * 0.07, my + uy * h * 0.07, mx + ux * h * 0.17, my + uy * h * 0.17, COR.sol, 2);
    rotulo(c, 'Lua', mx, my - h * 0.07, COR.ink, 'center', 11);
    rotulo(c, 'a mesma força', w / 2, 18, COR.sol, 'center', 13);
  },
};

export const distancia: Ilustracao = {
  leg: 'Com o dobro da distância ao centro, a gravidade cai para 1/4; com o quádruplo, para 1/16.',
  draw(c, w, h, t) {
    const ex = w * 0.12,
      cy = h * 0.42,
      u = w * 0.13;
    terrinha(c, ex, cy, u);
    const marcas: [number, string, string][] = [
      [1, '1R', 'g'],
      [2, '2R', 'g/4'],
      [4, '4R', 'g/16'],
    ];
    for (const [d, l1, l2] of marcas) {
      const x = ex + d * u + (d === 1 ? 6 : 0);
      c.fillStyle = COR.ink;
      c.fillRect(x - 3, cy - 3, 6, 6);
      seta(c, x - 6, cy, x - 6 - Math.max(3, 60 / (d * d)), cy, COR.sol, 2.5);
      rotulo(c, l1, x, cy - 14, COR.muted, 'center', 11);
      rotulo(c, l2, x, cy + 22, COR.sol, 'center', 12);
    }
    const d = 1 + 1.5 * (1 - Math.cos(t * 0.8)),
      x = ex + d * u,
      y = h * 0.78,
      g = 1 / (d * d);
    c.save();
    c.translate(x, y);
    c.fillStyle = '#dfe5ff';
    c.beginPath();
    c.moveTo(10, 0);
    c.lineTo(-6, -6);
    c.lineTo(-3, 0);
    c.lineTo(-6, 6);
    c.closePath();
    c.fill();
    c.restore();
    seta(c, x - 10, y, x - 10 - 70 * g, y, COR.orbita, 2.5);
    rotulo(c, `gravidade: ${fmt(g * 100, 0)}%`, w - 10, h - 10, COR.orbita, 'right', 12);
    rotulo(c, `distância: ${fmt(d, 1)} R`, 10, h - 10, COR.muted, 'left', 12);
  },
};

export const canhaoNewton: Ilustracao = {
  leg: 'Cada cor é uma velocidade maior: cai perto, cai longe, órbita circular, órbita alongada e escape.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h * 0.42,
      S = Math.min(w, h) * 0.19;
    terrinha(c, cx, cy, S * 0.9);
    c.fillStyle = '#6b6f8f';
    c.beginPath();
    c.moveTo(cx - 10, cy - S * 0.9 + 3);
    c.lineTo(cx, cy - S - 2);
    c.lineTo(cx + 10, cy - S * 0.9 + 3);
    c.closePath();
    c.fill();
    desenhaTrajetos(c, t, TRAJ_CANHAO, S, cx, cy);
  },
};

export const queda: Ilustracao = {
  leg: 'Sem gravidade, a bala seguiria reto (linha tracejada). A gravidade curva o caminho para baixo o tempo todo.',
  draw: (c, w, h, t) => desenhaQueda(c, w, h, t, false),
};

export const lua: Ilustracao = {
  leg: 'A Lua cai em direção à Terra o tempo todo, mas anda de lado rápido o bastante para nunca acertá-la.',
  draw: (c, w, h, t) => desenhaQueda(c, w, h, t, true),
};

export const estacao: Ilustracao = {
  leg: 'A estação e os astronautas caem juntos em volta da Terra. Por isso eles flutuam lá dentro.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h / 2,
      m = Math.min(w, h),
      ro = m * 0.33,
      th = t * 0.5 - Math.PI / 2;
    terrinha(c, cx, cy, m * 0.17);
    c.strokeStyle = 'rgba(127,224,166,.3)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(cx, cy, ro, 0, TAU);
    c.stroke();
    const px = cx + ro * Math.cos(th),
      py = cy + ro * Math.sin(th);
    c.save();
    c.translate(px, py);
    c.rotate(th + Math.PI / 2);
    c.fillStyle = '#cfd5f5';
    c.fillRect(-7, -4, 14, 8);
    c.fillStyle = '#3d5fb0';
    c.fillRect(-22, -3, 12, 6);
    c.fillRect(10, -3, 12, 6);
    c.fillStyle = COR.sol;
    c.beginPath();
    c.arc(Math.sin(t * 1.7) * 3, Math.cos(t * 1.3) * 1.5, 1.8, 0, TAU);
    c.fill();
    c.restore();
    seta(c, px, py, px - ((px - cx) / ro) * m * 0.12, py - ((py - cy) / ro) * m * 0.12, COR.sol, 2.2);
    rotulo(c, 'estação + astronauta: caindo juntos', w / 2, h - 10, COR.ink, 'center', 12);
  },
};

export const escape: Ilustracao = {
  leg: 'Abaixo de cerca de 11,2 km/s, a nave volta (órbita). Acima disso, ela escapa da Terra para sempre.',
  draw(c, w, h, t) {
    const cx = w * 0.42,
      cy = h * 0.38,
      S = Math.min(w, h) * 0.17;
    terrinha(c, cx, cy, S * 0.88);
    desenhaTrajetos(c, t, TRAJ_ESCAPE, S, cx, cy);
  },
};
