/**
 * Textos da fase 6 (atmosfera e seeing). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { aberturaOndeSeeingManda } from '@shared/physics/telescopio';

export const NOME_FASE = 'Observatório · Atmosfera';

/** Separação da dupla bem fechada, em segundos de arco. */
export const SEPARACAO = 0.4;

/** Onde instalar o telescópio, com o seeing típico (″). */
export const LOCAIS = [
  { id: 'cidade', nome: 'Cidade', seeing: 3 },
  { id: 'montanha', nome: 'Montanha alta e seca', seeing: 0.6 },
  { id: 'espaco', nome: 'Espaço', seeing: 0 },
];

/** Telescópios para escolher: abertura em mm. */
export const TELESCOPIOS = [
  { mm: 200, nome: '200 mm' },
  { mm: 1000, nome: '1 m' },
  { mm: 2400, nome: '2,4 m (como o Hubble)' },
];

export const MISSOES = {
  separar: 'Separe a dupla bem fechada: escolha o lugar e o telescópio',
  pergunta: 'Responda: por que levar telescópios para montanhas e para o espaço?',
};

export const ROTULOS = {
  vista: 'A dupla bem fechada',
  separada: 'Separadas!',
  junta: 'Uma mancha só',
  ar: 'ar tremendo',
};

export const AVISOS = {
  separar: 'Isso! Sem o ar no caminho, quem manda é o tamanho do telescópio',
  cidade: 'Na cidade, o ar borra tudo: nem um telescópio enorme separa',
  pequeno: 'O ar já não atrapalha, mas este telescópio é pequeno demais',
};

export const PERGUNTA = {
  titulo: 'Por que levar telescópios para montanhas e para o espaço?',
  texto: '',
  opcoes: [
    {
      texto: 'Para ficar mais perto das estrelas',
      certa: false,
      resposta: 'Uns quilômetros não são nada perto da distância das estrelas. O motivo é o ar.',
    },
    { texto: 'Para fugir do ar que treme', certa: true, resposta: '' },
    {
      texto: 'Porque lá é mais frio',
      certa: false,
      resposta: 'O frio até ajuda as câmeras, mas o principal é ficar acima do ar turbulento.',
    },
  ],
};

export const HUD = {
  local: 'Lugar',
  telescopio: 'Telescópio',
  difracao: 'Difração',
  seeing: 'Seeing',
  imagem: 'Tamanho da imagem',
  seg: (s: number): string => `${fmt(s, 2)}″`,
};

const SEEING_DESAFIO = 2;

export const intro: CardDef = {
  eyebrow: 'Observatório · Atmosfera',
  ilus: 'ar',
  titulo: 'O ar treme',
  corpo:
    '<p>O ar em movimento funciona como uma lente que treme e faz a imagem dançar: é por isso que as estrelas <b>cintilam</b>. Esse borrão se chama <b>seeing</b>.</p>' +
    '<p>Numa noite comum, ele fica entre 1″ e 3″ e limita os detalhes mais do que o tamanho do telescópio. A solução é ir para montanhas altas e secas ou para o espaço.</p>' +
    '<p>Tente separar uma dupla bem fechada em cada lugar.</p>',
  avancado:
    '<p>O tamanho da imagem de uma estrela junta a difração e o seeing (somados em quadratura):</p>' +
    M.bloco(
      M.v('θ') +
        M.o('≈') +
        M.raiz(
          M.pot(M.ind(M.v('θ'), M.t('dif')), M.n(2)) +
            M.o('+') +
            M.pot(M.ind(M.v('θ'), M.t('seeing')), M.n(2)),
        ),
    ) +
    '<p>Os grandes observatórios usam <b>óptica adaptativa</b>: um espelho que se deforma centenas de vezes por segundo para desfazer o tremor do ar.</p>',
  dica: 'Os botões ficam embaixo',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Observatório · Atmosfera',
  ilus: 'ar',
  titulo: 'Acima do ar',
  corpo:
    '<p>Na cidade, o ar borra tudo e nenhum telescópio separa a dupla. Na montanha alta e seca o ar é mais calmo, e no espaço não há ar nenhum: aí quem manda é o tamanho do espelho.</p>' +
    '<p>Por isso o Hubble e o James Webb estão no espaço, e os maiores telescópios da Terra ficam em montanhas como as do deserto do Atacama, no Chile.</p>',
  avancado: `<p>Com seeing de 1″, acima de uns ${fmt(aberturaOndeSeeingManda(1), 0)} mm de abertura quem limita os detalhes é o ar, não o telescópio.</p>`,
};

export const DESAFIO = {
  titulo: 'Quando o ar passa a mandar',
  texto: `Com seeing de ${SEEING_DESAFIO}″, a partir de que abertura (em mm) a difração fica menor que o borrão do ar? Use λ = 550 nm.`,
  formula: M.bloco(
    M.v('D') +
      M.o('=') +
      M.fr(M.n('1,22') + M.v('λ') + M.o('·') + M.n('206 265'), M.ind(M.v('θ'), M.t('seeing'))),
  ),
  unidade: 'mm',
  resposta: aberturaOndeSeeingManda(SEEING_DESAFIO),
  tolerancia: 3,
  msgAcerto: `Isso! Uns ${fmt(aberturaOndeSeeingManda(SEEING_DESAFIO), 0)} mm: acima disso, um telescópio maior não mostra mais detalhes nessa noite.`,
};
