/**
 * Peças de desenho em Canvas 2D reaproveitadas nas ilustrações dos cards de qualquer jogo.
 */
import { TAU } from '../math/format';

export const COR = {
  sol: '#ffb547',
  orbita: '#73d2ff',
  ink: '#e9ecff',
  muted: '#9aa3cf',
  ok: '#7fe0a6',
  alerta: '#ff7f6e',
} as const;

type Ctx = CanvasRenderingContext2D;

export function solzinho(c: Ctx, x: number, y: number, r: number): void {
  const g = c.createRadialGradient(x, y, r * 0.2, x, y, r * 2.6);
  g.addColorStop(0, 'rgba(255,190,80,.5)');
  g.addColorStop(1, 'rgba(255,150,40,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r * 2.6, 0, TAU);
  c.fill();
  c.fillStyle = COR.sol;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

export function terrinha(c: Ctx, x: number, y: number, r: number): void {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#5fb0ff');
  g.addColorStop(1, '#16468f');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

export function luazinha(c: Ctx, x: number, y: number, r: number): void {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#f2f2ee');
  g.addColorStop(1, '#8d8e97');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

export function seta(c: Ctx, x1: number, y1: number, x2: number, y2: number, cor: string, lw = 2): void {
  if (Math.hypot(x2 - x1, y2 - y1) < 2) return;
  c.strokeStyle = cor;
  c.fillStyle = cor;
  c.lineWidth = lw;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 7;
  c.beginPath();
  c.moveTo(x2, y2);
  c.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45));
  c.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45));
  c.closePath();
  c.fill();
}

export function rotulo(
  c: Ctx,
  txt: string,
  x: number,
  y: number,
  cor: string,
  al: CanvasTextAlign = 'center',
  tam = 12,
): void {
  c.fillStyle = cor;
  c.font = `600 ${tam}px "Plus Jakarta Sans",sans-serif`;
  c.textAlign = al;
  c.fillText(txt, x, y);
}

export function relogio(c: Ctx, x: number, y: number, r: number, ang: number, cor: string): void {
  c.strokeStyle = cor;
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82);
    c.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95);
    c.stroke();
  }
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + Math.cos(ang - Math.PI / 2) * r * 0.75, y + Math.sin(ang - Math.PI / 2) * r * 0.75);
  c.stroke();
  c.fillStyle = cor;
  c.beginPath();
  c.arc(x, y, 3, 0, TAU);
  c.fill();
}

/** Grade em perspectiva oblíqua (modelo do espaço-tempo). `dep(x, z)` afunda a grade; x e z vão de −1 a 1. */
export function gradeObliqua(
  c: Ctx,
  w: number,
  h: number,
  dep: (x: number, z: number) => number,
  cor?: string,
): (x: number, z: number) => [number, number] {
  const N = 12;
  const pr = (x: number, z: number): [number, number] => [
    w / 2 + x * w * 0.44 * (1 + z * 0.12),
    h * 0.58 + z * h * 0.24 + dep(x, z) * h * 0.4,
  ];
  c.strokeStyle = cor ?? 'rgba(115,210,255,.4)';
  c.lineWidth = 1;
  for (let i = 0; i <= N; i++) {
    const u = -1 + (2 * i) / N;
    for (const transposta of [false, true]) {
      c.beginPath();
      for (let j = 0; j <= 36; j++) {
        const v = -1 + (2 * j) / 36;
        const [x, y] = transposta ? pr(v, u) : pr(u, v);
        if (j) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.stroke();
    }
  }
  return pr;
}

/** Poço gravitacional suave para a grade oblíqua. */
export const poco =
  (A: number, s: number) =>
  (x: number, z: number): number =>
    A * s * (1 / Math.sqrt(x * x + z * z + s * s) - 1 / Math.sqrt(2 + s * s));
