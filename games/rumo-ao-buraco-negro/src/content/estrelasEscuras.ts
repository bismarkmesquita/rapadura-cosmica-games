/** Textos da fase 4 (estrelas escuras). */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';

export const NOME_FASE = 'Fase 4 · Estrelas escuras';

export const MISSOES = {
  chegar: 'Aproxime-se da estrela gigante azul',
  colapso: 'Clique em "Ver o fim da estrela"',
  calculo: 'Desafio EF2 (opcional): o raio de Schwarzschild do Sol',
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
  eyebrow: 'Fase 4 · Uma estrela gigante',
  ilus: 'gigante',
  titulo: 'Estrelas que vivem depressa',
  corpo:
    '<p>À frente está uma <b>supergigante azul</b>, com cerca de 25 vezes a massa do Sol. Estrelas assim brilham demais e gastam o combustível depressa: vivem só alguns milhões de anos, enquanto o Sol vai viver uns 10 bilhões.</p>' +
    '<p>Repare como ela afunda o espaço-tempo. Aproxime-se, mas não demais.</p>',
};

export const michell: CardDef = {
  eyebrow: 'John Michell · 1783',
  ilus: 'estrelaEscura',
  titulo: 'Uma estrela tão pesada que a luz não escapa',
  corpo:
    '<p>Em 1783, o inglês John Michell fez uma pergunta ousada: se uma bola jogada para cima volta ao chão, e se a luz também fosse puxada pela gravidade? Uma estrela com massa suficiente, num tamanho pequeno o bastante, teria velocidade de escape maior que a da luz.</p>' +
    '<p>Ela seria invisível: uma <b>estrela escura</b>. Anos depois, o francês Pierre-Simon Laplace teve a mesma ideia. Por mais de um século, isso foi só especulação.</p>',
  ef2:
    '<p>Michell usou a física de Newton, igualando a velocidade de escape à velocidade da luz:</p>' +
    M.bloco(
      M.v('c') +
        M.o('=') +
        M.raiz(M.fr(M.n(2) + M.v('G') + M.v('M'), M.v('R'))) +
        M.esp() +
        M.o('⇒') +
        M.esp() +
        M.v('R') +
        M.o('=') +
        M.fr(M.n(2) + M.v('G') + M.v('M'), M.pot(M.v('c'), M.n(2))),
    ) +
    '<p>Por coincidência, é a mesma fórmula que a relatividade de Einstein daria mais tarde.</p>',
};

export const schwarzschild: CardDef = {
  eyebrow: 'Karl Schwarzschild · 1916',
  ilus: 'colapso',
  titulo: 'Nasce um buraco negro',
  corpo:
    '<p>Quando uma estrela muito grande gasta o combustível, ela explode como <b>supernova</b>. O que sobra no centro desaba sobre si mesmo e fica tão compacto que a curva do espaço-tempo vira um poço sem fundo.</p>' +
    '<p>Em 1916, poucos meses depois da teoria de Einstein, o alemão Karl Schwarzschild resolveu as equações para uma massa concentrada num ponto e encontrou um raio especial: quem passa dele não volta mais. Hoje esse raio se chama <b>raio de Schwarzschild</b>, e a fronteira, <b>horizonte de eventos</b>.</p>' +
    '<p>Repare na grade: longe do centro, ela continua igual. A massa é a mesma; só ficou muito mais concentrada.</p>',
  ef2:
    M.bloco(raioS) +
    '<p>Para o Sol, R<sub>S</sub> ≈ 3 km. Para a Terra, menos de 1 cm. O desafio está no painel.</p>',
};

export const wheeler: CardDef = {
  eyebrow: 'John Wheeler · 1967',
  ilus: 'buracoNegro',
  titulo: 'Um nome para o mistério',
  corpo:
    '<p>Durante décadas, muitos físicos, incluindo o próprio Einstein, duvidaram que esses objetos existissem de verdade. O nome que usamos hoje ficou popular em 1967, com o físico americano John Wheeler: <b>buraco negro</b>.</p>' +
    '<p>Hoje sabemos que eles existem. Já os encontramos pelo movimento de estrelas, pelas ondas gravitacionais e até em fotos. Está na hora de visitar um deles.</p>',
  botao: 'Ir para a fase 5',
};

export const BOTAO_COLAPSO = {
  eyebrow: 'A seguir',
  titulo: 'O fim de uma estrela gigante',
  texto:
    'Quando o combustível acaba, estrelas assim terminam de um jeito espetacular. A câmera vai mostrar de longe.',
  rotulo: 'Ver o fim da estrela',
};

export const DESAFIO = {
  titulo: 'Calcule o raio de Schwarzschild do Sol',
  texto: 'Use G = 6,67 × 10⁻¹¹, M = 1,99 × 10³⁰ kg e c = 3,00 × 10⁸ m/s. Responda em km.',
  formula: M.linha(raioS),
  unidade: 'km',
  resposta: 2.95,
  tolerancia: 0.2,
  acerto:
    'Correto! Cerca de 3 km. O Sol inteiro teria que caber numa esfera do tamanho de uma cidade pequena.',
};

export const ROTULOS = {
  estrela: 'supergigante azul (~25 massas solares)',
  buracoNegro: 'buraco negro: mesma massa, num espaço minúsculo',
};

export const ESTADOS = { estrela: 'supergigante azul', colapso: 'em colapso…', bn: 'buraco negro' } as const;

export const AVISOS = {
  pertoEstrela: 'Perto demais da estrela!',
  pertoBuraco: 'Cuidado! Perto demais do buraco negro',
};
