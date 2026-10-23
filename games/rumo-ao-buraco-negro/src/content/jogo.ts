import { porDispositivo, type BotaoToque } from '@shared/ui/toque';

/** Textos gerais do jogo, fora das fases. */
export const AVISOS_CAMERA = {
  fixa: 'Nesta fase a câmera fica vista de cima',
  primeira: 'Primeira pessoa: você está na cabine',
  terceira: 'Terceira pessoa: câmera atrás da nave',
  mapa: porDispositivo('Mapa: aponte com o mouse para onde quer ir', 'Mapa: toque onde quer ir'),
  volta: 'De volta à nave',
  telaCheia: 'Tela cheia não disponível aqui',
};

/** Controles na tela, no celular. Os botões de cada fase ficam no content/ da fase (TOQUE). */
export const TOQUE = {
  direcao: [
    { tecla: 'a', rotulo: '◀', nome: 'Virar para a esquerda', modo: 'segurar' },
    { tecla: 'd', rotulo: '▶', nome: 'Virar para a direita', modo: 'segurar' },
  ],
  motor: [
    { tecla: 'shift', rotulo: 'Turbo', modo: 'alternar' },
    { tecla: 's', rotulo: 'Frear', modo: 'segurar' },
    { tecla: 'w', rotulo: 'Acelerar', modo: 'segurar', classe: 'btn-toque--principal' },
  ],
  sistema: [
    { tecla: 'escape', rotulo: 'II', nome: 'Pausa' },
    { tecla: 'v', rotulo: 'Câmera', classe: 'so-com-camera-livre' },
    { tecla: 'm', rotulo: 'Mapa', classe: 'so-com-camera-livre' },
    { tecla: 'h', rotulo: 'Painel', nome: 'Mostrar ou esconder o painel' },
  ],
} satisfies Record<string, BotaoToque[]>;
