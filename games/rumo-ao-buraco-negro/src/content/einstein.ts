/** Textos da fase 3 (Einstein). */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo, type BotaoToque } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';

export const NOME_FASE = 'Fase 3 · Einstein';

export const MISSOES = {
  centro: 'Voe até o centro da grade',
  sondas: porDispositivo('Lance 3 sondas com a tecla F', 'Lance 3 sondas com o botão Sonda'),
  eclipse: 'Voe até o observatório do eclipse',
  tempo: 'Fique bem perto do Sol por 8 segundos',
};

export const TECLAS: [string, string][] = [
  ['Mouse', 'vira'],
  ['W', 'acelera'],
  ['S', 'freia'],
  ['F', 'lança sonda'],
  ['V', '1ª/3ª pessoa'],
  ['M', 'mapa'],
  ['C', 'rever card'],
];

/** Botões desta fase nos controles de toque. */
export const TOQUE: BotaoToque[] = [{ tecla: 'f', rotulo: 'Sonda', nome: 'Lançar sonda' }];

export const intro: CardDef = {
  eyebrow: 'Einstein · 1915 · Relatividade geral',
  ilus: 'tecido',
  titulo: 'Espaço e tempo formam um tecido',
  corpo:
    '<p>Newton explicou como a gravidade age, mas não o que ela é. Em 1915, <b>Albert Einstein</b> propôs uma ideia nova: espaço e tempo formam juntos uma espécie de tecido, o <b>espaço-tempo</b>.</p>' +
    '<p>Esta grade é um modelo desse tecido, como o balão esticado no copo. Por enquanto ela está plana, porque não há nenhuma massa por perto.</p>' +
    '<p>Voe até o centro da grade e veja o que acontece.</p>',
  dica: porDispositivo(
    'Aperte M a qualquer momento para ver de cima',
    'Toque em Mapa a qualquer momento para ver de cima',
  ),
};

export const curvatura: CardDef = {
  eyebrow: 'A massa curva o espaço-tempo',
  ilus: 'curvatura',
  titulo: 'O Sol afunda a grade',
  corpo:
    '<p>Quando o Sol aparece, a grade afunda em volta dele. Para Einstein, é isso que a massa faz: ela <b>curva o espaço-tempo</b>.</p>' +
    '<p>Quanto mais massa, mais funda a curva. A Terra também faz uma curvinha, bem menor.</p>' +
    `<p>Agora lance sondas ${porDispositivo('com a tecla <kbd>F</kbd>', 'com o botão <b>Sonda</b>')}, em direções diferentes, e veja que caminho elas fazem.</p>`,
  ef2:
    '<p>As equações de Einstein ligam a curvatura do espaço-tempo, do lado esquerdo, à matéria e à energia, do lado direito:</p>' +
    M.bloco(
      M.ind(M.v('G'), M.v('μν')) +
        M.o('=') +
        M.fr(M.n(8) + M.v('π') + M.v('G'), M.pot(M.v('c'), M.n(4))) +
        M.ind(M.v('T'), M.v('μν')),
    ) +
    '<p>Onde a gravidade é fraca, como no Sistema Solar, elas dão praticamente os mesmos resultados de Newton.</p>',
  dica: porDispositivo('Aperte F para lançar uma sonda', 'Toque em Sonda para lançar uma sonda'),
};

export const sondas: CardDef = {
  eyebrow: 'Ninguém puxa as sondas',
  ilus: 'bolinhas',
  titulo: 'Elas só seguem as curvas',
  corpo:
    '<p>As sondas fazem curvas, e algumas ficam girando em volta do Sol. Na ideia de Einstein, não há uma força invisível puxando: elas seguem o caminho mais "reto" possível num espaço-tempo curvado.</p>' +
    '<p>O físico John Wheeler resumiu assim: a matéria diz ao espaço-tempo como se curvar, e o espaço-tempo diz à matéria como se mover.</p>' +
    '<p>E a luz? Ela também segue as curvas. Voe até o observatório para ver.</p>',
  ef2: '<p>A relatividade geral resolveu um mistério antigo: a órbita de Mercúrio gira lentamente, cerca de 43 segundos de arco por século a mais do que a teoria de Newton previa. A conta de Einstein deu exatamente esse valor.</p>',
};

export const eclipse: CardDef = {
  eyebrow: 'Eclipse de 1919 · Sobral e Príncipe',
  ilus: 'lente',
  titulo: 'A luz das estrelas faz curva',
  corpo:
    '<p>A linha amarela é a luz de uma estrela distante. Ao passar perto do Sol, ela faz uma curva. Quem está no observatório vê a estrela na direção da linha tracejada, fora do lugar de verdade.</p>' +
    '<p>Em 1919, durante um eclipse total do Sol, astrônomos fotografaram estrelas perto do Sol em <b>Sobral, no Ceará</b>, e na ilha de Príncipe, na África. As estrelas apareceram deslocadas, como Einstein tinha previsto, e ele ficou famoso no mundo todo.</p>' +
    '<p>Neste jogo, a curva está muito exagerada.</p>',
  ef2:
    '<p>Para um raio de luz que passa rente ao Sol, Einstein previu um desvio de apenas 1,75 segundo de arco:</p>' +
    M.bloco(M.v('α') + M.o('=') + M.fr(M.n(4) + M.v('G') + M.v('M'), M.pot(M.v('c'), M.n(2)) + M.v('b'))) +
    '<p>em que b é a menor distância entre o raio de luz e o centro do Sol.</p>',
};

export const tempo: CardDef = {
  eyebrow: 'O tempo também curva',
  ilus: 'relogios',
  titulo: 'Perto da massa, o tempo anda mais devagar',
  corpo:
    '<p>Compare os dois relógios no painel. Perto do Sol, o relógio da nave andou mais devagar do que o relógio de quem ficou longe.</p>' +
    '<p>Isso acontece de verdade, mas perto do Sol ou da Terra o efeito é minúsculo; aqui ele está muito exagerado. Mesmo assim, os satélites de GPS precisam corrigir seus relógios todos os dias. Sem isso, o mapa do celular erraria vários quilômetros por dia.</p>',
  ef2:
    '<p>O ritmo do tempo a uma distância r de uma massa M, comparado com o de alguém muito longe, é:</p>' +
    M.bloco(
      M.fr(M.ind(M.v('Δt'), M.t('perto')), M.ind(M.v('Δt'), M.t('longe'))) +
        M.o('=') +
        M.raiz(M.n(1) + M.o('−') + M.fr(M.n(2) + M.v('G') + M.v('M'), M.v('r') + M.pot(M.v('c'), M.n(2)))),
    ) +
    '<p>Somando esse efeito com o da velocidade dos satélites, os relógios do GPS se adiantam cerca de 38 microssegundos por dia.</p>',
};

export const final: CardDef = {
  eyebrow: 'Uma pergunta perigosa',
  ilus: 'curvatura',
  titulo: 'E se a curva não tivesse fundo?',
  corpo:
    '<p>Quanto mais massa num lugar, mais fundo o espaço-tempo afunda. E se uma massa enorme ficasse espremida num espaço minúsculo? A curva ficaria tão funda que nada conseguiria sair, nem a luz.</p>' +
    '<p>Muito antes de Einstein, alguém já tinha imaginado algo assim. Vamos conhecer as <b>estrelas escuras</b>.</p>',
  botao: 'Ir para a fase 4',
};

export const ROTULOS = {
  sol: 'Sol',
  terra: 'Terra',
  estrelaReal: 'estrela de verdade',
  estrelaAparente: 'onde a estrela parece estar',
  observatorio: 'observatório (eclipse de 1919)',
};

export const AVISOS = {
  apareceu: 'O Sol apareceu! Veja a grade afundar',
  quente: 'Quente demais! Afaste-se um pouco do Sol',
  primeiroCentro: 'Primeiro voe até o centro da grade',
  sonda: (n: number): string => `Sonda ${n} lançada`,
};
