/** Ilustrações das fases 4 e 5: a régua de magnitudes e as estrelas levadas aos 10 parsecs. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo, terrinha } from '@shared/draw/helpers';
import { fmt } from '@shared/math/format';
import { ESTRELAS, LIMITE_OLHO_NU_MAG, LUA, SOL, VENUS_MAG } from '@shared/physics/constantes';
import { magnitudeAbsoluta, magnitudeAparente, SEGUNDOS_POR_RADIANO } from '@shared/physics/distancias';
import { estrela, sol } from '../scene/desenho';

const NA_REGUA: [string, number][] = [
  ['Sol', SOL.magAparente],
  ['Lua cheia', LUA.magCheia],
  ['Vênus', VENUS_MAG],
  ['Sirius', ESTRELAS.sirius.mag],
  ['olho nu', LIMITE_OLHO_NU_MAG],
];
/** Raio pequeno, para os cinco caberem na régua da ilustração. */
const raio = (m: number): number => Math.min(12, 1.5 + 0.35 * (7 - m));

export const reguaMagnitudes: Ilustracao = {
  leg: 'Na régua de magnitudes, número menor é mais brilhante: o Sol fica bem à esquerda.',
  draw(c, w, h, t) {
    const xa = w * 0.08;
    const xb = w * 0.92;
    const y = h * 0.52;
    const x = (m: number): number => xa + ((m + 28) / 36) * (xb - xa);
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(xa, y);
    c.lineTo(xb, y);
    c.stroke();
    for (let m = -25; m <= 5; m += 5) {
      c.beginPath();
      c.moveTo(x(m), y - 4);
      c.lineTo(x(m), y + 4);
      c.stroke();
    }
    // Um astro aparece a cada 0,6 s; nomes alternam acima e abaixo da régua.
    NA_REGUA.forEach(([nome, m], i) => {
      if (t < i * 0.6) return;
      const em = i % 2 ? 1 : -1;
      const r = raio(m);
      const py = y + em * (r + 14);
      if (nome === 'Sol') sol(c, x(m), py, r);
      else estrela(c, x(m), py, r, '#eef2ff');
      rotulo(c, nome, x(m), py + em * (r + 14) + (em > 0 ? 4 : 0), COR.ink, 'center', 11);
      rotulo(c, fmt(m, 1), x(m), py + em * (r + 28) + (em > 0 ? 4 : 0), COR.muted, 'center', 10);
    });
    rotulo(c, '◀ mais brilhante', xa, h - 14, COR.sol, 'left', 12);
    rotulo(c, 'mais fraca ▶', xb, h - 14, COR.muted, 'right', 12);
  },
};

const PARA_A_LINHA = [
  { nome: 'Sol', mag: SOL.magAparente, d: 1 / SEGUNDOS_POR_RADIANO, cor: '#fff1c4' },
  { nome: 'Rigel', mag: ESTRELAS.rigel.mag, d: ESTRELAS.rigel.distPc, cor: '#bcd2ff' },
];

export const dezParsecs: Ilustracao = {
  leg: 'Levadas aos 10 parsecs, o Sol vira uma estrela fraquinha e Rigel fica muito mais brilhante.',
  draw(c, w, h, t) {
    const xa = w * 0.14;
    const xb = w * 0.94;
    const x = (logD: number): number => xa + ((logD + 6) / 9) * (xb - xa);
    // Vai e volta em 6 s: 2 s parado em cada ponta, 1 s andando.
    const ciclo = t % 6;
    const k = ciclo < 2 ? 0 : ciclo < 3 ? ciclo - 2 : ciclo < 5 ? 1 : 6 - ciclo;
    const suave = k * k * (3 - 2 * k);
    terrinha(c, w * 0.06, h * 0.5, 7);
    c.setLineDash([5, 5]);
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x(1), h * 0.12);
    c.lineTo(x(1), h * 0.84);
    c.stroke();
    c.setLineDash([]);
    rotulo(c, '10 parsecs', x(1), h * 0.08, COR.sol, 'center', 12);
    PARA_A_LINHA.forEach((e, i) => {
      const y = h * (0.32 + 0.34 * i);
      const logD = Math.log10(e.d) + (1 - Math.log10(e.d)) * suave;
      const m = magnitudeAparente(magnitudeAbsoluta(e.mag, e.d), 10 ** logD);
      const r = Math.min(20, 2 + 1.6 * Math.max(0, 6 - m) ** 0.7);
      estrela(c, x(logD), y, r, e.cor);
      rotulo(c, e.nome, x(logD), y + r + 16, COR.ink, 'center', 12);
    });
    rotulo(c, 'mais perto', xa, h - 12, COR.muted, 'left', 11);
    rotulo(c, 'mais longe', xb, h - 12, COR.muted, 'right', 11);
  },
};
