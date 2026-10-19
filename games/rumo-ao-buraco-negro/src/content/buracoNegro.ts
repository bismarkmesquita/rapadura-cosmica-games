/** Textos da fase 5 (Sagitário A*). */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { CANAL } from '@shared/brand/canal';

export const NOME_FASE = 'Fase 5 · Buraco negro';

export const MISSOES = {
  estrelas: 'Chegue perto das estrelas que giram em volta do centro',
  disco: 'Aproxime-se do disco brilhante',
  perto: 'Desça até 2 raios do horizonte',
  horizonte: 'Cruze o horizonte de eventos',
};

export const TECLAS: [string, string][] = [
  ['Mouse', 'vira'],
  ['W', 'acelera'],
  ['S', 'freia'],
  ['Shift', 'turbo'],
  ['V', '1ª/3ª pessoa'],
  ['M', 'mapa'],
  ['C', 'rever card'],
];

const raioS =
  M.ind(M.v('R'), M.v('S')) + M.o('=') + M.fr(M.n(2) + M.v('G') + M.v('M'), M.pot(M.v('c'), M.n(2)));

export const intro: CardDef = {
  eyebrow: 'Fase 5 · Centro da Via Láctea',
  ilus: 'buracoNegro',
  titulo: 'Rumo a Sagitário A*',
  corpo:
    '<p>No centro da nossa galáxia, a uns 27 mil anos-luz daqui, existe um buraco negro supermassivo: <b>Sagitário A*</b>, com cerca de 4 milhões de vezes a massa do Sol.</p>' +
    '<p>Sua nave vai chegar perto dele. A gravidade aqui é fortíssima: siga a seta, use o freio e fique de olho no painel. Distâncias e tamanhos estão fora de escala.</p>',
  dica: 'O painel mostra o ritmo do tempo e a velocidade de escape',
};

export const estrelas: CardDef = {
  eyebrow: 'Estrelas em disparada',
  ilus: 'estrelasS',
  titulo: 'Algo invisível segura essas estrelas',
  corpo:
    '<p>Essas estrelas giram em volta de um ponto onde não se vê nada. Uma delas, a <b>S2</b>, dá uma volta a cada 16 anos e, no ponto mais próximo, passa a mais de 7 mil km/s.</p>' +
    '<p>Acompanhando essas órbitas durante décadas, astrônomos calcularam a massa escondida no centro: uns 4 milhões de sóis num espaço menor que o Sistema Solar. Só um buraco negro explica isso. A descoberta deu o Prêmio Nobel de Física de 2020 a Reinhard Genzel e Andrea Ghez.</p>',
  ef2:
    '<p>É a 3ª lei de Kepler, na forma de Newton, usada para pesar o buraco negro:</p>' +
    M.bloco(
      M.v('M') +
        M.o('=') +
        M.fr(M.n(4) + M.pot(M.v('π'), M.n(2)) + M.pot(M.v('a'), M.n(3)), M.v('G') + M.pot(M.v('T'), M.n(2))),
    ),
};

export const disco: CardDef = {
  eyebrow: 'Disco de acreção',
  ilus: 'disco',
  titulo: 'O que brilha não é o buraco negro',
  corpo:
    '<p>O buraco negro não brilha. O que brilha é o gás em volta dele: girando muito rápido num disco, ele se esfrega e esquenta até milhões de graus.</p>' +
    '<p>A luz desse gás faz curva em volta do buraco negro, e o centro aparece como uma sombra escura. Foi assim que o Event Horizon Telescope fotografou o buraco negro M87*, em 2019, e o próprio Sagitário A*, em 2022.</p>',
  ef2:
    '<p>O tamanho do horizonte de Sagitário A* sai da fórmula de Schwarzschild. Tente a conta no painel; é opcional.</p>' +
    M.bloco(raioS),
};

export const perto: CardDef = {
  eyebrow: 'Perto do horizonte',
  ilus: 'espaguete',
  titulo: 'O tempo desacelera e a nave estica',
  corpo:
    '<p>Olhe o painel: aqui, cada segundo seu já vale 1,4 segundo para quem está longe. Quanto mais perto do horizonte, maior a diferença.</p>' +
    '<p>A gravidade na frente da nave é mais forte que na traseira, e ela começa a esticar. Os cientistas chamam isso, de verdade, de <b>espaguetificação</b>. Num buraco negro do tamanho de uma estrela, isso seria fatal bem antes do horizonte; num gigante como Sagitário A*, só bem mais perto do centro. Aqui, o efeito está exagerado.</p>' +
    '<p>A velocidade de escape já passa de 70% da velocidade da luz. No horizonte, ela chega à própria velocidade da luz.</p>',
  ef2:
    M.bloco(
      M.fr(M.ind(M.v('Δt'), M.t('nave')), M.ind(M.v('Δt'), M.t('longe'))) +
        M.o('=') +
        M.raiz(M.n(1) + M.o('−') + M.fr(M.ind(M.v('R'), M.v('S')), M.v('r'))),
    ) +
    '<p>A 2 raios de Schwarzschild, o ritmo é √(1/2) ≈ 71%: cada segundo seu vale 1,4 segundo lá fora.</p>',
};

export const horizonte: CardDef = {
  eyebrow: 'Além do horizonte de eventos',
  ilus: 'buracoNegro',
  titulo: 'Você cruzou o ponto sem volta',
  corpo:
    '<p>Depois do horizonte de eventos, nenhum sinal da nave consegue sair, nem a luz. Para quem ficou longe, a nave parece ficar cada vez mais lenta e avermelhada perto da borda, até sumir.</p>' +
    '<p>O que acontece lá dentro? Ninguém sabe ao certo. As equações de Einstein preveem uma <b>singularidade</b> no centro, mas ali a teoria para de funcionar. É um dos maiores mistérios da física.</p>',
  botao: 'Ver a viagem completa',
};

export const resumo: CardDef = {
  eyebrow: 'Missão cumprida',
  ilus: 'linhaTempo',
  titulo: 'De Kepler ao buraco negro',
  corpo:
    '<p>Você refez, numa nave, uma viagem de quatro séculos da ciência:</p>' +
    '<p>Kepler descreveu <b>como</b> os planetas se movem. Newton explicou <b>por quê</b>, com a gravitação universal. Einstein mostrou que a gravidade é a <b>curvatura do espaço-tempo</b>. Michell e Schwarzschild imaginaram e calcularam objetos de onde nem a luz escapa. E no século XXI os buracos negros foram detectados por ondas gravitacionais e fotografados.</p>' +
    `<p>Quer continuar estudando? No canal ${CANAL.nome} tem aulas de astronomia para as olimpíadas.</p>` +
    `<div class="links-canal"><a class="btn" href="${CANAL.site}" target="_blank" rel="noopener">Site do canal</a>` +
    `<a class="btn" href="${CANAL.youtube}" target="_blank" rel="noopener">Canal no YouTube</a></div>`,
  botao: 'Voltar ao menu',
};

export const DESAFIO = {
  titulo: 'Calcule o raio do horizonte de Sagitário A*',
  texto:
    'M = 4,3 milhões × 1,99 × 10³⁰ kg, G = 6,67 × 10⁻¹¹ e c = 3,00 × 10⁸ m/s. Responda em milhões de km.',
  formula: M.linha(raioS),
  unidade: 'milhões de km',
  resposta: 12.7,
  tolerancia: 0.8,
  acerto: 'Correto! Uns 12,7 milhões de km. Caberia com folga dentro da órbita de Mercúrio.',
};

export const ROTULOS = { buraco: 'Sagitário A* (fora de escala)', s2: 'S2' };

export const AVISOS = { semVolta: 'Não dá mais para voltar!' };
