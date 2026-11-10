/** Textos gerais do jogo, fora das fases. */
import { porDispositivo } from '@shared/ui/toque';

/** Fases no menu, na ordem da aula. A Oficina monta o telescópio; o Observatório usa. */
export const FASES_MENU: { id: number; area: string; titulo: string; resumo: string }[] = [
  { id: 1, area: 'Oficina', titulo: 'Arranjos ópticos', resumo: 'Lentes e espelhos' },
  { id: 2, area: 'Oficina', titulo: 'Montagens', resumo: 'Seguindo as estrelas' },
  { id: 3, area: 'Observatório', titulo: 'Ampliação', resumo: 'Oculares e razão focal' },
  { id: 4, area: 'Observatório', titulo: 'Magnitude limite', resumo: 'Juntando luz' },
  { id: 5, area: 'Observatório', titulo: 'Resolução', resumo: 'Estrelas duplas e câmeras' },
  { id: 6, area: 'Observatório', titulo: 'Atmosfera', resumo: 'O seeing' },
];

export const EM_BREVE = 'Em breve';

/** A missão final no menu: vem depois da última fase. */
export const MISSAO_MENU = { eyebrow: 'Final', titulo: 'Missão final', resumo: 'Monte o seu telescópio' };

export const AVANCADO = {
  rotulo: 'Avançado',
  /** Título do bloco de fórmulas nos slides. */
  bloco: 'Avançado',
  ligado: 'Modo Avançado ligado: fórmulas e números exatos',
  desligado: 'Modo Avançado desligado',
};

export const BOTOES = {
  comecar: 'Começar',
  proxima: (n: number): string => (n > FASES_MENU.length ? 'Ir para a missão final' : `Ir para a fase ${n}`),
  menu: 'Voltar ao menu',
  pausa: porDispositivo('Pausa (Esc)', 'II'),
};

export const faseConcluida = (nome: string): string => `Fase concluída: ${nome}`;

export const TELA_CHEIA = {
  entrar: 'Tela cheia',
  sair: 'Sair da tela cheia',
  indisponivel: 'Tela cheia não disponível aqui',
};

export const SEM_3D = 'Este navegador não liberou os gráficos 3D. Tente no Chrome ou no Edge atualizados.';
