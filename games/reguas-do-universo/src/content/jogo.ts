/** Textos gerais do jogo, fora das fases. */
import { porDispositivo } from '@shared/ui/toque';

/** Fases no menu e réguas da escada de distâncias, na ordem da aula. */
export const FASES_MENU: { id: number; titulo: string; resumo: string; regua: string }[] = [
  { id: 1, titulo: 'Ângulos', resumo: 'O tamanho no céu', regua: 'Ângulos' },
  { id: 2, titulo: 'Paralaxe', resumo: 'O pulo das estrelas', regua: 'Paralaxe' },
  { id: 3, titulo: 'Fluxo', resumo: 'Brilho e distância', regua: 'Fluxo' },
  { id: 4, titulo: 'Magnitude aparente', resumo: 'A escala de Hiparco', regua: 'Magnitude aparente' },
  { id: 5, titulo: 'Magnitude absoluta', resumo: 'Todas a 10 parsecs', regua: 'Magnitude absoluta' },
  { id: 6, titulo: 'Bolométrica', resumo: 'A luz que não vemos', regua: 'Magnitude bolométrica' },
  { id: 7, titulo: 'Velas-padrão', resumo: 'Cefeidas e supernovas', regua: 'Velas-padrão' },
];

export const EM_BREVE = 'Em breve';

export const AVANCADO = {
  rotulo: 'Avançado',
  /** Título do bloco de fórmulas nos slides. */
  bloco: 'Avançado',
  ligado: 'Modo Avançado ligado: fórmulas e números exatos',
  desligado: 'Modo Avançado desligado',
};

export const BOTOES = {
  comecar: 'Começar',
  proxima: (n: number): string => `Ir para a fase ${n}`,
  menu: 'Voltar ao menu',
  pausa: porDispositivo('Pausa (Esc)', 'II'),
};

export const reguaConquistada = (nome: string): string => `Régua conquistada: ${nome}`;

export const TELA_CHEIA = {
  entrar: 'Tela cheia',
  sair: 'Sair da tela cheia',
  indisponivel: 'Tela cheia não disponível aqui',
};
