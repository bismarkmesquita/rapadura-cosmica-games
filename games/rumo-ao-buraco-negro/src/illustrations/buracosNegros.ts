/** Ilustrações das fases das estrelas escuras e do buraco negro. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo, seta, solzinho } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { anomaliaExcentrica } from '@shared/physics/kepler';

type Ctx = CanvasRenderingContext2D;

/** Buraco negro visto de lado: disco atrás, sombra, anel de luz e disco na frente. */
function desenhoBuracoNegro(c: Ctx, cx: number, cy: number, rs: number, t: number): void {
  const metadeDisco = (superior: boolean): void => {
    for (let k = 0; k < 9; k++) {
      const r = rs * (1.25 + k * 0.32);
      c.strokeStyle = k < 2 ? 'rgba(255,240,210,.9)' : k < 5 ? 'rgba(255,170,70,.7)' : 'rgba(200,80,30,.45)';
      c.lineWidth = 3 + Math.sin(t * 2 + k) * 0.6;
      c.beginPath();
      c.ellipse(cx, cy, r, r * 0.26, 0, superior ? Math.PI : 0, superior ? TAU : Math.PI);
      c.stroke();
    }
  };
  metadeDisco(true);
  c.strokeStyle = 'rgba(255,190,110,.75)';
  c.lineWidth = 4;
  c.beginPath();
  c.ellipse(cx, cy, rs * 1.3, rs * 1.15, 0, Math.PI, TAU);
  c.stroke();
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(cx, cy, rs, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(255,226,176,.95)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, cy, rs * 1.04, 0, TAU);
  c.stroke();
  metadeDisco(false);
}

export const gigante: Ilustracao = {
  leg: 'Uma supergigante azul tem dezenas de vezes a massa do Sol e vive apenas alguns milhões de anos.',
  draw(c, w, h, t) {
    const m = Math.min(w, h),
      R = m * 0.3 * (1 + 0.02 * Math.sin(t * 2)),
      x = w * 0.6,
      y = h * 0.5;
    const g = c.createRadialGradient(x, y, R * 0.2, x, y, R * 1.6);
    g.addColorStop(0, 'rgba(170,205,255,.55)');
    g.addColorStop(1, 'rgba(90,140,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, R * 1.6, 0, TAU);
    c.fill();
    const g2 = c.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
    g2.addColorStop(0, '#ffffff');
    g2.addColorStop(0.6, '#b9d4ff');
    g2.addColorStop(1, '#6e9bff');
    c.fillStyle = g2;
    c.beginPath();
    c.arc(x, y, R, 0, TAU);
    c.fill();
    solzinho(c, w * 0.14, y, 6);
    rotulo(c, 'Sol', w * 0.14, y + 24, COR.sol, 'center', 11);
    rotulo(c, 'supergigante azul', x, y + R + 20, '#b9d4ff', 'center', 12);
  },
};

export const estrelaEscura: Ilustracao = {
  leg: 'Numa estrela comum, a luz escapa. Numa estrela escura, a gravidade é tão forte que a luz volta, como uma bola jogada para cima.',
  draw(c, w, h, t) {
    const ax = w * 0.26,
      ay = h * 0.66,
      bx = w * 0.74,
      by = h * 0.66;
    solzinho(c, ax, ay, 11);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32,
        d = (t * 70 + i * 23) % (h * 0.6);
      c.globalAlpha = 1 - d / (h * 0.6);
      c.fillStyle = '#ffe08a';
      c.beginPath();
      c.arc(ax + Math.cos(a) * (16 + d), ay + Math.sin(a) * (16 + d), 3, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    const g = c.createRadialGradient(bx, by, 4, bx, by, 40);
    g.addColorStop(0, 'rgba(120,80,160,.4)');
    g.addColorStop(1, 'rgba(60,30,90,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(bx, by, 40, 0, TAU);
    c.fill();
    c.fillStyle = '#1a1026';
    c.beginPath();
    c.arc(bx, by, 22, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(160,120,210,.6)';
    c.lineWidth = 1.5;
    c.stroke();
    for (let i = 0; i < 5; i++) {
      const tau = (t * 0.9 + i * 0.42) % 2.1,
        altura = Math.max(0, 120 * tau - 57 * tau * tau);
      c.fillStyle = '#ffe08a';
      c.beginPath();
      c.arc(bx + (i - 2) * 9, by - 24 - altura * 0.6, 3, 0, TAU);
      c.fill();
    }
    rotulo(c, 'estrela comum: a luz escapa', ax, h - 12, COR.sol, 'center', 11);
    rotulo(c, 'estrela escura: a luz volta', bx, h - 12, '#c7a6ff', 'center', 11);
  },
};

export const colapso: Ilustracao = {
  leg: 'A supergigante incha, explode como supernova, e o núcleo desaba até virar um buraco negro.',
  draw(c, w, h, t) {
    const p = (t % 7) / 7,
      x = w / 2,
      y = h * 0.48,
      m = Math.min(w, h);
    let txt: string;
    if (p < 0.38) {
      const k = p / 0.38,
        R = m * (0.12 + 0.1 * k);
      c.fillStyle = `rgb(${Math.round(180 + 75 * k)},${Math.round(205 - 120 * k)},${Math.round(255 - 190 * k)})`;
      c.beginPath();
      c.arc(x, y, R, 0, TAU);
      c.fill();
      txt = k < 0.4 ? 'supergigante azul' : 'incha e fica vermelha';
    } else if (p < 0.5) {
      const k = (p - 0.38) / 0.12;
      c.globalAlpha = 1 - k;
      const g = c.createRadialGradient(x, y, 0, x, y, m * (0.2 + 0.4 * k));
      g.addColorStop(0, '#fff');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, m * (0.2 + 0.4 * k), 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      txt = 'supernova!';
    } else {
      const k = (p - 0.5) / 0.5;
      c.strokeStyle = `rgba(159,208,255,${0.6 * (1 - k)})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x, y, m * (0.25 + 0.25 * k), 0, TAU);
      c.stroke();
      desenhoBuracoNegro(c, x, y, m * 0.07, t);
      txt = 'buraco negro';
    }
    rotulo(c, txt, w / 2, h - 14, COR.ink, 'center', 13);
  },
};

export const buracoNegro: Ilustracao = {
  leg: 'O buraco negro não brilha. O que vemos é o gás quente em volta dele e a sombra escura no centro.',
  draw(c, w, h, t) {
    desenhoBuracoNegro(c, w / 2, h * 0.5, Math.min(w, h) * 0.12, t);
    rotulo(c, 'sombra', w / 2, h * 0.5 + 4, '#555a70', 'center', 11);
    rotulo(c, 'disco de gás quente', w * 0.5, h * 0.86, COR.sol, 'center', 12);
  },
};

export const estrelasS: Ilustracao = {
  leg: 'Estrelas giram rápido em volta de um ponto invisível. A S2 dá uma volta a cada 16 anos.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h / 2,
      m = Math.min(w, h);
    c.fillStyle = '#000';
    c.strokeStyle = 'rgba(255,190,110,.8)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy, 5, 0, TAU);
    c.fill();
    c.stroke();
    const orbitas: [number, number, number, number][] = [
      [0.36, 0.88, 0.3, 6],
      [0.28, 0.6, 1.7, 4.5],
      [0.4, 0.7, 2.8, 8],
      [0.22, 0.45, 4.2, 3.5],
    ];
    orbitas.forEach(([a, e, rot, T], i) => {
      const A = a * m,
        b = A * Math.sqrt(1 - e * e);
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.strokeStyle = 'rgba(115,210,255,.3)';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(-A * e, 0, A, b, 0, 0, TAU);
      c.stroke();
      const E = anomaliaExcentrica((t * TAU) / T + i, e),
        x = A * (Math.cos(E) - e),
        y = b * Math.sin(E);
      c.fillStyle = i === 0 ? COR.sol : COR.ink;
      c.beginPath();
      c.arc(x, y, i === 0 ? 4.5 : 3, 0, TAU);
      c.fill();
      c.restore();
      if (i === 0) {
        const xr = x * Math.cos(rot) - y * Math.sin(rot),
          yr = x * Math.sin(rot) + y * Math.cos(rot);
        rotulo(c, 'S2', cx + xr + 8, cy + yr - 6, COR.sol, 'left', 11);
      }
    });
  },
};

export const disco: Ilustracao = {
  leg: 'O gás perto do buraco negro gira mais rápido e fica mais quente: mais branco no centro, mais vermelho na borda.',
  draw(c, w, h, t) {
    const cx = w / 2,
      cy = h / 2,
      m = Math.min(w, h);
    for (let i = 0; i < 320; i++) {
      const f = (i * 0.6180339) % 1,
        r = m * (0.1 + 0.36 * f);
      const a = i * 2.399 + t * 1.4 * Math.pow(0.1 / (0.1 + 0.36 * f), 1.5);
      c.fillStyle = f < 0.15 ? '#fff4dc' : f < 0.4 ? '#ffc86a' : f < 0.7 ? '#ff8a3a' : '#c24a22';
      c.globalAlpha = 0.85 - 0.5 * f;
      c.beginPath();
      c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.8, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(cx, cy, m * 0.08, 0, TAU);
    c.fill();
  },
};

export const espaguete: Ilustracao = {
  leg: 'Perto do buraco negro, a frente da nave é puxada com mais força que a traseira, e ela estica.',
  draw(c, w, h, t) {
    const bx = w * 0.14,
      by = h * 0.48;
    c.fillStyle = '#000';
    c.strokeStyle = 'rgba(255,190,110,.85)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(bx, by, 20, 0, TAU);
    c.fill();
    c.stroke();
    const p = (t % 5) / 5,
      x = w * 0.92 - p * (w * 0.58),
      perto = 1 - (x - w * 0.34) / (w * 0.58);
    const k = 1 + 2.6 * Math.pow(Math.max(0, perto), 3);
    c.save();
    c.translate(x, by);
    c.scale(k, 1 / Math.sqrt(k));
    c.fillStyle = '#dfe5ff';
    c.beginPath();
    c.moveTo(-12, 0);
    c.lineTo(8, -8);
    c.lineTo(4, 0);
    c.lineTo(8, 8);
    c.closePath();
    c.fill();
    c.restore();
    seta(c, x - 14 * k, by + 26, x - 14 * k - 30 * k, by + 26, COR.sol, 2.2);
    seta(c, x + 8 * k, by + 26, x + 8 * k - 14, by + 26, COR.sol, 2.2);
    rotulo(
      c,
      'frente: puxão forte',
      Math.min(w - 60, Math.max(60, x - 20 * k)),
      by + 46,
      COR.sol,
      'center',
      10,
    );
    rotulo(c, 'traseira: puxão fraco', Math.min(w - 60, x + 20), by - 24, COR.muted, 'center', 10);
  },
};

export const linhaTempo: Ilustracao = {
  leg: 'Quatro séculos de ideias até a primeira foto de um buraco negro.',
  draw(c, w, h, t) {
    const eventos: [string, string][] = [
      ['1609', 'Kepler: órbitas elípticas'],
      ['1687', 'Newton: gravitação universal'],
      ['1783', 'Michell: estrelas escuras'],
      ['1915', 'Einstein: espaço-tempo curvo'],
      ['1916', 'Schwarzschild: o raio sem volta'],
      ['1919', 'Eclipse em Sobral e Príncipe'],
      ['1967', 'Wheeler: "buraco negro"'],
      ['2015', 'Primeiras ondas gravitacionais'],
      ['2019', 'Primeira foto: M87*'],
      ['2022', 'Foto de Sagitário A*'],
    ];
    const n = Math.min(eventos.length, Math.floor(t * 1.4) + 1),
      x = w * 0.12,
      y0 = 16,
      dy = (h - 26) / eventos.length;
    c.strokeStyle = 'rgba(115,210,255,.35)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y0);
    c.lineTo(x, y0 + dy * (eventos.length - 1));
    c.stroke();
    eventos.forEach(([ano, txt], i) => {
      if (i >= n) return;
      const y = y0 + i * dy;
      c.fillStyle = COR.sol;
      c.beginPath();
      c.arc(x, y, 4, 0, TAU);
      c.fill();
      rotulo(c, ano, x + 10, y + 4, COR.sol, 'left', 11);
      rotulo(c, txt, x + 46, y + 4, COR.ink, 'left', 11);
    });
  },
};
