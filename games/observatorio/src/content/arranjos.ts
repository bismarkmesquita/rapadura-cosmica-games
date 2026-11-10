/**
 * Textos da fase 1 (tipos e arranjos ópticos). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { porDispositivo } from '@shared/ui/toque';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { razaoFocal } from '@shared/physics/telescopio';
import type { Arranjo } from '../core/telescopio';

export const NOME_FASE = 'Oficina · Arranjos ópticos';

/** Os quatro arranjos. Tubo e distância focal são de telescópios comuns, para a comparação do Avançado. */
export const ARRANJOS: Record<Arranjo, { nome: string; curto: string; tuboM: number; focalM: number }> = {
  refrator: { nome: 'Refrator', curto: 'Refrator', tuboM: 1, focalM: 1 },
  newtoniano: { nome: 'Newtoniano', curto: 'Newtoniano', tuboM: 0.95, focalM: 1 },
  cassegrain: { nome: 'Cassegrain', curto: 'Cassegrain', tuboM: 0.6, focalM: 2.4 },
  sct: { nome: 'Schmidt-Cassegrain', curto: 'Schmidt-Cass.', tuboM: 0.43, focalM: 2.03 },
};

/** Peças que o aluno pode tocar: nome simples, nome técnico (Avançado) e para que servem. */
export const PECAS: Record<string, { simples: string; tecnico: string; funcao: string }> = {
  tubo: {
    simples: 'Tubo',
    tecnico: 'Tubo óptico',
    funcao: 'segura as peças no lugar e bloqueia a luz de fora',
  },
  objetiva: { simples: 'Lente grande', tecnico: 'Objetiva', funcao: 'junta a luz e forma a imagem no foco' },
  primario: {
    simples: 'Espelho grande',
    tecnico: 'Espelho primário (objetiva)',
    funcao: 'junta a luz e manda para o foco',
  },
  secundario: {
    simples: 'Espelho pequeno',
    tecnico: 'Espelho secundário',
    funcao: 'desvia a luz até a ocular',
  },
  corretora: {
    simples: 'Lente fina da frente',
    tecnico: 'Placa corretora de Schmidt',
    funcao: 'corrige a imagem de um espelho esférico',
  },
  focalizador: {
    simples: 'Focalizador',
    tecnico: 'Focalizador',
    funcao: 'move a ocular para deixar a imagem nítida',
  },
  ocular: {
    simples: 'Ocular',
    tecnico: 'Ocular',
    funcao: 'é onde fica o olho: amplia a imagem formada no foco',
  },
};

export const PLANO_FOCAL = 'plano focal';

export const MISSOES = {
  newtoniano: 'Newtoniano: gire o espelho pequeno até a luz chegar na ocular',
  cassegrain: 'Cassegrain: escolha o espelho pequeno e a posição para a luz passar pelo furo',
  cores: 'Refrator: acenda a luz branca e veja as bordas coloridas',
};

export const ROTULOS = {
  transparente: 'Tubo transparente',
  angulo: 'Ângulo do espelho pequeno',
  graus: (g: number): string => `${fmt(g, 0)}°`,
  tipo: { plano: 'Plano', convexo: 'Convexo', concavo: 'Côncavo' },
  posicao: 'Posição do espelho pequeno',
  luzBranca: 'Luz branca',
  sct: 'Uma lente fina na frente e o mesmo truque do Cassegrain: tubo curto, foco longo.',
  ocular: 'Vista na ocular',
  semLuz: 'sem luz aqui',
  girar: porDispositivo('arraste para girar · roda aproxima', 'arraste para girar · pinça aproxima'),
};

/** Aviso ao concluir cada missão (as chaves são as das MISSOES). */
export const AVISOS_MISSAO: Record<keyof typeof MISSOES, string> = {
  newtoniano: 'Isso! A 45°, o espelho pequeno manda a luz para o lado, até a ocular',
  cassegrain: 'Isso! O espelho convexo devolve a luz pelo furo do espelho grande',
  cores: 'Viu as bordas coloridas? A lente desvia cada cor de um jeito',
};

export const peca = (nome: string, funcao: string): string => `${nome}: ${funcao}`;

export const HUD = {
  arranjo: 'Arranjo',
  tubo: 'Tubo',
  focal: 'Distância focal',
  metros: (m: number): string => `${fmt(m, 2)} m`,
};

const sct = ARRANJOS.sct;

export const historia: CardDef = {
  eyebrow: 'Oficina · 1609 a 1668',
  ilus: 'historiaOptica',
  titulo: 'De Galileu a Newton',
  corpo:
    '<p><b>Galileu, 1609.</b> Uma lente convexa na frente e uma côncava na ocular, antes do foco. A imagem fica direita, mas o campo de visão é pequeno.</p>' +
    '<p><b>Kepler, 1611.</b> A ocular vira uma lente convexa, depois do foco. A imagem fica invertida, e o campo, bem maior. É o refrator desta oficina.</p>' +
    '<p><b>Newton, 1668.</b> As lentes criavam bordas coloridas. Ele trocou a objetiva por um espelho curvo e, com um espelho pequeno a 45°, levou o foco para a lateral do tubo.</p>',
  avancado:
    '<p>Em 1672, o arranjo atribuído a Laurent Cassegrain troca o espelho a 45° por um secundário convexo, que devolve a luz por um furo no primário. Em 1931, Bernhard Schmidt cria a placa corretora, a lente fina do Schmidt-Cassegrain.</p>',
};

export const intro: CardDef = {
  eyebrow: 'Oficina · Arranjos ópticos',
  ilus: 'arranjos',
  titulo: 'Lente ou espelho?',
  corpo:
    '<p>A peça principal de um telescópio é a que junta a luz: a <b>objetiva</b>. Ela pode ser uma <b>lente</b> (refrator) ou um <b>espelho</b> curvo (refletor).</p>' +
    '<p>Lentes desviam cada cor de um jeito; espelhos, não. Depois de Newton, vieram arranjos que dobram o caminho da luz para encurtar o tubo.</p>' +
    '<p>Monte cada arranjo e faça a luz chegar na ocular.</p>',
  avancado:
    '<p>Nos arranjos Cassegrain, o espelho secundário convexo devolve a luz e alonga a distância focal: o tubo fica curto, mas o telescópio se comporta como um muito mais longo.</p>',
  dica: porDispositivo(
    'Arraste a cena para girar o telescópio e clique numa peça para ver o nome',
    'Arraste para girar o telescópio e toque numa peça para ver o nome',
  ),
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Oficina · Arranjos ópticos',
  ilus: 'arranjos',
  titulo: 'Cada arranjo, um caminho para a luz',
  corpo:
    '<p>No <b>refrator</b>, a luz atravessa uma lente. No <b>newtoniano</b>, um espelho grande junta a luz e um espelho pequeno, a 45°, a manda para o lado.</p>' +
    '<p>No <b>Cassegrain</b>, um espelho pequeno e convexo devolve a luz por um furo no espelho grande. O <b>Schmidt-Cassegrain</b> faz o mesmo com uma lente fina na frente. Os dois cabem num tubo curto.</p>',
  avancado:
    '<table><thead><tr><th>Arranjo</th><th>Tubo</th><th>Distância focal</th></tr></thead><tbody>' +
    Object.values(ARRANJOS)
      .map((a) => `<tr><td>${a.nome}</td><td>${fmt(a.tuboM, 2)} m</td><td>${fmt(a.focalM, 2)} m</td></tr>`)
      .join('') +
    '</tbody></table>',
};

const D_SCT_MM = 203;

export const DESAFIO = {
  titulo: 'A razão focal de um tubo curto',
  texto: `Um Schmidt-Cassegrain tem abertura de ${D_SCT_MM} mm e distância focal de ${fmt(sct.focalM * 1000, 0)} mm, num tubo de só ${fmt(sct.tuboM * 100, 0)} cm. Qual é a razão focal dele (o número do "f/")?`,
  formula: M.bloco(M.v('N') + M.o('=') + M.fr(M.v('F'), M.v('D'))),
  unidade: 'f/',
  resposta: razaoFocal(sct.focalM * 1000, D_SCT_MM),
  tolerancia: 0.3,
  msgAcerto: 'Isso! f/10: a distância focal é 10 vezes a abertura, num tubo de menos de meio metro.',
};
