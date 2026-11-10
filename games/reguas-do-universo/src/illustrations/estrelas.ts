/** Ilustrações das fases 6 e 7 e da escada: o espectro, a Cefeida pulsando e as réguas empilhadas. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import { fmt } from '@shared/math/format';
import { CORES_REGUAS as CORES, curvaDeLuz, estrela } from '../scene/desenho';
import { graficoEspectro } from '../scene/espectro';
import { ROTULOS as ROTULOS_ESPECTRO } from '../content/bolometrica';

/** Temperaturas da curva que muda na ilustração do espectro, em kelvin. */
const T_FRIA = 3_000;
const T_QUENTE = 30_000;

export const espectro: Ilustracao = {
  leg: 'Quanto mais quente a estrela, mais a luz dela vai para o ultravioleta; as frias soltam quase tudo em infravermelho.',
  draw(c, w, h, t) {
    // Vai de fria a quente e volta, em escala logarítmica, a cada 8 s.
    const k = 0.5 - 0.5 * Math.cos((t / 8) * 2 * Math.PI);
    const T = T_FRIA * (T_QUENTE / T_FRIA) ** k;
    const cor = k < 0.35 ? '#ff9a6a' : k < 0.65 ? '#fff1c4' : '#a9c4ff';
    graficoEspectro(c, w * 0.06, h * 0.08, w * 0.88, h * 0.72, [{ T, cor }], ROTULOS_ESPECTRO);
    rotulo(c, ROTULOS_ESPECTRO.temperatura(Math.round(T / 100) * 100), w / 2, h - 10, cor, 'center', 13);
  },
};

export const cefeida: Ilustracao = {
  leg: 'Uma Cefeida aumenta e diminui de brilho num ritmo fixo. Quanto mais longo o período, mais potente ela é.',
  draw(c, w, h, t) {
    const periodo = 2.5;
    const b = curvaDeLuz(t / periodo);
    estrela(c, w * 0.5, h * 0.28, 8 + 10 * b, '#fff1c4');
    const x0 = w * 0.08;
    const x1 = w * 0.92;
    const y0 = h * 0.55;
    const y1 = h * 0.85;
    c.strokeStyle = COR.muted;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(x0, y1);
    c.lineTo(x1, y1);
    c.stroke();
    // Últimos 7,5 s de brilho, com o "agora" à direita.
    const janela = 7.5;
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i <= 150; i++) {
      const s = (i / 150) * janela;
      const x = x1 - (s / janela) * (x1 - x0);
      const y = y1 - 4 - curvaDeLuz((t - s) / periodo) * (y1 - y0 - 8);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    const larg = (periodo / janela) * (x1 - x0);
    c.strokeStyle = COR.orbita;
    c.beginPath();
    c.moveTo(w / 2 - larg / 2, y0 - 8);
    c.lineTo(w / 2 + larg / 2, y0 - 8);
    c.stroke();
    rotulo(c, '1 período', w / 2, y0 - 14, COR.orbita, 'center', 12);
    rotulo(c, 'brilho ao longo dos dias', w / 2, h - 8, COR.muted, 'center', 11);
  },
};

export const escada: Ilustracao = {
  leg: 'Ângulos e paralaxe na base; magnitudes no meio; Cefeidas e supernovas no topo.',
  draw(c, w, h, t) {
    const n = CORES.length;
    const passo = (h - 30) / n;
    const largura = w * 0.42;
    const recuo = (w * 0.92 - largura - w * 0.06) / (n - 1);
    // Uma régua acende a cada 0,5 s, de baixo para cima.
    const acesas = Math.min(n, Math.floor(t / 0.5) + 1);
    for (let i = 0; i < n; i++) {
      const x = w * 0.06 + i * recuo;
      const y = h - 18 - (i + 1) * passo + passo * 0.25;
      c.fillStyle = i < acesas ? CORES[i] : 'rgba(255,255,255,.08)';
      c.beginPath();
      c.roundRect(x, y, largura, passo * 0.5, 3);
      c.fill();
    }
    rotulo(c, 'perto', w * 0.06, h - 4, COR.muted, 'left', 11);
    rotulo(c, `longe · ${fmt(n, 0)} réguas`, w * 0.94, 14, COR.muted, 'right', 11);
  },
};
