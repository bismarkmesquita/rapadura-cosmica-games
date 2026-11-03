import type { CardDef, Cards } from './cards';
import type { PainelAcao } from './actionPanel';

/**
 * Fim de fase: a cena continua na tela para o aluno explorar (ou o professor explicar), e o slide final só abre
 * pelo botão do canto. No slide, "Ficar nesta fase" fecha o slide, e o botão do canto continua lá.
 */
export function fimDeFase(acao: PainelAcao, cards: Cards, slideFinal: CardDef): void {
  const slide: CardDef = { ...slideFinal, secundario: { rotulo: 'Ficar nesta fase' } };
  acao.curto('Avançar ▶', () => cards.enfileira(slide));
}
