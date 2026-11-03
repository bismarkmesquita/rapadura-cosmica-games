/** Ilustrações da fase 1: a história (Galileu, Kepler, Newton) e os quatro arranjos, com o caminho da luz. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import {
  COR_LUZ,
  GEOMETRIA,
  type P2,
  tracaCassegrain,
  tracaNewtoniano,
  tracaRefrator,
  type Tracado,
} from '@shared/physics/optica';

/** Objetiva em x = OBJ e foco em x = FOCO; a ocular fica a DIST_OCULAR do foco, antes (Galileu) ou depois (Kepler). */
const OBJ = 8;
const FOCO = 0.8;
const DIST_OCULAR = 1.4;
const ALTURAS = [-0.8, 0.8];

/** Raios de um refrator: `lado` +1 põe a ocular antes do foco (Galileu), −1 depois (Kepler). */
function refrator(lado: 1 | -1): { ocular: number; raios: P2[][] } {
  const ocular = FOCO + lado * DIST_OCULAR;
  const raios = ALTURAS.map((y): P2[] => {
    const saida = (y * (ocular - FOCO)) / (OBJ - FOCO);
    return [
      [OBJ + 2, y],
      [OBJ, y],
      [ocular, saida],
      [ocular - 1.6, saida],
    ];
  });
  return { ocular, raios };
}

/** Lente vista de lado: convexa (barriga para fora) ou côncava (cintura para dentro). */
function lente(c: CanvasRenderingContext2D, x: number, y: number, meia: number, convexa: boolean): void {
  const folga = convexa ? 0 : meia * 0.5;
  const curva = convexa ? meia * 0.4 : 0;
  c.fillStyle = 'rgba(159,216,255,.35)';
  c.strokeStyle = 'rgba(159,216,255,.9)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(x - folga, y - meia);
  c.quadraticCurveTo(x - curva, y, x - folga, y + meia);
  c.lineTo(x + folga, y + meia);
  c.quadraticCurveTo(x + curva, y, x + folga, y - meia);
  c.closePath();
  c.fill();
  c.stroke();
}

const HISTORIA: { nome: string; nota: string; lado?: 1 | -1 }[] = [
  { nome: 'Galileu, 1609', nota: 'imagem direita', lado: 1 },
  { nome: 'Kepler, 1611', nota: 'imagem invertida', lado: -1 },
  { nome: 'Newton, 1668', nota: 'sem bordas coloridas' },
];
const NEWTON = tracaNewtoniano(45);

export const historiaOptica: Ilustracao = {
  leg: 'A luz entra pela direita. A ocular de Galileu fica antes do foco, a de Kepler, depois, e Newton troca a lente por um espelho.',
  draw(c, w, h, t) {
    const alto = h / 3;
    HISTORIA.forEach(({ nome, nota, lado }, i) => {
      const esc = Math.min((w * 0.8) / 13, alto * 0.24);
      const x0 = (w - 13 * esc) / 2 + 1.5 * esc;
      const yc = alto * i + alto * 0.62;
      const X = (x: number): number => x0 + x * esc;
      const Y = (y: number): number => yc - y * esc;
      const k = Math.min(1, ((t + i * 0.4) % 6) / 2);
      const linhas = lado ? refrator(lado).raios : NEWTON.raios.map((r) => r.pontos);
      c.save();
      c.beginPath();
      c.rect(X(12) - k * 15 * esc, 0, w, h);
      c.clip();
      c.strokeStyle = COR_LUZ;
      c.lineWidth = 1.4;
      for (const pontos of linhas) {
        c.beginPath();
        pontos.forEach(([x, y], j) => (j ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))));
        c.stroke();
      }
      c.restore();
      if (lado) {
        lente(c, X(OBJ), yc, esc, true);
        lente(c, X(refrator(lado).ocular), yc, esc * 0.5, lado === -1);
      } else {
        const { secundario, metadeSecundario, tubo } = GEOMETRIA.newtoniano;
        const m = metadeSecundario * Math.SQRT1_2;
        c.strokeStyle = 'rgba(183,180,196,.6)';
        c.lineWidth = 1.2;
        c.strokeRect(X(0), Y(1), tubo * esc, 2 * esc);
        c.strokeStyle = 'rgba(217,226,242,.95)';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(X(0.2), Y(1));
        c.quadraticCurveTo(X(-0.2), yc, X(0.2), Y(-1));
        c.moveTo(X(secundario - m), Y(-m));
        c.lineTo(X(secundario + m), Y(m));
        c.stroke();
      }
      rotulo(c, nome, 6, alto * i + 13, COR.ink, 'left', 11);
      rotulo(c, nota, w - 6, alto * i + 13, COR.muted, 'right', 11);
    });
  },
};

const QUADROS: [string, number, Tracado][] = [
  ['Refrator', GEOMETRIA.refrator.tubo, tracaRefrator(false)],
  ['Newtoniano', GEOMETRIA.newtoniano.tubo, tracaNewtoniano(45)],
  ['Cassegrain', GEOMETRIA.cassegrain.tubo, tracaCassegrain('convexo', GEOMETRIA.cassegrain.posicaoIdeal)],
  [
    'Schmidt-Cassegrain',
    GEOMETRIA.cassegrain.tubo,
    tracaCassegrain('convexo', GEOMETRIA.cassegrain.posicaoIdeal),
  ],
];

export const arranjos: Ilustracao = {
  leg: 'A luz entra pela direita. Lente, espelhos e furos mudam o caminho até a ocular.',
  draw(c, w, h, t) {
    const alto = h / 4;
    QUADROS.forEach(([nome, tubo, tr], i) => {
      // Uma unidade da cena = esc px; o tubo mais longo (9) cabe na largura.
      const esc = Math.min((w * 0.62) / 9, alto * 0.22);
      // Espaço à esquerda para os raios que saem por trás do tubo (até x = −2,6 no Cassegrain).
      const x0 = 2.8 * esc + 6;
      const yc = alto * i + alto * 0.62;
      const X = (x: number): number => x0 + x * esc;
      const Y = (y: number): number => yc - y * esc;
      c.strokeStyle = 'rgba(183,180,196,.6)';
      c.lineWidth = 1.2;
      c.strokeRect(X(0), Y(1), tubo * esc, 2 * esc);
      if (i === 3) {
        c.strokeStyle = 'rgba(159,216,255,.8)';
        c.beginPath();
        c.moveTo(X(tubo), Y(1));
        c.lineTo(X(tubo), Y(-1));
        c.stroke();
      }
      // A luz vai aparecendo da direita para a esquerda, em 2 s, depois fica.
      const k = Math.min(1, ((t + i * 0.3) % 6) / 2);
      c.save();
      c.beginPath();
      c.rect(X(tubo + 3) - k * (tubo + 5) * esc, 0, w, h);
      c.clip();
      for (const r of tr.raios) {
        c.strokeStyle = r.cor;
        c.lineWidth = 1.4;
        c.beginPath();
        r.pontos.forEach(([x, y], j) => (j ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))));
        c.stroke();
      }
      c.restore();
      rotulo(c, nome, 6, alto * i + 13, COR.ink, 'left', 11);
    });
  },
};
