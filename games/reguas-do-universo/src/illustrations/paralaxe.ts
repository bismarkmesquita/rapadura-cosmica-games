/** Ilustração da fase 2: o dedo pula entre um olho e outro; a estrela próxima pula entre janeiro e julho. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, olho, rotulo, terrinha } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { estrela, sol } from '../scene/desenho';

/** Segundos de cada ato (dedo, depois Terra) e de cada olhada (um olho ou um mês). */
const ATO = 4;
const OLHADA = 1;

export const paralaxe: Ilustracao = {
  leg: 'Com um olho, depois com o outro: o dedo pula contra o fundo. De janeiro a julho, a estrela próxima pula igual.',
  draw(c, w, h, t) {
    const terra = Math.floor(t / ATO) % 2 === 1;
    const lado = Math.floor(t / OLHADA) % 2;
    const cx = w / 2;
    const yFundo = h * 0.14;
    const yObj = h * 0.48;
    const yObs = h * 0.8;
    const sep = terra ? w * 0.3 : w * 0.11;
    const obs = [cx - sep, cx + sep];
    const nomes = terra ? ['julho', 'janeiro'] : ['olho esquerdo', 'olho direito'];
    // Onde o objeto aparece no fundo, visto de cada lugar.
    const noFundo = (x: number): number => cx + ((cx - x) * (yFundo - yObj)) / (yObj - yObs);

    c.fillStyle = '#dfe5ff';
    for (let i = -5; i <= 5; i++) {
      c.beginPath();
      c.arc(cx + i * w * 0.085, yFundo + (i % 2) * 4, 1.6, 0, TAU);
      c.fill();
    }
    rotulo(c, terra ? 'estrelas distantes' : 'fundo', cx, yFundo - 12, COR.muted, 'center', 12);

    obs.forEach((x, i) => {
      const ativo = i === lado;
      c.strokeStyle = ativo ? COR.orbita : 'rgba(255,255,255,.15)';
      c.lineWidth = ativo ? 2 : 1;
      c.beginPath();
      c.moveTo(x, yObs);
      c.lineTo(noFundo(x), yFundo);
      c.stroke();
    });
    const xp = noFundo(obs[lado]);
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(xp, yFundo, 8, 0, TAU);
    c.stroke();

    if (terra) {
      c.setLineDash([4, 5]);
      c.strokeStyle = 'rgba(115,210,255,.35)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(cx, yObs, sep, sep * 0.22, 0, 0, TAU);
      c.stroke();
      c.setLineDash([]);
      sol(c, cx, yObs, 8);
      obs.forEach((x, i) => {
        c.globalAlpha = i === lado ? 1 : 0.3;
        terrinha(c, x, yObs, 6);
        c.globalAlpha = 1;
      });
      estrela(c, cx, yObj, 4, '#ff9a6a');
      rotulo(c, 'estrela próxima', cx + 10, yObj + 4, COR.ink, 'left', 12);
    } else {
      obs.forEach((x, i) => {
        if (i === lado) olho(c, x, yObs, 13);
        else {
          c.strokeStyle = COR.muted;
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(x - 13, yObs);
          c.quadraticCurveTo(x, yObs + 8, x + 13, yObs);
          c.stroke();
        }
      });
      c.fillStyle = '#e8b48f';
      c.beginPath();
      c.roundRect(cx - 6, yObj - 22, 12, 44, 6);
      c.fill();
      rotulo(c, 'dedo', cx + 12, yObj + 4, COR.ink, 'left', 12);
    }
    rotulo(c, nomes[lado], obs[lado], yObs + 26, COR.ink, 'center', 12);
  },
};
