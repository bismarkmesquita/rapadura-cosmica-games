/**
 * Textos da fase 3 (fluxo e luminosidade). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { FORMULAS } from './formulas';
import { fmt } from '@shared/math/format';
import { fluxo } from '@shared/physics/distancias';
import { LUMINOSIDADE_SOL_W, UA_KM } from '@shared/physics/constantes';

export const NOME_FASE = 'Fase 3 · Fluxo';

/** Potência das duas lâmpadas, em watts: a B é 4 vezes mais forte, então fica igual ao dobro da distância. */
export const LAMPADAS = {
  a: { nome: 'A', potencia: 25 },
  b: { nome: 'B', potencia: 100 },
};

export const MISSOES = {
  iguais: 'Deixe as duas lâmpadas com o mesmo brilho no medidor',
  pergunta: 'Responda à pergunta sobre as estrelas',
};

export const ROTULOS = {
  medidor: 'Medidor de brilho',
  lampada: (nome: string, potencia: number): string => `${nome} · ${potencia} W`,
  distancia: (nome: string): string => `Distância da lâmpada ${nome}`,
  lampadaCurta: (nome: string): string => `Lâmpada ${nome}`,
  metros: (d: number): string => `${fmt(d, 1)} m`,
  iguais: 'Mesmo brilho!',
  arraste: 'arraste',
};

export const HUD = {
  medidor: 'No medidor',
  maisForte: (nome: string): string => `${nome} brilha mais`,
  iguais: 'brilhos iguais',
  fluxo: (nome: string): string => `Fluxo de ${nome}`,
};

export const AVISOS = {
  iguais: (vezes: number): string =>
    `A lâmpada B está ${fmt(vezes, 1)} vezes mais longe e é 4 vezes mais forte: o brilho fica igual!`,
};

export const PERGUNTA = {
  titulo: 'E as estrelas?',
  texto: 'Olhando só o céu, dá para saber qual estrela é a mais potente?',
  opcoes: [
    {
      texto: 'Sim: é a que brilha mais',
      certa: false,
      resposta:
        'Não dá: uma estrela fraca e perto pode brilhar mais que uma potente e longe, como as lâmpadas.',
    },
    { texto: 'Não: falta saber a distância', certa: true, resposta: 'Isso!' },
  ],
};

export const intro: CardDef = {
  eyebrow: 'Fase 3 · Fluxo e luminosidade',
  ilus: 'fluxo',
  titulo: 'A luz se espalha',
  corpo:
    '<p><b>Luminosidade</b> é quanta luz a estrela emite por segundo, ao todo. <b>Fluxo</b> é quanto dessa luz chega em cada pedacinho de área aqui, onde estamos.</p>' +
    '<p>A luz se espalha ao se afastar. No dobro da distância, a mesma luz cobre uma área 4 vezes maior, então fica <b>4 vezes mais fraca</b>.</p>' +
    '<p>Aproxime e afaste as duas lâmpadas e veja o medidor.</p>',
  avancado:
    '<p>A luminosidade depende do tamanho e da temperatura da estrela (lei de Stefan–Boltzmann):</p>' +
    FORMULAS.luminosidade +
    '<p>R é o raio, T a temperatura da superfície e σ = 5,67 × 10⁻⁸ W/(m²·K⁴). Com o raio e a temperatura do Sol, dá 3,83 × 10²⁶ W.</p>' +
    '<p>Longe da estrela, a luz se espalha numa esfera de área 4πd². O fluxo é a luminosidade dividida por essa área:</p>' +
    FORMULAS.fluxo +
    '<p>F em W/m², L em watts e d em metros.</p>',
  dica: 'Arraste as lâmpadas ou use as barras embaixo',
  botao: 'Começar',
};

// Valores arredondados, como aparecem no texto do desafio; a resposta sai deles.
const L_SOL = 3.83e26;
const D_SOL = 1.5e11;
const CONSTANTE_SOLAR = fluxo(LUMINOSIDADE_SOL_W, UA_KM * 1000);

export const fim: CardDef = {
  eyebrow: 'Régua 3 · Fluxo',
  ilus: 'fluxo',
  titulo: 'Brilho não é potência',
  corpo:
    '<p>A lâmpada de 100 W, duas vezes mais longe, parece igual à de 25 W. Com as estrelas é a mesma coisa: uma estrela que brilha muito no céu pode ser fraca e estar perto.</p>' +
    '<p>Para comparar estrelas, os astrônomos precisam de duas coisas: uma escala para o brilho que vemos (fase 4) e um jeito de descontar a distância (fase 5).</p>',
  avancado: `<p>Na distância da Terra, o Sol entrega cerca de ${fmt(CONSTANTE_SOLAR, 0)} W em cada metro quadrado: é a <b>constante solar</b>. Em Júpiter, 5,2 vezes mais longe, chega 27 vezes menos.</p>`,
};

export const DESAFIO = {
  titulo: 'A luz do Sol aqui',
  texto: 'O Sol emite L = 3,83 × 10²⁶ W e está a d = 1,50 × 10¹¹ m. Quanto dessa luz chega em cada m² aqui?',
  formula: M.bloco(M.v('F') + M.o('=') + M.fr(M.v('L'), M.n(4) + M.v('π') + M.pot(M.v('d'), M.n(2)))),
  unidade: 'W/m²',
  resposta: fluxo(L_SOL, D_SOL),
  tolerancia: 20,
  msgAcerto: `Isso! Cerca de ${fmt(CONSTANTE_SOLAR, 0)} W/m²: a constante solar.`,
};
