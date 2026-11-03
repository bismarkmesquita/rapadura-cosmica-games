/**
 * Textos da fase 7 (velas-padrão). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { FORMULAS } from './formulas';
import { fmt } from '@shared/math/format';
import { distanciaPorModulo, magnitudeAparente, magnitudeCefeida } from '@shared/physics/distancias';

export const NOME_FASE = 'Fase 7 · Velas-padrão';

/**
 * Duas galáxias inventadas, com uma Cefeida cada (período em dias, distância em parsecs). A de B pisca mais
 * devagar (é mais potente) e parece um pouco mais brilhante, mas está duas vezes mais longe.
 */
export const GALAXIAS = [
  { id: 'a', nome: 'Galáxia A', periodo: 5, distPc: 750_000 },
  { id: 'b', nome: 'Galáxia B', periodo: 30, distPc: 1_560_000 },
].map((g) => {
  const M = magnitudeCefeida(g.periodo);
  return { ...g, M, m: magnitudeAparente(M, g.distPc) };
});

export const MISSOES = {
  periodos: 'Meça com o cronômetro o período da Cefeida de cada galáxia',
  qual: 'Responda: qual galáxia está mais longe?',
};

export const ROTULOS = {
  cronometro: '⏱ Marcar brilho máximo',
  medindo: '⏱ Marcar o próximo máximo',
  periodo: (dias: number | null): string => (dias === null ? 'período: ?' : `período: ${fmt(dias, 0)} dias`),
  brilhoAqui: 'brilho visto daqui',
  grafico: 'Período × brilho real das Cefeidas',
  curva: (nome: string): string => `${nome} · brilho ao longo dos dias`,
  eixoPeriodo: 'período (dias)',
  maisPotente: 'mais potente ▲',
  dias: (d: number): string => `${fmt(d, 0)}`,
  m: (m: number): string => `m = ${fmt(m, 2)}`,
  M: (M: number): string => `M = ${fmt(M, 2)}`,
};

export const AVISOS = {
  medindo: 'Marque de novo no próximo brilho máximo',
  errado: 'Não deu um ciclo inteiro. Marque de um brilho máximo até o seguinte',
  medido: (nome: string, dias: number): string => `${nome}: a Cefeida pisca a cada ${fmt(dias, 0)} dias`,
};

export const PERGUNTA = {
  titulo: 'Qual galáxia está mais longe?',
  texto: 'A Cefeida de B pisca mais devagar, mas as duas parecem quase igualmente brilhantes.',
  opcoes: [
    {
      texto: 'A Galáxia A',
      certa: false,
      resposta:
        'Quem pisca mais devagar é mais potente. Se a Cefeida de B é mais potente e parece quase igual, é porque está mais longe.',
    },
    { texto: 'A Galáxia B', certa: true, resposta: '' },
  ],
};

const [A, B] = GALAXIAS;
const kpc = (pc: number): string =>
  pc >= 1e6
    ? `${fmt(pc / 1e6, 1)} ${pc >= 2e6 ? 'milhões' : 'milhão'} de parsecs`
    : `${fmt(pc / 1000, 0)} mil parsecs`;
// O desafio usa m e M arredondados, como aparecem no texto; a resposta sai deles.
const mA = Math.round(A.m * 100) / 100;
const MA = Math.round(A.M * 100) / 100;

export const intro: CardDef = {
  eyebrow: 'Fase 7 · Leavitt · 1912',
  ilus: 'cefeida',
  titulo: 'Estrelas que piscam no ritmo do brilho',
  corpo:
    '<p>A paralaxe só funciona para estrelas próximas. Mais longe, os astrônomos usam <b>velas-padrão</b>: astros cujo brilho real já se conhece.</p>' +
    '<p><b>Henrietta Leavitt</b> descobriu que as Cefeidas pulsam num ritmo ligado ao brilho real: <b>quanto mais devagar piscam, mais potentes são</b>. Hubble usou isso para mostrar que Andrômeda fica fora da Via Láctea.</p>' +
    '<p>Meça o ritmo das Cefeidas de duas galáxias e descubra qual está mais longe.</p>',
  avancado:
    '<p>A relação período–luminosidade das Cefeidas usada no jogo (P em dias):</p>' +
    FORMULAS.cefeida +
    '<p>Com M lida no gráfico e m medida, o módulo de distância invertido dá a distância em parsecs:</p>' +
    FORMULAS.distancia,
  dica: porDispositivo(
    'Clique no cronômetro quando a estrela estiver no brilho máximo',
    'Toque no cronômetro quando a estrela estiver no brilho máximo',
  ),
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 7 · Velas-padrão',
  ilus: 'cefeida',
  titulo: 'O ritmo revela a distância',
  corpo:
    `<p>A Cefeida de B pisca a cada ${fmt(B.periodo, 0)} dias e é bem mais potente que a de A, que pisca a cada ${fmt(A.periodo, 0)}. Se as duas parecem quase iguais, B está mais longe: uns ${kpc(B.distPc)}, contra ${kpc(A.distPc)} de A.</p>` +
    '<p>Mais longe ainda, as Cefeidas ficam fracas demais. Aí entram as <b>supernovas do tipo Ia</b>, explosões que têm quase sempre o mesmo brilho real e se veem a bilhões de anos-luz.</p>',
  avancado:
    '<p>As Cefeidas são calibradas com paralaxes de Cefeidas próximas, e as supernovas, com Cefeidas de galáxias onde as duas aparecem: cada régua apoia a seguinte.</p>',
};

export const DESAFIO = {
  titulo: 'A distância da Galáxia A',
  texto: `Na Galáxia A, a Cefeida tem m = ${fmt(mA, 2)} e, pelo gráfico, M = ${fmt(MA, 2)}. A que distância está a galáxia, em milhares de parsecs?`,
  formula: M.bloco(
    M.v('d') +
      M.o('=') +
      M.pot(
        M.n(10),
        M.o('(') + M.v('m') + M.o('−') + M.v('M') + M.o('+') + M.n(5) + M.o(')') + M.o('/') + M.n(5),
      ),
  ),
  unidade: 'mil pc',
  resposta: distanciaPorModulo(mA, MA) / 1000,
  tolerancia: 40,
  msgAcerto: `Isso! Uns ${kpc(distanciaPorModulo(mA, MA))}: perto da distância de Andrômeda.`,
};
