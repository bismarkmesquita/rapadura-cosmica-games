/** Ilustração da fase 1: a moeda, a Lua e o Sol cabem no mesmo ângulo visto do olho. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, luazinha, olho, rotulo } from '@shared/draw/helpers';
import { moeda, sol } from '../scene/desenho';

export const angulos: Ilustracao = {
  leg: 'A moeda, a Lua e o Sol ocupam o mesmo ângulo visto do olho (fora de escala).',
  draw(c, w, h, t) {
    const y = h * 0.46;
    const x0 = w * 0.08;
    const xs = w * 0.83;
    const rs = h * 0.2;
    const inclinacao = rs / (xs - x0);
    // As linhas saem do olho e crescem até o Sol no primeiro segundo e meio.
    const k = Math.min(1, t / 1.5);
    const xf = x0 + k * (xs - x0);
    c.fillStyle = 'rgba(115,210,255,.08)';
    c.beginPath();
    c.moveTo(x0, y);
    c.lineTo(xf, y - inclinacao * (xf - x0));
    c.lineTo(xf, y + inclinacao * (xf - x0));
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(115,210,255,.85)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x0, y);
    c.lineTo(xf, y - inclinacao * (xf - x0));
    c.moveTo(x0, y);
    c.lineTo(xf, y + inclinacao * (xf - x0));
    c.stroke();

    const objetos: [string, number, (x: number, r: number) => void, string][] = [
      ['moeda', 0.13, (x, r) => moeda(c, x, y, r), COR.ink],
      ['Lua', 0.4, (x, r) => luazinha(c, x, y, r), COR.ink],
      ['Sol', 1, (x, r) => sol(c, x, y, r), COR.sol],
    ];
    // Depois que as linhas chegam, cada objeto se destaca por vez.
    const destaque = t > 1.5 ? Math.floor((t - 1.5) / 1.6) % objetos.length : -1;
    objetos.forEach(([nome, f, desenha, cor], i) => {
      const x = x0 + f * (xs - x0);
      const r = inclinacao * (x - x0);
      c.globalAlpha = destaque < 0 || destaque === i ? 1 : 0.45;
      desenha(x, r);
      rotulo(c, nome, x, y + Math.max(r, 8) + 18, cor, 'center', 12);
      c.globalAlpha = 1;
    });
    olho(c, x0, y, 11);

    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    const a = Math.atan(inclinacao);
    c.beginPath();
    c.arc(x0, y, 34, -a, a);
    c.stroke();
    rotulo(c, 'mesmo ângulo', x0 + 4, y - 26, COR.sol, 'left', 12);
    rotulo(c, 'O Sol é 400 vezes maior que a Lua', w / 2, h - 34, COR.muted, 'center', 12);
    rotulo(c, 'e está 400 vezes mais longe', w / 2, h - 16, COR.muted, 'center', 12);
  },
};
