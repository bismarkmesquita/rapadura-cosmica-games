/** Textos da fase 2 (Newton). */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';

export const NOME_FASE = 'Fase 2 · Newton';

export const MISSOES = {
  cair: 'Solte o acelerador e deixe a Terra puxar você',
  doisR: 'Desça até o anel de 2 raios terrestres',
  canhao: 'Vá até o canhão no alto da montanha',
  orbitaBala: 'Ajuste o canhão até a bala entrar em órbita',
  orbitaNave: 'Decole e dê uma volta completa na Terra sem cair',
};

export const TECLAS: [string, string][] = [
  ['Mouse', 'aponta'],
  ['W', 'acelera'],
  ['S', 'freia'],
  ['Shift', 'turbo'],
  ['Roda', 'zoom'],
  ['C', 'rever card'],
  ['H', 'esconde painel'],
];

const vOrbita = M.ind(M.v('v'), M.t('órbita')) + M.o('=') + M.raiz(M.fr(M.v('G') + M.v('M'), M.v('R')));
const vEscape =
  M.ind(M.v('v'), M.t('escape')) + M.o('=') + M.raiz(M.fr(M.n(2) + M.v('G') + M.v('M'), M.v('R')));

export const intro: CardDef = {
  eyebrow: 'Newton · 1687 · Principia',
  ilus: 'atracao',
  titulo: 'Uma força que puxa tudo',
  corpo:
    '<p>Newton percebeu que a força que faz uma maçã cair é a mesma que segura a Lua em volta da Terra e os planetas em volta do Sol. Ele chamou isso de <b>gravitação universal</b>.</p>' +
    '<p>Toda massa atrai toda massa. Quanto mais massa, mais forte o puxão; quanto mais longe, mais fraco.</p>' +
    '<p>Agora a sua nave sente a gravidade da Terra. A seta azul mostra para onde ela puxa você e o painel mostra a força.</p>',
  ef2:
    M.bloco(
      M.v('F') +
        M.o('=') +
        M.fr(M.v('G') + M.o('·') + M.v('M') + M.o('·') + M.v('m'), M.pot(M.v('d'), M.n(2))),
    ) +
    '<p>G é a constante gravitacional (6,67 × 10⁻¹¹ N·m²/kg²), M e m são as massas e d é a distância entre os centros. O "d²" quer dizer que, dobrando a distância, a força cai para 1/4.</p>',
  dica: 'Comece sem acelerar',
};

export const distancia: CardDef = {
  eyebrow: 'Gravidade e distância',
  ilus: 'distancia',
  titulo: 'Duas vezes mais longe, quatro vezes mais fraca',
  corpo:
    '<p>Você está a dois raios terrestres do centro da Terra, uns 12.700 km. Aqui a gravidade é só <b>1/4</b> da que sentimos no chão.</p>' +
    '<p>Quando você começou, a uns 4,5 raios, ela era quase 20 vezes mais fraca que na superfície. Olhe o medidor no painel enquanto desce.</p>' +
    '<p>A gravidade nunca some de vez. Ela só vai ficando mais fraca com a distância.</p>',
  ef2:
    '<p>Na superfície, g ≈ 9,8 m/s². A uma distância d do centro:</p>' +
    M.bloco(
      M.v('g') +
        M.o('=') +
        M.n('9,8') +
        M.o('×') +
        M.pot(M.o('(') + M.fr(M.v('R'), M.v('d')) + M.o(')'), M.n(2)),
    ) +
    '<p>Para d = 2R, g ≈ 2,45 m/s². É por isso que a Lua, a 60 raios terrestres, sente uma gravidade da Terra 3.600 vezes menor.</p>',
};

export const canhao: CardDef = {
  eyebrow: 'Experimento mental de Newton',
  ilus: 'canhaoNewton',
  titulo: 'O canhão no alto da montanha',
  corpo:
    '<p>Newton imaginou um canhão no topo de uma montanha altíssima. Uma bala lenta cai perto. Uma bala mais rápida cai mais longe.</p>' +
    '<p>E se a bala fosse tão rápida que, enquanto cai, a Terra "se curvasse" embaixo dela? Ela cairia para sempre, dando voltas. Isso é uma <b>órbita</b>.</p>' +
    '<p>Use o painel do canhão: escolha a velocidade e dispare. Tente achar a velocidade que coloca a bala em órbita. A montanha e o canhão estão fora de escala.</p>',
  ef2:
    '<p>Sem ar, a velocidade para uma órbita rasante e a velocidade de escape são:</p>' +
    M.bloco(vOrbita + M.o('≈') + M.n('7,9') + M.t(' km/s')) +
    M.bloco(vEscape + M.o('≈') + M.n('11,2') + M.t(' km/s')) +
    '<p>Acima da velocidade de escape, a bala sai da Terra para sempre. Abra o desafio no painel do canhão e calcule você mesmo.</p>',
  dica: porDispositivo('Aperte F para disparar', 'Toque em Disparar'),
};

export const orbitaBala: CardDef = {
  eyebrow: 'Você descobriu a órbita',
  ilus: 'queda',
  titulo: 'A bala está caindo, mas nunca chega ao chão',
  corpo:
    '<p>A bala continua sendo puxada pela Terra o tempo todo. Ela está caindo! Mas anda tão rápido de lado que o chão sempre "foge" de baixo dela.</p>' +
    '<p>É exatamente assim que a Lua gira em volta da Terra, e a Terra em volta do Sol. As regras de Kepler saem todas dessa ideia.</p>' +
    `<p>Agora é a sua vez: ${porDispositivo('clique', 'toque')} em <b>Decolar com a nave</b> e tente dar uma volta completa na Terra.</p>`,
  ef2:
    '<p>Numa órbita circular, a gravidade faz o papel de força centrípeta:</p>' +
    M.bloco(
      M.fr(M.v('G') + M.v('M') + M.v('m'), M.pot(M.v('r'), M.n(2))) +
        M.o('=') +
        M.fr(M.v('m') + M.pot(M.v('v'), M.n(2)), M.v('r')) +
        M.esp() +
        M.o('⇒') +
        M.esp() +
        M.v('v') +
        M.o('=') +
        M.raiz(M.fr(M.v('G') + M.v('M'), M.v('r'))),
    ) +
    '<p>Com essa mesma igualdade, Newton deduziu a 3ª lei de Kepler.</p>',
  dica: 'Acelere de lado, não para cima',
};

export const orbitaNave: CardDef = {
  eyebrow: 'Missão cumprida',
  ilus: 'estacao',
  titulo: 'Você está em órbita!',
  corpo:
    '<p>Você deu uma volta inteira na Terra caindo o tempo todo, sem nunca tocar o chão. Os astronautas da Estação Espacial flutuam pelo mesmo motivo: eles e a estação estão caindo juntos.</p>' +
    '<p>Newton explicou <b>como</b> a gravidade age, com uma conta que funciona muito bem. Mas ele mesmo achava estranho uma força agir à distância, sem nada no meio. Em 1915, Albert Einstein propôs outra resposta: a massa <b>curva o espaço e o tempo</b>.</p>' +
    '<p>Vamos ver como é o mundo pelos olhos de Einstein.</p>',
  botao: 'Ir para a fase 3',
};

export const lua: CardDef = {
  eyebrow: 'Visita à Lua',
  ilus: 'lua',
  titulo: 'Por que a Lua não cai na Terra?',
  corpo:
    '<p>Ela cai! A Lua está sempre sendo puxada pela Terra, mas se move de lado a cerca de 1 km/s. Assim, ela cai em volta da Terra, sem nunca acertá-la.</p>' +
    '<p>Neste jogo, a Lua está bem mais perto do que na realidade. A distância real é de uns 384 mil km, cerca de 60 raios terrestres.</p>',
};

export const escape: CardDef = {
  eyebrow: 'Velocidade de escape',
  ilus: 'escape',
  titulo: 'Você escapou da Terra!',
  corpo:
    '<p>Sua nave ficou rápida o bastante para nunca mais voltar, mesmo sem acelerar. Na superfície da Terra, isso exige cerca de <b>11,2 km/s</b>, uns 40 mil km/h.</p>' +
    '<p>Guarde essa ideia: num buraco negro, a velocidade de escape é maior que a da luz. Por isso nada sai de lá.</p>' +
    '<p>Siga a seta para voltar à Terra e continuar as missões.</p>',
};

/** Desafio do painel do canhão. */
export const DESAFIO = {
  dados: 'Use G = 6,67 × 10⁻¹¹, M = 5,97 × 10²⁴ kg e R = 6,37 × 10⁶ m.',
  formulaOrbita: M.linha(vOrbita),
  formulaEscape: M.linha(vEscape),
  acertoOrbita: 'Órbita: correto, ≈ 7,9 km/s.',
  erroOrbita: 'Órbita: confira as potências de 10 e lembre de converter m/s em km/s.',
  acertoEscape: 'Escape: correto, ≈ 11,2 km/s.',
  erroEscape: 'Escape: é √2 vezes a velocidade de órbita.',
};

export const AVISOS = {
  caindo: 'Você está caindo em direção à Terra!',
  caiu: 'Você caiu na Terra! Para não cair, é preciso andar muito rápido de lado.',
  bateuLua: 'Você bateu na Lua!',
  balaPrimeiro: 'Primeiro coloque uma bala em órbita com o canhão',
  decolar: 'Suba um pouco e depois acelere de lado, para a direita ou para a esquerda',
  camFixa: 'Nesta fase a câmera fica vista de cima',
};
