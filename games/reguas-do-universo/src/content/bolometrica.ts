/**
 * Textos da fase 6 (magnitude bolométrica). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { ESTRELAS, MAG_BOL_SOL, SOL } from '@shared/physics/constantes';
import {
  correcaoBolometrica,
  fracoesDoEspectro,
  luminosidadePorMagBol,
  magBolPorLuminosidade,
} from '@shared/physics/distancias';

export const NOME_FASE = 'Fase 6 · Bolométrica';

/**
 * As três estrelas do visor, todas colocadas a 10 pc, com a luminosidade real (L☉) e a temperatura da
 * superfície (K). O brilho em cada filtro é a luminosidade vezes a fração da luz naquela faixa (corpo negro).
 */
export const ESTRELAS_FASE = [
  {
    id: 'spica',
    nome: 'Spica',
    T: ESTRELAS.spica.temperaturaK,
    L: ESTRELAS.spica.luminosidade,
    cor: '#a9c4ff',
  },
  { id: 'sol', nome: 'Sol', T: SOL.temperaturaK, L: 1, cor: '#fff1c4' },
  {
    id: 'betelgeuse',
    nome: 'Betelgeuse',
    T: ESTRELAS.betelgeuse.temperaturaK,
    L: ESTRELAS.betelgeuse.luminosidade,
    cor: '#ff9a6a',
  },
].map((e) => ({
  ...e,
  fracoes: fracoesDoEspectro(e.T),
  mBol: magBolPorLuminosidade(e.L),
  bc: correcaoBolometrica(e.T),
}));

const [SPICA, , BETELGEUSE] = ESTRELAS_FASE;

export const FILTROS = {
  uv: 'Ultravioleta',
  visivel: 'Visível',
  iv: 'Infravermelho',
  tudo: 'Tudo',
};

export const MISSOES = {
  uv: 'Ache o filtro em que Spica brilha mais que Betelgeuse',
  pergunta: 'Responda: por que Spica parece fraca no visível?',
};

export const ROTULOS = {
  visor: (filtro: string): string => `Visor · filtro ${filtro}`,
  legenda: 'As três a 10 parsecs, com o brilho real',
  grafico: 'Quanta luz cada estrela emite em cada cor',
  /** Perto das outras duas, a curva do Sol fica achatada no fundo do gráfico. */
  nomeNoGrafico: (nome: string, id: string): string => (id === 'sol' ? `${nome} (quase não aparece)` : nome),
  uv: 'ultravioleta',
  visivel: 'visível',
  iv: 'infravermelho',
  nm: (l: number): string => `${fmt(l, 0)} nm`,
  temperatura: (T: number): string => `${fmt(T, 0)} K`,
};

export const AVISOS = {
  uv: 'Isso! No ultravioleta Spica ganha: é lá que está quase toda a luz dela',
};

export const HUD = {
  filtro: 'Filtro',
  lum: (L: number): string => `L = ${fmt(L, 0)} L☉`,
  mBol: (mBol: number): string => `M bol = ${fmt(mBol, 1)}`,
  bc: (bc: number): string => `BC ≈ ${fmt(bc, 1)}`,
};

const pct = (f: number): string => `${fmt(f * 100, 0)}%`;
const MBOL_DESAFIO = MAG_BOL_SOL - 5;

export const PERGUNTA = {
  titulo: 'Por que, no filtro Visível, Spica parece mais fraca do que é?',
  texto: '',
  opcoes: [
    {
      texto: 'Porque está mais longe',
      certa: false,
      resposta: 'Não: no visor as três estão à mesma distância, 10 parsecs.',
    },
    { texto: 'Porque quase toda a luz dela é ultravioleta', certa: true, resposta: '' },
    {
      texto: 'Porque é uma estrela fria',
      certa: false,
      resposta: 'Ao contrário: Spica é bem quente. As estrelas frias soltam a luz no infravermelho.',
    },
  ],
};

export const intro: CardDef = {
  eyebrow: 'Fase 6 · Magnitude bolométrica',
  ilus: 'espectro',
  titulo: 'Existe luz que o olho não vê',
  corpo:
    '<p>As magnitudes comuns medem só a luz que o olho vê. A <b>magnitude bolométrica</b> conta toda a energia: ultravioleta, visível e infravermelho.</p>' +
    '<p>Estrelas muito quentes emitem quase tudo em ultravioleta; as muito frias, em infravermelho. Por isso as duas parecem mais fracas do que realmente são.</p>' +
    '<p>No visor estão Spica, o Sol e Betelgeuse, todas a 10 parsecs. Troque o filtro e veja o brilho de cada uma mudar.</p>',
  avancado:
    '<p>A correção bolométrica é a diferença entre as duas magnitudes. Ela é negativa ou perto de zero:</p>' +
    M.bloco(M.v('BC') + M.o('=') + M.ind(M.v('M'), M.t('bol')) + M.o('−') + M.ind(M.v('M'), M.v('V'))) +
    `<p>A magnitude bolométrica dá a luminosidade (Sol: ${fmt(MAG_BOL_SOL, 2)}):</p>` +
    M.bloco(
      M.ind(M.v('M'), M.t('bol')) +
        M.o('−') +
        M.ind(M.v('M'), M.t('bol,☉')) +
        M.o('=') +
        M.o('−') +
        M.n('2,5') +
        M.o('·') +
        M.ind(M.t('log'), M.n(10)) +
        M.o('(') +
        M.fr(M.v('L'), M.ind(M.v('L'), M.t('☉'))) +
        M.o(')'),
    ),
  dica: 'Os botões dos filtros ficam embaixo',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 6 · Magnitude bolométrica',
  ilus: 'espectro',
  titulo: 'Toda a luz conta',
  corpo:
    `<p>Spica emite uns ${fmt(Math.round(SPICA.L / 100) * 100, 0)} sóis de luz, mas só ${pct(SPICA.fracoes.visivel)} no visível: o resto é ultravioleta. Por isso, ao olho, ela parece bem mais fraca do que é.</p>` +
    `<p>Betelgeuse, a mais luminosa das três, solta ${pct(BETELGEUSE.fracoes.iv)} da luz em infravermelho. E o Sol, a 10 parsecs, seria só um pontinho. Para medir a energia toda de uma estrela, os telescópios espaciais olham também no ultravioleta e no infravermelho.</p>`,
  avancado:
    '<table><thead><tr><th>Estrela</th><th>T (K)</th><th>L (L☉)</th><th>M<sub>bol</sub></th><th>BC</th></tr></thead><tbody>' +
    ESTRELAS_FASE.map(
      (e) =>
        `<tr><td>${e.nome}</td><td>${fmt(e.T, 0)}</td><td>${fmt(e.L, 0)}</td><td>${fmt(e.mBol, 2)}</td><td>${fmt(e.bc, 2)}</td></tr>`,
    ).join('') +
    '</tbody></table>' +
    '<p>BC do modelo de corpo negro: nas tabelas reais, uma estrela como Spica tem BC perto de −2,5. A luminosidade de Betelgeuse é incerta: os estudos dão de 65 mil a 87 mil sóis.</p>',
};

export const DESAFIO = {
  titulo: 'A luminosidade de uma estrela',
  texto: `Uma estrela tem magnitude bolométrica absoluta ${fmt(MBOL_DESAFIO, 2)}. Quantas vezes ela é mais luminosa que o Sol?`,
  formula: M.bloco(
    M.fr(M.v('L'), M.ind(M.v('L'), M.t('☉'))) +
      M.o('=') +
      M.pot(
        M.n(10),
        M.n('0,4') +
          M.o('(') +
          M.ind(M.v('M'), M.t('bol,☉')) +
          M.o('−') +
          M.ind(M.v('M'), M.t('bol')) +
          M.o(')'),
      ),
  ),
  unidade: 'vezes',
  resposta: luminosidadePorMagBol(MBOL_DESAFIO),
  tolerancia: 3,
  msgAcerto: '5 magnitudes a menos: 100 vezes mais luminosa.',
};
