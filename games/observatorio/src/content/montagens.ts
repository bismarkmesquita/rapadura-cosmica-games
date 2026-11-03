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
  { id: 'fortaleza', nome: 'Fortaleza', lat: -3.73 },
  { id: 'saopaulo', nome: 'São Paulo', lat: -23.55 },
  { id: 'polonorte', nome: 'Polo Norte', lat: 90 },
];

/** O planeta acompanhado: declinação em graus (como Saturno em algumas épocas). */
export const PLANETA = { nome: 'Saturno', dec: 20 };

export const MONTAGENS = { altaz: 'Altazimutal', equatorial: 'Equatorial' };

export const MISSOES = {
  motores: 'Ligue os motores e compare as duas imagens de Saturno',
  altaz: 'Altazimutal: siga Saturno com as setas por 20 s',
  equatorial: 'Equatorial: siga Saturno girando só o eixo polar por 20 s',
  polar: 'Em Fortaleza, incline o eixo polar até ele apontar para o polo celeste',
};

export const ROTULOS = {
  motores: 'Ligar os motores',
  motoresLigados: 'Motores ligados',
  esquerda: '◀',
  direita: '▶',
  cima: '▲',
  baixo: '▼',
  eixoAz: 'gira para os lados',
  eixoAlt: 'sobe e desce',
  eixoPolar: 'gira o eixo polar',
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
  polar: 'Alinhado! Agora troque a cidade e veja o eixo mudar',
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

export const intro: CardDef = {
  eyebrow: 'Oficina · Montagens',
  ilus: 'montagens',
  titulo: 'As estrelas fogem do telescópio',
  corpo:
    '<p>A Terra gira, então as estrelas e os planetas atravessam o céu e escapam do telescópio. A <b>montagem</b> é a parte que segura e move o tubo.</p>' +
    '<p>A <b>altazimutal</b> move o tubo para cima e para baixo e para os lados; a dobsoniana é a versão mais simples dela. A <b>equatorial</b> tem um eixo apontado para o polo celeste, paralelo ao eixo da Terra: girando só esse eixo, ela acompanha o céu.</p>' +
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
    '<p>Em Fortaleza, perto do equador, o eixo polar fica quase deitado. No Polo Norte, fica em pé. Nas fotos de telescópios da Europa, ele aparece bem inclinado.</p>',
  avancado:
    '<table><thead><tr><th>Cidade</th><th>Latitude</th><th>Eixo polar</th></tr></thead><tbody>' +
    CIDADES.map(
      (c) =>
        `<tr><td>${c.nome}</td><td>${fmt(c.lat, 1)}°</td><td>${fmt(anguloEixoPolar(c.lat), 1)}° ${c.lat < 0 ? 'para o sul' : 'para o norte'}</td></tr>`,
    ).join('') +
    '</tbody></table>',
};

const LAT_PORTO_ALEGRE = -30.03;

export const DESAFIO = {
  titulo: 'O eixo polar em Porto Alegre',
  texto: `Porto Alegre fica na latitude ${fmt(LAT_PORTO_ALEGRE, 1)}°. Quantos graus acima do horizonte deve ficar o eixo polar?`,
  formula: M.bloco(M.ind(M.v('h'), M.t('eixo')) + M.o('=') + M.o('|') + M.v('φ') + M.o('|')),
  unidade: 'graus',
  resposta: anguloEixoPolar(LAT_PORTO_ALEGRE),
  tolerancia: 0.6,
  msgAcerto: 'Isso! Uns 30°, apontando para o sul, onde fica o polo celeste sul.',
};
