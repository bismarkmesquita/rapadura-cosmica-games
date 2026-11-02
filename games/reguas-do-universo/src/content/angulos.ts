/**
 * Textos da fase 1 (diâmetro angular). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { LUA, SOL, UA_KM } from '@shared/physics/constantes';
import {
  diametroAngular,
  diametroPorAngulo,
  radianosParaGraus,
  radianosParaSegundos,
} from '@shared/physics/distancias';

export const NOME_FASE = 'Fase 1 · Ângulos';

/** Moeda de 1 real: 27 mm de diâmetro. */
export const MOEDA_MM = 27;

const grausLua = (dKm: number): number => radianosParaGraus(diametroAngular(LUA.diametroKm, dKm));
const thetaLuaSeg = Math.round(radianosParaSegundos(diametroAngular(LUA.diametroKm, LUA.distanciaKm)));
const moedaCobreSolM = MOEDA_MM / 1000 / Math.tan(diametroAngular(SOL.diametroKm, UA_KM));

export const MISSOES = {
  total: 'Faça um eclipse total: a Lua cobre o Sol bem justinho',
  anular: 'Afaste a Lua um pouco: eclipse anular',
  moeda: 'Bônus: cubra o Sol com uma moeda',
};

export const OBJETOS = {
  lua: { nome: 'Lua', angulo: 'Ângulo da Lua', distancia: 'Distância da Lua' },
  moeda: { nome: 'Moeda de 1 real', angulo: 'Ângulo da moeda', distancia: 'Distância da moeda' },
};

export const ROTULOS = {
  olho: 'Olho',
  sol: 'Sol',
  ceu: 'Céu visto pelo olho',
  foraDeEscala: 'Fora de escala: o Sol de verdade está muito mais longe',
  arraste: 'arraste',
};

/** Situação do eclipse, mostrada embaixo da janela do céu. */
export const SITUACAO = {
  grande: 'Cobre o Sol e também a coroa em volta dele',
  total: 'Eclipse total! Aparece a coroa do Sol',
  anular: 'Eclipse anular: sobra um anel de fogo',
  pequena: 'Pequena demais: só uma bolinha na frente do Sol',
};

export const HUD = {
  tamanho: 'Tamanho no céu',
  maior: 'maior que o Sol',
  igual: 'igual ao Sol',
  menor: 'menor que o Sol',
  anguloSol: 'Ângulo do Sol',
};

export const AVISOS = {
  total: 'Eclipse total!',
  anular: 'Anel de fogo!',
  moeda: `Uma moeda a ${fmt(moedaCobreSolM, 1)} m cobre o Sol inteiro!`,
};

export const intro: CardDef = {
  eyebrow: 'Fase 1 · Diâmetro angular',
  ilus: 'angulos',
  titulo: 'O tamanho no céu é um ângulo',
  corpo:
    '<p>O tamanho que vemos no céu não é o tamanho real das coisas: é um <b>ângulo</b>. Ele depende do tamanho do objeto e da distância até ele.</p>' +
    '<p>O Sol é cerca de <b>400 vezes maior</b> que a Lua, mas também está cerca de <b>400 vezes mais longe</b>. Por isso os dois ocupam quase o mesmo ângulo no céu: meio grau.</p>' +
    '<p>Aproxime e afaste a Lua e veja, na janela de cima, o céu visto pelo olho.</p>',
  avancado:
    '<p>Para ângulos pequenos, o ângulo em segundos de arco é:</p>' +
    M.bloco(M.v('θ') + M.o('[″]') + M.o('≈') + M.n('206 265') + M.o('·') + M.fr(M.v('D'), M.v('d'))) +
    '<p>D é o diâmetro e d a distância, na mesma unidade. 206 265 é o número de segundos de arco num radiano.</p>',
  dica: porDispositivo(
    'Arraste a Lua com o mouse ou use a barra embaixo',
    'Arraste a Lua ou use a barra embaixo',
  ),
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 1 · Ângulos',
  ilus: 'angulos',
  titulo: 'Mesmo ângulo, tamanhos diferentes',
  corpo:
    `<p>A Lua cobre o Sol porque os dois ocupam o mesmo ângulo no céu. Uma moeda a uns ${fmt(moedaCobreSolM, 0)} metros também cobre!</p>` +
    '<p>A distância da Lua muda um pouco ao longo do mês. Por isso, às vezes ela cobre o Sol inteiro (eclipse total) e às vezes sobra um anel de fogo (eclipse anular).</p>' +
    '<p>Ângulo, tamanho e distância andam juntos: sabendo dois, dá para descobrir o terceiro. É a primeira régua para medir o Universo.</p>',
  avancado:
    `<p>A Lua ocupa de ${fmt(grausLua(LUA.apogeuKm), 2)}° (mais longe) a ${fmt(grausLua(LUA.perigeuKm), 2)}° (mais perto). ` +
    `O Sol ocupa cerca de ${fmt(radianosParaGraus(diametroAngular(SOL.diametroKm, UA_KM)), 2)}°. ` +
    'Na distância média, a Lua é um pouquinho menor que o Sol no céu: por isso os eclipses anulares são mais comuns que os totais.</p>',
};

export const DESAFIO = {
  titulo: 'O tamanho real da Lua',
  texto: `Do olho, a Lua ocupa ${fmt(thetaLuaSeg, 0)}″ e está a ${fmt(LUA.distanciaKm, 0)} km. Qual é o diâmetro dela?`,
  formula: M.bloco(M.v('D') + M.o('≈') + M.fr(M.v('θ') + M.o('·') + M.v('d'), M.n('206 265'))),
  unidade: 'km',
  resposta: diametroPorAngulo(thetaLuaSeg, LUA.distanciaKm),
  tolerancia: 60,
  msgAcerto: `Isso! A Lua tem cerca de ${fmt(LUA.diametroKm, 0)} km de diâmetro.`,
};
