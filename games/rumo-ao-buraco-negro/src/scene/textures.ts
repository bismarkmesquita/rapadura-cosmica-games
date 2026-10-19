/**
 * Texturas procedurais desenhadas em Canvas 2D (não há arquivos de imagem no jogo).
 */
import * as THREE from 'three';
import { TAU } from '@shared/math/format';

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

type Pintor = (g: CanvasRenderingContext2D, w: number, h: number) => void;

function texCanvas(w: number, h: number, pinta: Pintor, cores = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  pinta(c.getContext('2d') as CanvasRenderingContext2D, w, h);
  const t = new THREE.CanvasTexture(c);
  if (cores) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function manchas(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  cores: string[],
  n: number,
  rmin: number,
  rmax: number,
  alfa: number,
): void {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cores[i % cores.length];
    g.globalAlpha = alfa * rnd(0.3, 1);
    const r = rnd(rmin, rmax);
    g.beginPath();
    g.ellipse(rnd(0, w), rnd(0, h), r, r * rnd(0.4, 0.9), rnd(0, 3), 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
}

export const texRochoso = (base: string, cores: string[]): THREE.CanvasTexture =>
  texCanvas(512, 256, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    manchas(g, w, h, cores, 420, 2, 26, 0.35);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = 'rgba(0,0,0,.25)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(rnd(0, w), rnd(20, h - 20), rnd(2, 9), 0, TAU);
      g.stroke();
    }
  });

export const texFaixas = (cores: string[]): THREE.CanvasTexture =>
  texCanvas(512, 256, (g, w, h) => {
    let y = 0;
    while (y < h) {
      const hh = rnd(6, 22);
      g.fillStyle = cores[Math.floor(rnd(0, cores.length))];
      g.fillRect(0, y, w, hh + 1);
      y += hh;
    }
    for (let i = 0; i < 220; i++) {
      g.fillStyle = 'rgba(255,255,255,.07)';
      g.fillRect(rnd(0, w), rnd(0, h), rnd(20, 90), rnd(1, 3));
    }
    g.fillStyle = 'rgba(190,90,60,.75)';
    g.beginPath();
    g.ellipse(w * 0.62, h * 0.64, 22, 11, 0, 0, TAU);
    g.fill();
  });

export const texTerra = (): THREE.CanvasTexture =>
  texCanvas(1024, 512, (g, w, h) => {
    const oceano = g.createLinearGradient(0, 0, 0, h);
    oceano.addColorStop(0, '#1a4f9e');
    oceano.addColorStop(0.5, '#1f63c0');
    oceano.addColorStop(1, '#1a4f9e');
    g.fillStyle = oceano;
    g.fillRect(0, 0, w, h);
    const centros = [
      [0.18, 0.32],
      [0.27, 0.62],
      [0.52, 0.3],
      [0.55, 0.6],
      [0.74, 0.33],
      [0.85, 0.68],
      [0.4, 0.45],
    ];
    for (const [cx, cy] of centros) {
      for (let i = 0; i < 70; i++) {
        g.fillStyle = Math.random() < 0.25 ? '#b59a62' : Math.random() < 0.5 ? '#3f8a4c' : '#2f7240';
        const r = rnd(8, 34);
        g.beginPath();
        g.ellipse(cx * w + rnd(-70, 70), cy * h + rnd(-45, 45), r, r * rnd(0.5, 0.9), rnd(0, 3), 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = '#eef4ff';
    g.fillRect(0, 0, w, h * 0.05);
    g.fillRect(0, h * 0.95, w, h * 0.05);
  });

export const texNuvens = (): THREE.CanvasTexture =>
  texCanvas(1024, 512, (g, w, h) => {
    for (let i = 0; i < 340; i++) {
      g.fillStyle = `rgba(255,255,255,${rnd(0.05, 0.22)})`;
      const r = rnd(10, 45);
      g.beginPath();
      g.ellipse(rnd(0, w), rnd(h * 0.08, h * 0.92), r * rnd(1.5, 3.5), r * 0.5, 0, 0, TAU);
      g.fill();
    }
  });

export const texSol = (): THREE.CanvasTexture =>
  texCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#ffb43c';
    g.fillRect(0, 0, w, h);
    manchas(g, w, h, ['#ffd36e', '#ff9a2e', '#fff0b0'], 900, 1, 7, 0.5);
  });

export const texEstrelaAzul = (): THREE.CanvasTexture =>
  texCanvas(512, 256, (g, w, h) => {
    g.fillStyle = '#cfe0ff';
    g.fillRect(0, 0, w, h);
    manchas(g, w, h, ['#ffffff', '#a9c6ff', '#e6efff'], 700, 1, 8, 0.5);
  });

export const texBrilho = (): THREE.CanvasTexture =>
  texCanvas(
    256,
    256,
    (g, w, h) => {
      const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.2, 'rgba(255,255,255,.55)');
      r.addColorStop(0.5, 'rgba(255,255,255,.12)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, w, h);
    },
    false,
  );

/** Disco de acreção: gradiente radial com riscos em espiral, mapeado num RingGeometry (UV planar). */
export const texDisco = (): THREE.CanvasTexture =>
  texCanvas(1024, 1024, (g, w) => {
    const cx = w / 2;
    const R = w / 2;
    const rIn = (R * 3) / 11;
    const gr = g.createRadialGradient(cx, cx, rIn, cx, cx, R);
    gr.addColorStop(0, 'rgba(255,250,235,1)');
    gr.addColorStop(0.12, 'rgba(255,215,140,.95)');
    gr.addColorStop(0.4, 'rgba(255,140,50,.7)');
    gr.addColorStop(0.75, 'rgba(180,60,20,.35)');
    gr.addColorStop(1, 'rgba(80,20,10,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cx, cx, R, 0, TAU);
    g.arc(cx, cx, rIn, 0, TAU, true);
    g.fill();
    for (let i = 0; i < 600; i++) {
      const r = rnd(rIn, R * 0.95);
      const a0 = rnd(0, TAU);
      g.strokeStyle = `rgba(255,${Math.floor(rnd(150, 240))},${Math.floor(rnd(80, 180))},${rnd(0.05, 0.25)})`;
      g.lineWidth = rnd(1, 4);
      g.beginPath();
      g.arc(cx, cx, r, a0, a0 + rnd(0.2, 1.3));
      g.stroke();
    }
  });

/** Halo de luz curvada em volta da sombra do buraco negro. */
export const texHalo = (): THREE.CanvasTexture =>
  texCanvas(512, 512, (g, w, h) => {
    const cx = w / 2;
    const R = w / 2;
    const gr = g.createRadialGradient(cx, cx, (R * 2.8) / 4.4, cx, cx, R);
    gr.addColorStop(0, 'rgba(255,215,150,.85)');
    gr.addColorStop(0.35, 'rgba(255,150,70,.35)');
    gr.addColorStop(1, 'rgba(255,100,40,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
