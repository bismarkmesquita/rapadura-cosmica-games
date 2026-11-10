/** O Formulário: todas as fórmulas do jogo agrupadas, aberto pelo botão "Fórmulas" (só no modo Avançado). */
import type { CardDef } from '@shared/ui/cards';
import { FORMULAS } from './formulas';

const grupo = (titulo: string, ...itens: string[]): string =>
  `<section><h3>${titulo}</h3>${itens.join('')}</section>`;
const nota = (texto: string): string => `<p class="nota-formula">${texto}</p>`;

export const FORMULARIO: CardDef = {
  eyebrow: 'Avançado',
  titulo: 'Formulário',
  corpo:
    '<div class="formulario">' +
    grupo(
      'Ângulos e paralaxe',
      FORMULAS.angulo,
      FORMULAS.paralaxe,
      nota('1 pc = 206 265 UA = 3,26 anos-luz'),
    ) +
    grupo(
      'Luminosidade e fluxo',
      FORMULAS.luminosidade,
      FORMULAS.fluxo,
      nota('σ = 5,67 × 10⁻⁸ W/(m²·K⁴); L☉ = 3,83 × 10²⁶ W'),
    ) +
    grupo(
      'Fluxo e magnitude aparente',
      FORMULAS.pogson,
      FORMULAS.razaoFluxos,
      nota('1 magnitude ≈ 2,512 vezes'),
    ) +
    grupo(
      'Luminosidade e magnitude absoluta',
      FORMULAS.absolutaLuminosidade,
      FORMULAS.bolometrica,
      FORMULAS.correcao,
      nota('Sol: M = 4,83; M<sub>bol</sub> = 4,74'),
    ) +
    grupo('m, M e distância', FORMULAS.moduloDistancia, FORMULAS.absoluta, FORMULAS.distancia) +
    grupo('Velas-padrão (Cefeidas)', FORMULAS.cefeida, nota('P em dias')) +
    '</div>',
  botao: 'Fechar',
};
