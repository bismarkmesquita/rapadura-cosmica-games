/**
 * Textos da fase 3 (ampliação e razão focal). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { aumento, aumentoMaximoUtil, razaoFocal } from '@shared/physics/telescopio';

export const NOME_FASE = 'Observatório · Ampliação';

/** Distâncias focais das oculares da caixa, em mm. */
export const OCULARES = [40, 25, 10, 6, 4, 2];

/** Saturno: diâmetro dos anéis no céu, em segundos de arco (perto da oposição). */
export const ANEIS_SEG = 42;

export const MISSOES = {
  pequeno: porDispositivo(
    'Arraste a ocular de 25 mm até o telescópio e veja Saturno',
    'Toque na ocular de 25 mm para pôr no telescópio e ver Saturno',
  ),
  aneis: 'Ache uma ocular que mostre os anéis nítidos',
  limite: 'Passe do limite: use a ocular de 2 mm',
};

export const ROTULOS = {
  caixa: 'Caixa de oculares',
  mm: (f: number): string => `${fmt(f, 0)} mm`,
  vezes: (a: number): string => `${fmt(a, 0)}×`,
  focalizador: 'focalizador',
  semOcular: 'Ponha uma ocular',
  ocular: 'Vista na ocular',
  foraDeEscala: 'Desenho 10 vezes maior que na ocular, igual para todas',
  arraste: porDispositivo('arraste ou clique', 'toque numa ocular'),
};

export const AVISOS = {
  pequeno: 'Com 40×, Saturno é só um grãozinho: dá para ver que não é redondo',
  aneis: 'Isso! Os anéis aparecem separados do planeta',
  limite: 'Grande, mas escuro e borrado: passou do aumento útil',
  semAneis: 'Ainda pequeno demais para separar os anéis',
  borrado: 'Passou do limite: a imagem borra',
};

export const HUD = {
  ocular: 'Ocular',
  aumento: 'Aumento',
  razao: 'Razão focal',
  pupila: 'Pupila de saída',
  maximo: 'Aumento útil máximo',
};

const F = 1000;
const D = 200;

export const intro: CardDef = {
  eyebrow: 'Observatório · Ampliação',
  ilus: 'aumentos',
  titulo: 'Quem amplia é a ocular',
  corpo:
    '<p>O aumento depende de duas peças: a distância focal do telescópio dividida pela da ocular. <b>Ocular de número menor, mais aumento.</b></p>' +
    '<p>Mas aumentar demais espalha a mesma luz por uma imagem maior, que fica escura e borrada. Cada telescópio tem um aumento útil máximo.</p>' +
    '<p>Troque as oculares e encontre a melhor vista dos anéis de Saturno.</p>',
  avancado:
    M.bloco(
      M.v('A') +
        M.o('=') +
        M.fr(M.ind(M.v('F'), M.t('obj')), M.ind(M.v('f'), M.t('oc'))) +
        M.esp() +
        M.v('N') +
        M.o('=') +
        M.fr(M.v('F'), M.v('D')),
    ) +
    `<p>No telescópio de ${D} mm e ${fmt(F, 0)} mm de distância focal (f/${fmt(razaoFocal(F, D), 0)}), a ocular de 25 mm dá ${fmt(aumento(F, 25), 0)}× e a de 10 mm, ${fmt(aumento(F, 10), 0)}×. O aumento útil máximo é de uns 2 × a abertura em mm: ${fmt(aumentoMaximoUtil(D), 0)}×.</p>`,
  dica: porDispositivo('Arraste uma ocular até o focalizador', 'Toque numa ocular para pôr no telescópio'),
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Observatório · Ampliação',
  ilus: 'aumentos',
  titulo: 'Mais aumento nem sempre é melhor',
  corpo:
    '<p>Com pouco aumento, Saturno é um grãozinho. Com aumento demais, a imagem fica grande, mas escura e borrada: a luz que o telescópio junta não dá para tanto.</p>' +
    '<p>A <b>razão focal</b> diz se o telescópio é "rápido" (número pequeno, como f/5: campo largo e imagem clara) ou "lento" (número grande, como f/10: campo estreito e mais aumento com a mesma ocular).</p>',
  avancado: `<p>Pupila de saída = D ÷ A. Abaixo de uns 0,5 mm (aqui, acima de ${fmt(aumentoMaximoUtil(D), 0)}×), a imagem escurece e borra.</p>`,
};

export const DESAFIO = {
  titulo: 'O aumento de um telescópio lento',
  texto: 'Um Schmidt-Cassegrain tem distância focal de 2 000 mm. Qual é o aumento com a ocular de 25 mm?',
  formula: M.bloco(M.v('A') + M.o('=') + M.fr(M.ind(M.v('F'), M.t('obj')), M.ind(M.v('f'), M.t('oc')))),
  unidade: 'vezes',
  resposta: aumento(2000, 25),
  tolerancia: 0.5,
  msgAcerto: 'Isso! 80×: o dobro do newtoniano f/5 com a mesma ocular.',
};
