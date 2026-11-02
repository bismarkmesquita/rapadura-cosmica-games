/**
 * Textos da fase 2 (paralaxe). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { ESTRELAS, PARSEC_ANOS_LUZ } from '@shared/physics/constantes';
import { distanciaPorParalaxe, SEGUNDOS_POR_RADIANO } from '@shared/physics/distancias';
import { MOEDA_MM } from './angulos';

export const NOME_FASE = 'Fase 2 · Paralaxe';

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MISSOES = {
  ano: 'Passe os meses e veja as estrelas pularem',
  ordem: porDispositivo(
    'Clique nas estrelas A, B e C da mais perto para a mais longe',
    'Toque nas estrelas A, B e C da mais perto para a mais longe',
  ),
};

export const ROTULOS = {
  orbita: 'Órbita da Terra, vista de cima',
  telescopio: 'Visto pelo telescópio',
  fundo: 'estrelas muito distantes',
  proxima: 'estrela próxima',
  terra: 'Terra',
  janeiro: 'janeiro',
  julho: 'julho',
  foraDeEscala: 'Pulos aumentados milhares de vezes',
  segundo: '1″',
  mes: 'Mês',
  passar: '▶ Passar o ano',
  parar: '❚❚ Parar',
};

export const AVISOS = {
  primeiro: 'Primeiro passe os meses e repare nas estrelas',
  ano: 'Viu? Umas pulam mais que as outras',
  errado: 'Ainda não. Repare no tamanho do pulo de cada uma',
  certo: 'Isso! Quanto menor o pulo, mais longe a estrela',
};

export const HUD = {
  mes: 'Mês',
  desvio: (letra: string): string => `Desvio de ${letra}`,
};

const pc = (d: number): string => `${fmt(d, 1)} pc`;
const anosLuz = (d: number): string => `${fmt(d * PARSEC_ANOS_LUZ, 1)} anos-luz`;
const dProxima = distanciaPorParalaxe(ESTRELAS.proxima.paralaxe);
/** Distância em que a moeda de 1 real ocupa o mesmo ângulo que a paralaxe de Proxima. */
const moedaKm = MOEDA_MM / 1e6 / (ESTRELAS.proxima.paralaxe / SEGUNDOS_POR_RADIANO);

export const intro: CardDef = {
  eyebrow: 'Fase 2 · Paralaxe',
  ilus: 'paralaxe',
  titulo: 'As estrelas próximas pulam',
  corpo:
    '<p>Estique o braço, levante um dedo e olhe com um olho de cada vez: o dedo parece pular contra o fundo. Quando quem olha muda de lugar, o que está perto parece se deslocar.</p>' +
    '<p>A Terra muda de lugar ao longo do ano. Por isso as estrelas mais próximas fazem um pulinho no céu. <b>Quanto menor o pulo, mais longe a estrela.</b></p>' +
    '<p>Passe os meses e veja três estrelas pelo telescópio. Qual está mais perto?</p>',
  avancado:
    '<p>A paralaxe p é metade do pulo total, em segundos de arco. A distância em parsecs é o inverso dela:</p>' +
    M.bloco(M.v('d') + M.o('[pc]') + M.o('=') + M.fr(M.n(1), M.v('p') + M.o('[″]'))) +
    '<p>Um parsec é a distância em que a paralaxe vale 1″: 206 265 vezes a distância Terra–Sol, ou 3,26 anos-luz.</p>',
  dica: 'Use a barra dos meses ou o botão Passar o ano',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 2 · Paralaxe',
  ilus: 'paralaxe',
  titulo: 'O pulo mede a distância',
  corpo:
    `<p>A estrela C, a que mais pula, é <b>Proxima Centauri</b>, a estrela mais perto do Sol: ${anosLuz(dProxima)}. A estrela A é <b>Sirius</b> e a B, que quase não se mexe, é <b>Vega</b>.</p>` +
    `<p>Mesmo a mais próxima pula menos de um segundo de arco: é o tamanho de uma moeda vista a uns ${fmt(moedaKm, 0)} km. Por isso só telescópios conseguem medir.</p>` +
    '<p>Para estrelas muito mais longe, o pulo fica pequeno demais. Lá vamos precisar de outras réguas.</p>',
  avancado:
    '<table><thead><tr><th>Estrela</th><th>p</th><th>d</th></tr></thead><tbody>' +
    `<tr><td>C · Proxima Centauri</td><td>${fmt(ESTRELAS.proxima.paralaxe, 3)}″</td><td>${pc(dProxima)}</td></tr>` +
    `<tr><td>A · Sirius</td><td>${fmt(1 / ESTRELAS.sirius.distPc, 3)}″</td><td>${pc(ESTRELAS.sirius.distPc)}</td></tr>` +
    `<tr><td>B · Vega</td><td>${fmt(1 / ESTRELAS.vega.distPc, 3)}″</td><td>${pc(ESTRELAS.vega.distPc)}</td></tr>` +
    '</tbody></table>' +
    '<p>O satélite Gaia, da Agência Espacial Europeia, mediu a paralaxe de mais de um bilhão de estrelas.</p>',
};

export const DESAFIO = {
  titulo: 'A distância de Proxima',
  texto: `Proxima Centauri tem paralaxe de ${fmt(ESTRELAS.proxima.paralaxe, 3)}″. A que distância ela está, em parsecs?`,
  formula: M.bloco(M.v('d') + M.o('=') + M.fr(M.n(1), M.v('p'))),
  unidade: 'pc',
  resposta: dProxima,
  tolerancia: 0.03,
  msgAcerto: `Isso! ${pc(dProxima)}, ou ${anosLuz(dProxima)}.`,
};
