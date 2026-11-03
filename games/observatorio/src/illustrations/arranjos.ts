/** Ilustração da fase 1: os quatro arranjos ópticos lado a lado, com o caminho da luz. */
import type { Ilustracao } from '@shared/ui/illustration';
import { COR, rotulo } from '@shared/draw/helpers';
import {
  GEOMETRIA,
  tracaCassegrain,
  tracaNewtoniano,
  tracaRefrator,
  type Tracado,
} from '@shared/physics/optica';

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
