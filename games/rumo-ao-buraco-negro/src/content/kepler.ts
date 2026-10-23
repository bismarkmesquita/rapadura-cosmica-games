/**
 * Textos da fase 1 (Kepler). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';

export const NOME_FASE = 'Fase 1 · Kepler';

export const MISSOES = {
  marte: 'Voe até Marte',
  mercurio: 'Voe até Mercúrio, o mais perto do Sol',
  jupiter: 'Voe até Júpiter, lá longe',
  terra: 'Volte para a Terra',
};

export const TECLAS: [string, string][] = [
  ['Mouse', 'vira'],
  ['W', 'acelera'],
  ['S', 'freia'],
  ['Shift', 'turbo'],
  ['V', '1ª/3ª pessoa'],
  ['M', 'mapa'],
  ['E', 'exagera as elipses'],
  ['[ ]', 'tempo'],
  ['C', 'rever card'],
];

export const intro: CardDef = {
  eyebrow: 'Fase 1 · Século XVII',
  ilus: 'sistema',
  titulo: 'O relógio do céu',
  corpo:
    '<p>Os planetas giram em volta do Sol sem parar. Mas por que eles se movem exatamente desse jeito?</p>' +
    '<p>No começo dos anos 1600, o astrônomo alemão <b>Johannes Kepler</b> passou anos estudando as medidas de Tycho Brahe sobre a posição de Marte e descobriu regras muito precisas para esse movimento.</p>' +
    '<p>Sua missão é visitar os planetas e descobrir essas regras com Kepler. Nesta fase, os motores da nave são tão fortes que a gravidade do Sol nem é sentida.</p>',
  dica: porDispositivo(
    'Mova o mouse para os lados para virar e acelere com W',
    'Use ◀ ▶ para virar e segure Acelerar',
  ),
};

export const lei1: CardDef = {
  eyebrow: 'Kepler · 1609 · 1ª lei',
  ilus: 'elipse',
  titulo: 'As órbitas são elipses',
  corpo:
    '<p>Durante séculos, as pessoas acharam que os planetas andavam em círculos perfeitos. Kepler mostrou que as órbitas são <b>elipses</b>, uma espécie de círculo achatado.</p>' +
    '<p>O Sol não fica no centro: ele fica num ponto especial chamado <b>foco</b>. Toda elipse tem dois focos, e o outro fica vazio. Agora o foco vazio da órbita de Marte aparece marcado no espaço.</p>' +
    `<p>As órbitas reais são quase redondas.${porDispositivo(' Aperte <kbd>E</kbd> para exagerar o achatamento e enxergar melhor.', '')}</p>`,
  ef2:
    '<p>Em qualquer ponto da elipse, a soma das distâncias aos dois focos é igual ao eixo maior:</p>' +
    M.bloco(M.ind(M.v('d'), M.n(1)) + M.o('+') + M.ind(M.v('d'), M.n(2)) + M.o('=') + M.n(2) + M.v('a')) +
    `<p>A excentricidade ${M.linha(M.v('e'))} mede o achatamento (0 é um círculo). Marte tem e ≈ 0,09; Mercúrio, e ≈ 0,21. As distâncias mínima e máxima ao Sol são:</p>` +
    M.bloco(
      M.ind(M.v('r'), M.t('mín')) +
        M.o('=') +
        M.v('a') +
        M.o('(') +
        M.n(1) +
        M.o('−') +
        M.v('e') +
        M.o(')') +
        M.esp() +
        M.ind(M.v('r'), M.t('máx')) +
        M.o('=') +
        M.v('a') +
        M.o('(') +
        M.n(1) +
        M.o('+') +
        M.v('e') +
        M.o(')'),
    ),
  dica: porDispositivo('Aperte M para ver a órbita de cima', 'Toque em Mapa para ver a órbita de cima'),
};

export const lei2: CardDef = {
  eyebrow: 'Kepler · 1609 · 2ª lei',
  ilus: 'areas',
  titulo: 'Mais perto do Sol, mais rápido',
  corpo:
    '<p>Repare em Mercúrio: quando passa perto do Sol, ele acelera; quando se afasta, fica mais lento.</p>' +
    '<p>Kepler descobriu a regra exata: a linha que liga o planeta ao Sol <b>varre áreas iguais em tempos iguais</b>. Agora as fatias coloridas na órbita de Mercúrio mostram isso: cada uma é percorrida no mesmo tempo e todas têm a mesma área.</p>' +
    '<p>Fatias curtinhas e largas perto do Sol, compridas e finas longe dele.</p>',
  ef2:
    '<p>A velocidade orbital muda ao longo da elipse, segundo a equação vis-viva:</p>' +
    M.bloco(
      M.v('v') +
        M.o('=') +
        M.raiz(
          M.v('G') +
            M.v('M') +
            M.o('(') +
            M.fr(M.n(2), M.v('r')) +
            M.o('−') +
            M.fr(M.n(1), M.v('a')) +
            M.o(')'),
        ),
    ) +
    '<p>Mercúrio vai de cerca de 39 km/s, no ponto mais distante, a 59 km/s, no mais próximo. Olhe o painel quando estiver perto dele.</p>',
  dica: porDispositivo('Aperte M para ver as fatias de cima', 'Toque em Mapa para ver as fatias de cima'),
};

export function lei3(planetas: { n: string; a: number; T: number }[]): CardDef {
  const linhas = planetas
    .map(
      (p) =>
        `<tr><td>${p.n}</td><td>${fmt(p.a, 2)}</td><td>${fmt(p.T, 2)}</td><td>${fmt(p.a ** 3, 2)}</td><td>${fmt(p.T ** 2, 2)}</td></tr>`,
    )
    .join('');
  return {
    eyebrow: 'Kepler · 1619 · 3ª lei',
    ilus: 'periodos',
    titulo: 'Quanto mais longe, mais demora',
    corpo:
      '<p>Júpiter leva quase 12 anos para dar uma volta no Sol. A Terra leva 1 ano, e Mercúrio, só 88 dias.</p>' +
      '<p>Kepler encontrou uma conta que liga a distância ao tempo de uma volta: <b>o cubo da distância é igual ao quadrado do período</b>, usando anos e a distância Terra–Sol como unidades.</p>' +
      `<div class="tabela"><table><thead><tr><th>Planeta</th><th>a (UA)</th><th>T (anos)</th><th>a³</th><th>T²</th></tr></thead><tbody>${linhas}</tbody></table></div>`,
    ef2:
      M.bloco(M.pot(M.v('T'), M.n(2)) + M.o('=') + M.pot(M.v('a'), M.n(3))) +
      '<p>Vale para todos os planetas em torno do Sol, com T em anos e a em UA. Newton depois mostrou a forma geral:</p>' +
      M.bloco(
        M.pot(M.v('T'), M.n(2)) +
          M.o('=') +
          M.fr(M.n(4) + M.pot(M.v('π'), M.n(2)), M.v('G') + M.v('M')) +
          M.pot(M.v('a'), M.n(3)),
      ) +
      '<p>Com ela dá para "pesar" o Sol, ou qualquer estrela, observando quem gira em volta dele.</p>',
  };
}

export const porque: CardDef = {
  eyebrow: 'A grande pergunta',
  ilus: 'porque',
  titulo: 'Mas por quê?',
  corpo:
    '<p>Kepler descobriu <b>como</b> os planetas se movem, com regras muito precisas. Mas não sabia <b>por que</b> eles se movem assim. Ele imaginava que o Sol tinha alguma força que empurrava os planetas, parecida com o magnetismo, mas não conseguiu explicar.</p>' +
    '<p>A resposta veio em 1687, com o inglês <b>Isaac Newton</b>. Vamos descer até a Terra para descobrir.</p>',
  botao: 'Ir para a fase 2',
};

export const AVISOS = {
  sol: 'Quente demais! A superfície do Sol passa de 5.000 °C',
  exagerado: 'Elipses exageradas (fora de escala)',
  real: 'Elipses com a forma real',
};
