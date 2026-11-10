/**
 * Textos da fase 2 (montagens). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { anguloEixoPolar } from '@shared/physics/telescopio';

export const NOME_FASE = 'Oficina · Montagens';

/** Cidades para alinhar o eixo polar (latitude em graus; negativa no hemisfério sul). */
export const CIDADES = [
  { id: 'portoalegre', nome: 'Porto Alegre', lat: -30.03 },
  { id: 'fortaleza', nome: 'Fortaleza', lat: -3.73 },
  { id: 'polonorte', nome: 'Polo Norte', lat: 90 },
];

/** O planeta acompanhado: declinação em graus (como Saturno em algumas épocas). */
export const PLANETA = { nome: 'Saturno', dec: 20 };

export const MONTAGENS = { altaz: 'Altazimutal', equatorial: 'Equatorial' };

/** Nome dos eixos de giro, presos a cada eixo na cena. */
export const EIXOS = {
  az: 'eixo de azimute',
  alt: 'eixo de altura',
  ar: 'eixo de ascensão reta (polar)',
  dec: 'eixo de declinação',
};

/** Pontos cardeais, com o azimute em graus. O primeiro aparece em destaque. */
export const CARDEAIS: [string, number][] = [
  ['Norte', 0],
  ['Leste', 90],
  ['Sul', 180],
  ['Oeste', 270],
];

export const MISSOES = {
  motores: 'Ligue os motores e compare as duas imagens de Saturno',
  altaz: 'Altazimutal: siga Saturno com as setas por 20 s',
  equatorial: 'Equatorial: siga Saturno girando só o eixo de ascensão reta por 20 s',
  polar: 'Em Porto Alegre, incline o eixo polar até ele apontar para o polo celeste',
};

export const ROTULOS = {
  motores: 'Ligar os motores',
  motoresLigados: 'Motores ligados',
  reiniciar: 'Reiniciar o céu',
  proxima: 'Próxima etapa ▶',
  trazer: 'Trazer Saturno de volta',
  esquerda: '◀',
  direita: '▶',
  cima: '▲',
  baixo: '▼',
  eixoAz: 'gira para os lados',
  eixoAlt: 'sobe e desce',
  eixoPolar: 'gira o eixo de ascensão reta',
  inclinacao: 'Inclinação do eixo polar',
  graus: (g: number): string => `${fmt(g, 0)}°`,
  naOcular: (montagem: string): string => `Ocular · ${montagem}`,
  fora: 'Saturno saiu da ocular',
  polo: (sul: boolean): string => (sul ? 'polo celeste sul' : 'polo celeste norte'),
  tempo: (s: number): string => `${fmt(s, 0)} s de 20`,
  girar: 'arraste para olhar em volta',
};

export const AVISOS = {
  motores: 'Viu? A imagem da altazimutal gira; a da equatorial fica parada',
  altaz: 'Isso! Na altazimutal são dois movimentos ao mesmo tempo',
  equatorial: 'Isso! Na equatorial basta girar um eixo, no ritmo do céu',
  polar: 'Alinhado! A linha do eixo passa pela marca do polo. Troque a cidade e veja o eixo mudar',
  sePos: 'Saturno se pôs. Reinicie o céu para ver de novo',
  semPolar: 'Ainda desalinhado: Saturno escapa da ocular',
};

export const HUD = {
  cidade: 'Cidade',
  latitude: 'Latitude',
  inclinacao: 'Eixo polar',
  altura: 'Altura de Saturno',
  giro: 'Giro da imagem (altaz.)',
  graus: (g: number): string => `${fmt(g, 1)}°`,
};

export const historia: CardDef = {
  eyebrow: 'Oficina · Montagens · 1609 a hoje',
  titulo: 'Do suporte simples ao eixo polar',
  corpo:
    '<p><b>No começo, à mão.</b> Galileu apoiava o telescópio num suporte simples, e o astrônomo corrigia a posição o tempo todo, para os lados e para cima e para baixo.</p>' +
    '<p><b>Fraunhofer, 1824.</b> O grande refrator de Dorpat, na atual Estônia, ganha a montagem equatorial alemã e um mecanismo de relógio: um eixo só, girando no ritmo do céu, acompanha as estrelas.</p>' +
    '<p><b>Hoje.</b> Com computadores corrigindo os dois eixos, os maiores telescópios voltaram à altazimutal, mais compacta e firme. Entre os amadores, a dobsoniana de John Dobson é a versão simples dela.</p>',
};

export const intro: CardDef = {
  eyebrow: 'Oficina · Montagens',
  ilus: 'montagens',
  titulo: 'As estrelas fogem do telescópio',
  corpo:
    '<p>A Terra gira, e os astros atravessam o céu e escapam do telescópio. A <b>montagem</b> segura e move o tubo.</p>' +
    '<p>A <b>altazimutal</b> move o tubo para cima e para baixo e para os lados. A <b>equatorial</b> tem o eixo de <b>ascensão reta</b> (ou polar) apontado para o polo celeste e o de <b>declinação</b>, perpendicular a ele: girando só o primeiro, ela acompanha o céu.</p>' +
    '<p>Compare as duas acompanhando Saturno e repare na imagem de cada ocular.</p>',
  avancado:
    '<p>O eixo polar fica inclinado em relação ao horizonte num ângulo igual à latitude do lugar:</p>' +
    M.bloco(M.ind(M.v('h'), M.t('eixo')) + M.o('=') + M.o('|') + M.v('φ') + M.o('|')) +
    '<p>Na altazimutal, a imagem gira pelo <b>ângulo paralático</b>, que muda enquanto o astro anda: ruim para fotos longas.</p>',
  dica: 'Arraste a cena para olhar em volta',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Oficina · Montagens',
  ilus: 'montagens',
  titulo: 'Um eixo paralelo ao da Terra',
  corpo:
    '<p>A altazimutal é simples e barata, mas precisa de dois movimentos para seguir um astro, e a imagem gira. A equatorial gira um eixo só, no ritmo do céu, e a imagem fica parada: é a preferida para fotografia.</p>' +
    '<p>A inclinação do eixo polar é a latitude do lugar. Em Fortaleza, perto do equador, ele fica quase deitado. Em Porto Alegre, sobe 30°. No Polo Norte, fica em pé.</p>',
  avancado:
    '<table><thead><tr><th>Cidade</th><th>Latitude</th><th>Eixo polar</th></tr></thead><tbody>' +
    CIDADES.map(
      (c) =>
        `<tr><td>${c.nome}</td><td>${fmt(c.lat, 1)}°</td><td>${fmt(anguloEixoPolar(c.lat), 1)}° ${c.lat < 0 ? 'para o sul' : 'para o norte'}</td></tr>`,
    ).join('') +
    '</tbody></table>',
};

const LAT_SAO_PAULO = -23.55;

export const DESAFIO = {
  titulo: 'O eixo polar em São Paulo',
  texto: `São Paulo fica na latitude ${fmt(LAT_SAO_PAULO, 1)}°. Quantos graus acima do horizonte deve ficar o eixo polar?`,
  formula: M.bloco(M.ind(M.v('h'), M.t('eixo')) + M.o('=') + M.o('|') + M.v('φ') + M.o('|')),
  unidade: 'graus',
  resposta: anguloEixoPolar(LAT_SAO_PAULO),
  tolerancia: 0.6,
  msgAcerto: 'Isso! Uns 24°, apontando para o sul, onde fica o polo celeste sul.',
};
