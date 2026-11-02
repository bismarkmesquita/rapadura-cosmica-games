/** Ilustração da fase 3: a luz de uma lanterna cobre 1, 4 e 9 quadrados a 1, 2 e 3 metros. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';

const FRACOES = ['toda', '¼', '⅑'];

export const fluxo: Ilustracao = {
  leg: 'A mesma luz se espalha: a 2 m cobre 4 quadrados, a 3 m cobre 9. Cada quadrado recebe menos luz.',
  draw(c, w, h, t) {
    const xl = w * 0.08;
    const yc = h * 0.46;
    const u = (w * 0.86 - xl) / 3;
    const s = h * 0.15;
    // Meia altura do feixe a uma distância x da lanterna.
    const meia = (x: number): number => ((x - xl) / u) * (s / 2);

    const xf = xl + 3 * u;
    const g = c.createLinearGradient(xl, 0, xf, 0);
    g.addColorStop(0, 'rgba(255,214,140,.55)');
    g.addColorStop(1, 'rgba(255,214,140,.06)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(xl, yc);
    c.lineTo(xf, yc - meia(xf));
    c.lineTo(xf, yc + meia(xf));
    c.closePath();
    c.fill();

    // Partículas de luz saindo da lanterna em várias direções.
    c.fillStyle = '#fff1c4';
    for (let i = 0; i < 26; i++) {
      const f = (t * 0.35 + i / 26) % 1;
      const v = (((i * 37) % 26) / 25) * 2 - 1;
      const x = xl + f * 3 * u;
      c.globalAlpha = 1 - f * 0.7;
      c.beginPath();
      c.arc(x, yc + v * meia(x), 1.8, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;

    for (let k = 1; k <= 3; k++) {
      const x = xl + k * u;
      const lado = k * s;
      // Tela vista de lado, um pouco de frente: k × k quadrados.
      const P = (i: number, j: number): [number, number] => [
        x + (i / k - 0.5) * lado * 0.32,
        yc + (j / k - 0.5) * lado + (i / k - 0.5) * lado * 0.18,
      ];
      const celula = (i: number, j: number): void => {
        c.beginPath();
        c.moveTo(...P(i, j));
        c.lineTo(...P(i + 1, j));
        c.lineTo(...P(i + 1, j + 1));
        c.lineTo(...P(i, j + 1));
        c.closePath();
      };
      c.strokeStyle = 'rgba(115,210,255,.6)';
      c.lineWidth = 1;
      for (let i = 0; i < k; i++)
        for (let j = 0; j < k; j++) {
          celula(i, j);
          c.stroke();
        }
      celula(0, 0);
      c.fillStyle = 'rgba(255,181,71,.55)';
      c.fill();
      rotulo(c, `${k} m`, x, yc - lado / 2 - lado * 0.12 - 8, COR.muted, 'center', 12);
      rotulo(c, FRACOES[k - 1], x, yc + lado / 2 + lado * 0.12 + 18, COR.sol, 'center', 13);
    }

    c.fillStyle = '#8d8e97';
    c.fillRect(xl - 18, yc - 7, 16, 14);
    c.fillStyle = '#fff3d1';
    c.beginPath();
    c.arc(xl, yc, 6, 0, TAU);
    c.fill();
    rotulo(c, 'luz que chega em cada quadrado', w / 2, h - 12, COR.muted, 'center', 12);
  },
};
