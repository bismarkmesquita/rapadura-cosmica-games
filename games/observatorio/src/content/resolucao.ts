/**
 * Textos da fase 5 (escala de placa e resolução angular). Edite à vontade: o código só usa as chaves.
 * Fórmulas usam o construtor M (MathML); veja shared/math/mathml.ts.
 */
import type { CardDef } from '@shared/ui/cards';
import { M } from '@shared/math/mathml';
import { fmt } from '@shared/math/format';
import { LAMBDA_VISIVEL_NM } from '@shared/physics/constantes';
import { escalaDePlaca, resolucaoRayleigh } from '@shared/physics/telescopio';

export const NOME_FASE = 'Observatório · Resolução';

/** Separação da estrela dupla, em segundos de arco. */
export const SEPARACAO = 1.2;

/** Aberturas para escolher, em mm. */
export const ABERTURAS = [50, 70, 100, 150, 200, 300];

/** Câmeras: tamanho do pixel em micrômetros (null: olhando pela ocular, sem câmera). */
export const CAMERAS: { id: string; nome: string; pixelUm: number | null }[] = [
  { id: 'olho', nome: 'Sem câmera', pixelUm: null },
  { id: 'a', nome: 'Câmera A · 9 µm', pixelUm: 9 },
  { id: 'b', nome: 'Câmera B · 3,8 µm', pixelUm: 3.8 },
  { id: 'c', nome: 'Câmera C · 2,4 µm', pixelUm: 2.4 },
];

export const MISSOES = {
  separar: 'Separe a estrela dupla escolhendo a abertura',
  camera: 'Ache uma câmera em que a dupla ocupe mais de um pixel',
};

export const ROTULOS = {
  mm: (d: number): string => `${fmt(d, 0)} mm`,
  vista: 'A estrela dupla',
  separada: 'Separadas!',
  junta: 'Parece uma estrela só',
  pixels: (n: number): string => `separação: ${fmt(n, 1)} pixel${n >= 2 ? 's' : ''}`,
  escala: (seg: number): string => `${fmt(seg, 1)}″`,
};

export const AVISOS = {
  separar: 'Isso! Com essa abertura os dois discos não se misturam',
  camera: 'Isso! Agora cada estrela cai num pixel diferente',
  junta: 'Ainda misturadas: precisa de mais abertura',
  semCamera: 'Escolha uma das câmeras',
  pixelGrande: 'A dupla cabe num pixel só: a câmera não separa',
};

export const HUD = {
  abertura: 'Abertura',
  separacao: 'Separação da dupla',
  resolucao: 'Resolução (Rayleigh)',
  escala: 'Escala de placa',
  pixel: 'Cada pixel',
  seg: (s: number): string => `${fmt(s, 2)}″`,
};

const F = 1000;
const D = 200;

export const intro: CardDef = {
  eyebrow: 'Observatório · Resolução',
  ilus: 'dupla',
  titulo: 'Duas estrelas ou uma?',
  corpo:
    '<p>A luz se espalha um pouquinho ao passar pela abertura do telescópio: cada estrela vira um <b>pequeno disco</b>. Se duas estrelas estão próximas demais, os discos se misturam e parecem uma só.</p>' +
    '<p>Quanto maior a abertura, menor o disco e mais detalhes aparecem. Numa câmera, ainda é preciso que as estrelas caiam em pixels diferentes.</p>' +
    '<p>Separe a estrela dupla e depois escolha a câmera certa.</p>',
  avancado:
    M.bloco(
      M.v('θ') +
        M.o('[″]') +
        M.o('≈') +
        M.n('1,22') +
        M.fr(M.v('λ'), M.v('D')) +
        M.o('·') +
        M.n('206 265') +
        M.esp() +
        M.v('s') +
        M.o('[″/mm]') +
        M.o('=') +
        M.fr(M.n('206 265'), M.v('F') + M.o('[mm]')),
    ) +
    `<p>Com ${D} mm e luz de ${LAMBDA_VISIVEL_NM} nm, a resolução é de ${fmt(resolucaoRayleigh(D), 1)}″. Com F = ${fmt(F, 0)} mm, a escala de placa é de ${fmt(escalaDePlaca(F), 0)}″ por milímetro do sensor.</p>`,
  dica: 'Os botões ficam embaixo',
  botao: 'Começar',
};

export const fim: CardDef = {
  eyebrow: 'Observatório · Resolução',
  ilus: 'dupla',
  titulo: 'Abertura separa, pixel registra',
  corpo:
    '<p>A abertura decide o tamanho do disco de cada estrela: é ela que separa estrelas próximas e mostra detalhes.</p>' +
    '<p>Numa câmera, a escala de placa diz quanto do céu cai em cada pixel. Pixels grandes demais juntam as duas estrelas no mesmo quadradinho, mesmo com um telescópio bom.</p>',
  avancado:
    '<table><thead><tr><th>Abertura</th><th>Resolução</th></tr></thead><tbody>' +
    ABERTURAS.map((a) => `<tr><td>${fmt(a, 0)} mm</td><td>${fmt(resolucaoRayleigh(a), 2)}″</td></tr>`).join(
      '',
    ) +
    '</tbody></table>',
};

export const DESAFIO = {
  titulo: 'A resolução de um refrator pequeno',
  texto: `Qual é a resolução, em segundos de arco, de um telescópio de 100 mm, com luz de ${LAMBDA_VISIVEL_NM} nm?`,
  formula: M.bloco(M.v('θ') + M.o('≈') + M.n('1,22') + M.fr(M.v('λ'), M.v('D')) + M.o('·') + M.n('206 265')),
  unidade: '″',
  resposta: resolucaoRayleigh(100),
  tolerancia: 0.05,
  msgAcerto: `Isso! Uns ${fmt(resolucaoRayleigh(100), 1)}″: o dobro do telescópio de 200 mm.`,
};
