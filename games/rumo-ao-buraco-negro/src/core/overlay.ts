import { TAU } from '@shared/math/format';
import { COR } from '@shared/draw/helpers';
import type { Alvo } from '@shared/ui/missions';
import { oc, tela } from './engine';
import { estado, nave } from './estado';
import { giroMouse, projeta, rig } from './camera';
import { cards } from './ui';

/** Texto preso a um ponto do mundo 3D. */
export function rotulo3D(txt: string, x: number, y: number, cor: string, dy = 0, tam = 13, h = 0): void {
  const [sx, sy, atras] = projeta(x, y, h);
  if (atras || sx < -50 || sx > tela.W + 50 || sy < -50 || sy > tela.H + 50) return;
  oc.fillStyle = cor;
  oc.font = `600 ${tam}px "Plus Jakarta Sans",sans-serif`;
  oc.textAlign = 'center';
  oc.fillText(txt, sx, sy + dy);
}

/** Anel pulsante no alvo da missão, ou seta na borda da tela quando ele está fora de vista. */
export function desenhaAlvo(alvo: Alvo | null): void {
  if (!alvo) return;
  const { W, H } = tela;
  const [x, y, atras] = projeta(alvo.x, alvo.y);
  const sx = atras ? W - x : x;
  const sy = atras ? H - y : y;
  const m = 50;
  const t = performance.now() / 1000;
  if (!atras && sx > m && sx < W - m && sy > m && sy < H - m) {
    oc.strokeStyle = COR.sol;
    oc.lineWidth = 2;
    oc.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4);
    oc.setLineDash([6, 6]);
    oc.beginPath();
    oc.arc(sx, sy, 22 + 3 * Math.sin(t * 4), 0, TAU);
    oc.stroke();
    oc.setLineDash([]);
    oc.globalAlpha = 1;
    return;
  }
  const ang = Math.atan2(sy - H / 2, sx - W / 2);
  const k = Math.min(
    (W / 2 - m) / Math.abs(Math.cos(ang) || 1e-6),
    (H / 2 - m - 40) / Math.abs(Math.sin(ang) || 1e-6),
  );
  const px = W / 2 + Math.cos(ang) * k;
  const py = H / 2 + Math.sin(ang) * k;
  oc.save();
  oc.translate(px, py);
  oc.rotate(ang);
  oc.fillStyle = COR.sol;
  oc.beginPath();
  oc.moveTo(14, 0);
  oc.lineTo(-6, -9);
  oc.lineTo(-2, 0);
  oc.lineTo(-6, 9);
  oc.closePath();
  oc.fill();
  oc.restore();
  oc.fillStyle = COR.ink;
  oc.font = '600 13px "Plus Jakarta Sans",sans-serif';
  oc.textAlign = 'center';
  oc.fillText(alvo.nome, px - Math.cos(ang) * 34, py - Math.sin(ang) * 28 + 4);
}

/** Barra de giro (terceira pessoa) e moldura da cabine (primeira pessoa). */
export function desenhaMira(): void {
  if (!estado.fase || rig.modo === 'mapa' || cards.aberto || estado.pausado || nave.acoplada) return;
  const { W, H } = tela;
  const cx = W / 2;
  const g = giroMouse();
  const bw = Math.min(260, W * 0.3);
  const by = H - 62;
  oc.fillStyle = 'rgba(233,236,255,.12)';
  oc.fillRect(cx - bw / 2, by, bw, 4);
  oc.fillStyle = 'rgba(233,236,255,.4)';
  oc.fillRect(cx - 1, by - 4, 2, 12);
  if (g) {
    oc.fillStyle = COR.sol;
    oc.fillRect(g > 0 ? cx : cx + (g * bw) / 2, by, (Math.abs(g) * bw) / 2, 4);
  }
  if (rig.modo !== 'primeira') return;
  const m = Math.min(W, H) * 0.06;
  const cy = H / 2;
  oc.strokeStyle = 'rgba(115,210,255,.45)';
  oc.lineWidth = 2;
  for (const [sx, sy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const x = cx + sx * (W / 2 - m);
    const y = cy + sy * (H / 2 - m);
    oc.beginPath();
    oc.moveTo(x, y - sy * 40);
    oc.lineTo(x, y);
    oc.lineTo(x - sx * 40, y);
    oc.stroke();
  }
  oc.beginPath();
  oc.moveTo(cx - 14, cy);
  oc.lineTo(cx - 5, cy);
  oc.moveTo(cx + 5, cy);
  oc.lineTo(cx + 14, cy);
  oc.moveTo(cx, cy - 14);
  oc.lineTo(cx, cy - 5);
  oc.moveTo(cx, cy + 5);
  oc.lineTo(cx, cy + 14);
  oc.stroke();
}

/** Película colorida sobre a tela inteira (ex.: avermelhado perto do buraco negro). */
export function vinheta(cor: string, alfa: number): void {
  if (alfa <= 0.01) return;
  const { W, H } = tela;
  const g = oc.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
  g.addColorStop(0, `rgba(${cor},0)`);
  g.addColorStop(1, `rgba(${cor},${alfa})`);
  oc.fillStyle = g;
  oc.fillRect(0, 0, W, H);
}

export function escurece(alfa: number): void {
  oc.fillStyle = `rgba(0,0,0,${Math.min(1, alfa)})`;
  oc.fillRect(0, 0, tela.W, tela.H);
}
