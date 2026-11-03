/**
 * Textos da fase 4 (magnitude aparente). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { FORMULAS } from './formulas';
import { fmt } from '@shared/math/format';
import { ESTRELAS, LIMITE_OLHO_NU_MAG, LUA, SOL, VENUS_MAG } from '@shared/physics/constantes';
import { razaoDeBrilho } from '@shared/physics/distancias';

export const NOME_FASE = 'Fase 4 · Magnitude aparente';

/** Astros que o aluno põe na régua: cada um tem um lugar marcado na magnitude dele. */
export const ASTROS = [
  { id: 'venus', nome: 'Vênus', mag: VENUS_MAG },
  { id: 'sirius', nome: 'Sirius', mag: ESTRELAS.sirius.mag },
  { id: 'vega', nome: 'Vega', mag: ESTRELAS.vega.mag },
  { id: 'polaris', nome: 'Polaris', mag: ESTRELAS.polaris.mag },
  { id: 'alcor', nome: 'Alcor', mag: ESTRELAS.alcor.mag },
  { id: 'limite', nome: 'a mais fraca a olho nu', mag: LIMITE_OLHO_NU_MAG },
];

export const MISSOES = {
  regua: 'Arraste cada astro para o lugar dele na régua',
  pergunta: 'Responda: qual brilha mais?',
};

export const ROTULOS = {
  regua: 'magnitude aparente',
  maisBrilhante: '◀ mais brilhante',
  maisFraca: 'mais fraca ▶',
  ceu: 'O céu desta noite',
};

export const AVISOS = {
  errado: 'Esse lugar é de outro astro. Mais brilho fica mais à esquerda',
  certo: 'Isso!',
  regua: 'Régua completa: número menor, astro mais brilhante',
};

export const HUD = {
  colocados: 'Na régua',
  de: (n: number, total: number): string => `${n} de ${total}`,
  vezes: (nome: string): string => `${nome} × a mais fraca`,
};

export const PERGUNTA = {
  titulo: 'Qual brilha mais?',
  texto: 'Uma estrela de magnitude 1 ou uma de magnitude 3?',
  opcoes: [
    { texto: 'A de magnitude 1', certa: true, resposta: '' },
    {
      texto: 'A de magnitude 3',
      certa: false,
      resposta: 'Ao contrário: na escala de Hiparco, número maior quer dizer mais fraca.',
    },
  ],
};

const vezesSirius = razaoDeBrilho(ESTRELAS.sirius.mag, LIMITE_OLHO_NU_MAG);

export const intro: CardDef = {
  eyebrow: 'Fase 4 · Hiparco · século II a.C.',
  ilus: 'reguaMagnitudes',
  titulo: 'Número maior, estrela mais fraca',
  corpo:
    '<p>Há mais de 2 mil anos, o grego <b>Hiparco</b> separou as estrelas em seis grupos: as mais brilhantes eram de primeira grandeza, e as mais fracas que ele via, de sexta.</p>' +
    '<p>A escala ficou ao contrário do que esperamos: <b>número maior quer dizer mais fraca</b>. Hoje ela também tem números negativos, para os astros muito brilhantes.</p>' +
    '<p>Arraste cada astro do céu para o lugar dele na régua.</p>',
  avancado:
    '<p>A magnitude aparente é a régua do <b>fluxo</b>: 5 magnitudes valem um fator 100.</p>' +
    FORMULAS.pogson +
    '<p>Ou, ao contrário, a razão dos fluxos a partir das magnitudes:</p>' +
    FORMULAS.razaoFluxos +
    '<p>Cada magnitude vale 100^(1/5) ≈ 2,512 vezes no fluxo.</p>',
  dica: 'Repare no tamanho e no brilho de cada um',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Régua 4 · Magnitude aparente',
  ilus: 'reguaMagnitudes',
  titulo: 'Uma régua para o brilho',
  corpo:
    `<p>Na mesma régua cabem o Sol (${fmt(SOL.magAparente, 1)}), a Lua cheia (${fmt(LUA.magCheia, 1)}) e estrelas que só os telescópios veem, de magnitude 20 ou mais.</p>` +
    '<p>Mas a magnitude aparente mede só o brilho visto daqui. Uma estrela pode parecer brilhante por ser muito potente ou só por estar perto. A próxima régua separa as duas coisas.</p>',
  avancado: `<p>Sirius (${fmt(ESTRELAS.sirius.mag, 2)}) brilha cerca de ${fmt(vezesSirius, 0)} vezes mais que uma estrela de magnitude ${LIMITE_OLHO_NU_MAG}.</p>`,
};

export const DESAFIO = {
  titulo: 'Sirius × a mais fraca',
  texto: `Sirius tem magnitude ${fmt(ESTRELAS.sirius.mag, 2)}. Quantas vezes ela brilha mais que uma estrela de magnitude ${LIMITE_OLHO_NU_MAG}?`,
  formula: M.bloco(
    M.fr(M.ind(M.v('F'), M.n(1)), M.ind(M.v('F'), M.n(2))) +
      M.o('=') +
      M.pot(
        M.n(10),
        M.n('0,4') + M.o('(') + M.ind(M.v('m'), M.n(2)) + M.o('−') + M.ind(M.v('m'), M.n(1)) + M.o(')'),
      ),
  ),
  unidade: 'vezes',
  resposta: vezesSirius,
  tolerancia: 40,
  msgAcerto: `Isso! Cerca de ${fmt(vezesSirius, 0)} vezes.`,
};
