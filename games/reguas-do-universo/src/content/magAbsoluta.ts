/**
 * Textos da fase 5 (magnitude absoluta). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { FORMULAS } from './formulas';
import { fmt } from '@shared/math/format';
import { ESTRELAS, SOL } from '@shared/physics/constantes';
import { magnitudeAbsoluta, razaoDeBrilho, SEGUNDOS_POR_RADIANO } from '@shared/physics/distancias';

export const NOME_FASE = 'Fase 5 · Magnitude absoluta';

/** Estrelas da fase: magnitude aparente e distância em parsecs (o Sol está a 1 UA). */
export const ESTRELAS_FASE = [
  { id: 'sol', nome: 'Sol', mag: SOL.magAparente, distPc: 1 / SEGUNDOS_POR_RADIANO, cor: '#fff1c4' },
  { id: 'sirius', nome: 'Sirius', mag: ESTRELAS.sirius.mag, distPc: ESTRELAS.sirius.distPc, cor: '#eef2ff' },
  { id: 'vega', nome: 'Vega', mag: ESTRELAS.vega.mag, distPc: ESTRELAS.vega.distPc, cor: '#f4f6ff' },
  { id: 'rigel', nome: 'Rigel', mag: ESTRELAS.rigel.mag, distPc: ESTRELAS.rigel.distPc, cor: '#bcd2ff' },
];

const absoluta = (id: string): number => {
  const e = ESTRELAS_FASE.find((x) => x.id === id);
  return e ? magnitudeAbsoluta(e.mag, e.distPc) : 0;
};
const rigelSirius = razaoDeBrilho(absoluta('rigel'), absoluta('sirius'));
const siriusRigelNoCeu = razaoDeBrilho(ESTRELAS.sirius.mag, ESTRELAS.rigel.mag);

export const MISSOES = {
  previsao: 'Antes de arrastar, faça sua previsão',
  linha: 'Arraste cada estrela até a linha de 10 parsecs',
};

export const ROTULOS = {
  terra: 'Terra',
  linha: '10 parsecs',
  eixo: 'distância até a Terra (cada marca: 10 vezes mais longe)',
  arraste: 'arraste',
  ua: '1 UA',
  pc: (d: number): string => `${fmt(d, 0)} pc`,
};

export const PREVISAO = {
  titulo: 'Sua previsão:',
  texto: 'se todas estivessem a 10 parsecs, qual brilharia mais?',
};

export const AVISOS = {
  prever: 'Primeiro faça sua previsão, embaixo',
  naLinha: (nome: string): string => `${nome} chegou aos 10 parsecs`,
  acertou: 'Você acertou a previsão!',
  errou: (nome: string): string => `Surpresa! Quem mais brilha é Rigel, não ${nome}`,
};

export const intro: CardDef = {
  eyebrow: 'Fase 5 · Magnitude absoluta',
  ilus: 'dezParsecs',
  titulo: 'Todas na mesma distância',
  corpo:
    '<p>Para comparar o brilho real das estrelas, os astrônomos imaginam todas na mesma distância: <b>10 parsecs</b>, uns 33 anos-luz. O brilho que a estrela teria lá é a <b>magnitude absoluta</b>.</p>' +
    `<p>O Sol, que domina o nosso céu, lá seria uma estrela fraquinha, de magnitude ${fmt(SOL.magAbsoluta, 1)}.</p>` +
    '<p>Faça uma previsão e depois leve cada estrela até a linha dos 10 parsecs.</p>',
  avancado:
    '<p>A magnitude absoluta é a régua da <b>luminosidade</b>, como a aparente é a do fluxo:</p>' +
    FORMULAS.absolutaLuminosidade +
    '<p>O módulo de distância liga a magnitude aparente m, a absoluta M e a distância d em parsecs:</p>' +
    FORMULAS.moduloDistancia +
    '<p>Ou, isolando M:</p>' +
    FORMULAS.absoluta,
  dica: 'Arraste as estrelas para os lados',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 5 · Magnitude absoluta',
  ilus: 'dezParsecs',
  titulo: 'Rigel é a mais potente',
  corpo:
    `<p>No céu, Rigel parece umas ${fmt(siriusRigelNoCeu, 0)} vezes mais fraca que Sirius. Mas a 10 parsecs ela brilharia cerca de <b>${fmt(Math.round(rigelSirius / 100) * 100, 0)} vezes mais</b>: ela só parece fraca porque está muito mais longe.</p>` +
    '<p>Com a magnitude absoluta dá para comparar a potência das estrelas. E o contrário também vale: se a gente souber a magnitude absoluta de uma estrela, o brilho aparente diz a distância. É a ideia da última régua.</p>',
  avancado:
    '<table><thead><tr><th>Estrela</th><th>m</th><th>d (pc)</th><th>M</th></tr></thead><tbody>' +
    ESTRELAS_FASE.map(
      (e) =>
        `<tr><td>${e.nome}</td><td>${fmt(e.mag, 2)}</td><td>${e.id === 'sol' ? ROTULOS.ua : fmt(e.distPc, 2)}</td><td>${fmt(magnitudeAbsoluta(e.mag, e.distPc), 2)}</td></tr>`,
    ).join('') +
    '</tbody></table>',
};

export const DESAFIO = {
  titulo: 'A magnitude absoluta de Sirius',
  texto: `Sirius tem m = ${fmt(ESTRELAS.sirius.mag, 2)} e está a ${fmt(ESTRELAS.sirius.distPc, 2)} pc. Qual é a magnitude absoluta dela?`,
  formula: M.bloco(
    M.v('M') +
      M.o('=') +
      M.v('m') +
      M.o('−') +
      M.n(5) +
      M.o('·') +
      M.ind(M.t('log'), M.n(10)) +
      M.o('(') +
      M.fr(M.v('d'), M.n(10)) +
      M.o(')'),
  ),
  unidade: 'M',
  resposta: absoluta('sirius'),
  tolerancia: 0.1,
  msgAcerto: `Isso! M ≈ ${fmt(absoluta('sirius'), 1)}: a 10 pc, Sirius ainda seria bem visível.`,
};
