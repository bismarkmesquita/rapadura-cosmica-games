/**
 * Todas as fórmulas do jogo, em MathML, num lugar só: os blocos Avançado das fases e o Formulário usam as
 * mesmas. Veja shared/math/mathml.ts para o construtor M.
 */
import { M } from '@shared/math/mathml';

const log = (dentro: string): string => M.ind(M.t('log'), M.n(10)) + M.o('(') + dentro + M.o(')');
const ind = (v: string, i: string | number): string => M.ind(M.v(v), typeof i === 'number' ? M.n(i) : M.t(i));
const menos25log = (dentro: string): string => M.o('−') + M.n('2,5') + M.o('·') + log(dentro);

export const FORMULAS = {
  angulo: M.bloco(M.v('θ') + M.o('[″]') + M.o('≈') + M.n('206 265') + M.o('·') + M.fr(M.v('D'), M.v('d'))),
  paralaxe: M.bloco(M.v('d') + M.o('[pc]') + M.o('=') + M.fr(M.n(1), M.v('p') + M.o('[″]'))),
  luminosidade: M.bloco(
    M.v('L') + M.o('=') + M.n(4) + M.v('π') + M.pot(M.v('R'), M.n(2)) + M.v('σ') + M.pot(M.v('T'), M.n(4)),
  ),
  fluxo: M.bloco(M.v('F') + M.o('=') + M.fr(M.v('L'), M.n(4) + M.v('π') + M.pot(M.v('d'), M.n(2)))),
  pogson: M.bloco(
    ind('m', 1) + M.o('−') + ind('m', 2) + M.o('=') + menos25log(M.fr(ind('F', 1), ind('F', 2))),
  ),
  razaoFluxos: M.bloco(
    M.fr(ind('F', 1), ind('F', 2)) +
      M.o('=') +
      M.pot(M.n(10), M.o('−') + M.n('0,4') + M.o('(') + ind('m', 1) + M.o('−') + ind('m', 2) + M.o(')')),
  ),
  absolutaLuminosidade: M.bloco(
    ind('M', 1) + M.o('−') + ind('M', 2) + M.o('=') + menos25log(M.fr(ind('L', 1), ind('L', 2))),
  ),
  moduloDistancia: M.bloco(
    M.v('m') + M.o('−') + M.v('M') + M.o('=') + M.n(5) + M.o('·') + log(M.v('d')) + M.o('−') + M.n(5),
  ),
  absoluta: M.bloco(
    M.v('M') + M.o('=') + M.v('m') + M.o('−') + M.n(5) + M.o('·') + log(M.fr(M.v('d'), M.n(10) + M.t(' pc'))),
  ),
  distancia: M.bloco(
    M.v('d') +
      M.o('=') +
      M.pot(
        M.n(10),
        M.o('(') + M.v('m') + M.o('−') + M.v('M') + M.o('+') + M.n(5) + M.o(')') + M.o('/') + M.n(5),
      ),
  ),
  bolometrica: M.bloco(
    ind('M', 'bol') + M.o('−') + ind('M', 'bol,☉') + M.o('=') + menos25log(M.fr(M.v('L'), ind('L', '☉'))),
  ),
  correcao: M.bloco(M.v('BC') + M.o('=') + ind('M', 'bol') + M.o('−') + ind('M', 'V')),
  cefeida: M.bloco(
    ind('M', 'V') +
      M.o('=') +
      M.o('−') +
      M.n('2,43') +
      M.o('(') +
      M.ind(M.t('log'), M.n(10)) +
      M.v('P') +
      M.o('−') +
      M.n(1) +
      M.o(')') +
      M.o('−') +
      M.n('4,05'),
  ),
};
