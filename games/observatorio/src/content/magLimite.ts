/**
 * Textos da fase 4 (magnitude limite e ganho de luz). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { PUPILA_MM } from '@shared/physics/constantes';
import { ganhoDeLuz, magnitudeLimite } from '@shared/physics/telescopio';

export const NOME_FASE = 'Observatório · Magnitude limite';

/** Aberturas para escolher, em mm (7 mm é a pupila do olho no escuro). */
export const ABERTURAS = [PUPILA_MM, 50, 70, 100, 150, 200, 300];

/** A galáxia fraca do campo: magnitude visual (como as galáxias que um telescópio pequeno já mostra). */
export const GALAXIA_MAG = 10.8;

export const MISSOES = {
  galaxia: 'Aumente a abertura até a galáxia aparecer',
  menor: 'Ache a menor abertura que ainda mostra a galáxia',
};

export const ROTULOS = {
  abertura: (d: number): string => (d === PUPILA_MM ? 'Olho (7 mm)' : `${fmt(d, 0)} mm`),
  campo: 'O mesmo pedaço do céu',
  galaxia: 'galáxia',
  balde: 'Luz que entra',
  olho: 'olho',
  telescopio: 'telescópio',
};

export const AVISOS = {
  galaxia: 'Lá está ela! Uma mancha fraquinha que o olho não vê',
  menor: 'Isso! Essa é a menor abertura que ainda junta luz suficiente',
  sumiu: 'Sumiu: essa abertura não junta luz suficiente',
  maior: 'Aparece, mas dá para ver com uma abertura menor',
};

export const HUD = {
  abertura: 'Abertura',
  estrelas: 'Estrelas visíveis',
  ganho: 'Ganho de luz',
  limite: 'Magnitude limite',
};

const D = 200;

export const intro: CardDef = {
  eyebrow: 'Observatório · Magnitude limite',
  ilus: 'baldes',
  titulo: 'Um balde de luz',
  corpo:
    `<p>O trabalho mais importante do telescópio é <b>juntar luz</b>. A pupila do olho tem uns ${fmt(PUPILA_MM, 0)} mm no escuro; um telescópio de ${D} mm junta a luz de uma área centenas de vezes maior.</p>` +
    '<p>Por isso ele mostra estrelas e galáxias fracas que o olho nunca veria, como um balde grande pega mais chuva que um copinho.</p>' +
    '<p>Aumente a abertura e procure a galáxia escondida no campo.</p>',
  avancado:
    M.bloco(
      M.v('G') +
        M.o('=') +
        M.pot(M.o('(') + M.fr(M.v('D'), M.ind(M.v('d'), M.t('olho'))) + M.o(')'), M.n(2)) +
        M.esp() +
        M.ind(M.v('m'), M.t('lim')) +
        M.o('≈') +
        M.n(6) +
        M.o('+') +
        M.n(5) +
        M.o('·') +
        M.ind(M.t('log'), M.n(10)) +
        M.o('(') +
        M.fr(M.v('D'), M.ind(M.v('d'), M.t('olho'))) +
        M.o(')'),
    ) +
    `<p>Com ${D} mm: ganho de uns ${fmt(ganhoDeLuz(D), 0)} vezes, e a magnitude limite sobe de 6, a olho nu, para uns ${fmt(magnitudeLimite(D), 1)}.</p>`,
  dica: 'Os botões das aberturas ficam embaixo',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Observatório · Magnitude limite',
  ilus: 'baldes',
  titulo: 'Abertura é tudo',
  corpo:
    '<p>Cada vez que a abertura dobra, o telescópio junta 4 vezes mais luz e mostra estrelas mais fracas. É por isso que os grandes observatórios têm espelhos de vários metros.</p>' +
    '<p>O aumento ajuda a ver detalhes, mas é a abertura que decide o que dá para ver.</p>',
  avancado: `<p>A galáxia tem magnitude ${fmt(GALAXIA_MAG, 1)}: precisa de uma magnitude limite maior que isso, o que pede uns ${fmt(PUPILA_MM * 10 ** ((GALAXIA_MAG - 6) / 5), 0)} mm de abertura.</p>`,
};

export const DESAFIO = {
  titulo: 'O ganho de luz',
  texto: `Quantas vezes mais luz um telescópio de ${D} mm junta que o olho, com a pupila de ${fmt(PUPILA_MM, 0)} mm?`,
  formula: M.bloco(
    M.v('G') + M.o('=') + M.pot(M.o('(') + M.fr(M.v('D'), M.ind(M.v('d'), M.t('olho'))) + M.o(')'), M.n(2)),
  ),
  unidade: 'vezes',
  resposta: ganhoDeLuz(D),
  tolerancia: 20,
  msgAcerto: `Isso! Umas ${fmt(ganhoDeLuz(D), 0)} vezes mais luz.`,
};
