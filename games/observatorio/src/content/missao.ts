/**
 * Textos da missão final. Edite à vontade: o código só usa as chaves.
 * Preços e alvos foram escolhidos para só uma combinação pegar os três alvos dentro do orçamento.
 */
import type { CardDef } from '@shared/ui/cards';
import { fmt } from '@shared/math/format';

export const NOME_FASE = 'Missão final';

export const ORCAMENTO = 14;

export const ABERTURAS = [
  { mm: 70, custo: 2 },
  { mm: 150, custo: 5 },
  { mm: 300, custo: 8 },
];

/** Arranjo: a razão focal decide a distância focal (F = N × D) e, com ela, o aumento de cada ocular. */
export const ARRANJOS = [
  { id: 'newtoniano', nome: 'Newtoniano f/5', razao: 5, custo: 0 },
  { id: 'sct', nome: 'Schmidt-Cass. f/10', razao: 10, custo: 2 },
];

export const LOCAIS = [
  { id: 'cidade', nome: 'Cidade', seeing: 3, custo: 0 },
  { id: 'montanha', nome: 'Montanha', seeing: 0.6, custo: 4 },
  { id: 'espaco', nome: 'Espaço', seeing: 0, custo: 30 },
];

export const OCULARES = [25, 10, 6, 4];
export const CUSTO_OCULAR = 1;

/**
 * Quantas magnitudes o céu claro da cidade tira da magnitude limite. Valor ilustrativo: num céu urbano
 * típico, a olho nu se vê até a magnitude 4 ou 5, em vez de 6.
 */
export const PERDA_CEU_CIDADE = 1.5;

export const ALVOS = {
  planeta: { nome: 'Saturno', aumentoMin: 90 },
  galaxia: { nome: 'Galáxia fraca', mag: 11.5 },
  dupla: { nome: 'Estrela dupla', separacao: 0.9 },
};

export const MISSOES = {
  tres: `Consiga ver os três alvos gastando no máximo ${ORCAMENTO} moedas`,
};

export const ROTULOS = {
  abertura: 'Abertura',
  arranjo: 'Arranjo',
  local: 'Lugar',
  oculares: 'Oculares',
  preco: (nome: string, custo: number): string => (custo ? `${nome} · ${custo}` : nome),
  mm: (d: number): string => `${fmt(d, 0)} mm`,
  moedas: (n: number, total: number): string => `${n} de ${total} moedas`,
};

export const MOTIVOS = {
  planetaOk: (a: number): string => `Anéis nítidos com ${fmt(a, 0)}×`,
  semOcular: 'Falta uma ocular',
  poucoAumento: 'Pouco aumento: os anéis não aparecem',
  muitoAumento: 'Aumento demais: a imagem borra',
  galaxiaOk: (lim: number): string => `Visível (magnitude limite ${fmt(lim, 1)})`,
  galaxiaNao: (lim: number): string => `Fraca demais (magnitude limite ${fmt(lim, 1)})`,
  duplaOk: (img: number): string => `Separadas (imagem de ${fmt(img, 2)}″)`,
  duplaAr: 'O ar da cidade borra tudo',
  duplaPequena: (img: number): string => `Juntas: a imagem (${fmt(img, 2)}″) é maior que a separação`,
};

export const AVISOS = {
  caro: 'Passou do orçamento: troque alguma escolha',
  tres: 'Os três alvos! Esse é um bom observatório para a turma',
};

export const HUD = {
  gasto: 'Gasto',
  focal: 'Distância focal',
  alvos: 'Alvos vistos',
  de: (n: number): string => `${n} de 3`,
};

export const intro: CardDef = {
  eyebrow: 'Missão final',
  ilus: 'missao',
  titulo: 'Monte o seu observatório',
  corpo:
    `<p>Vocês têm <b>${ORCAMENTO} moedas</b> para montar um telescópio: abertura, arranjo, lugar e oculares. Cada escolha tem um preço.</p>` +
    '<p>Os alvos da noite são três: <b>Saturno</b>, uma <b>galáxia fraca</b> e uma <b>estrela dupla</b> bem fechada. A vista de cada um muda na hora, conforme as escolhas.</p>' +
    '<p>Consigam os três e expliquem cada escolha para a turma.</p>',
  dica: 'As escolhas ficam embaixo; o preço aparece em cada botão',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Missão final',
  ilus: 'missao',
  titulo: 'Observatório montado',
  corpo:
    '<p>A abertura grande junta luz para a galáxia e separa a dupla; a montanha tira o ar tremendo e o céu claro da cidade; a ocular certa dá o aumento para os anéis sem passar do limite.</p>' +
    '<p>É o mesmo raciocínio dos astrônomos quando escolhem onde construir um observatório e que instrumentos levar.</p>',
};
