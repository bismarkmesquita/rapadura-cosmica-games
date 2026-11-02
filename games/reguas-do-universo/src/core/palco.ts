/** Canvas 2D em tela cheia: tamanho, céu estrelado do fundo e cliques ou toques na cena. */
import { $ } from '@shared/ui/dom';
import { TAU } from '@shared/math/format';
import type { Ponto } from '../types';

export const canvas = $<HTMLCanvasElement>('c');
const ctx = canvas.getContext('2d')!;
export const tela = { W: innerWidth, H: innerHeight };

const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const caixaControles = $('controles');

const visivel = (el: HTMLElement): boolean => !el.hidden && !el.classList.contains('vazio');

/** Altura da tela acima da caixa de controles da fase: as cenas cabem aí, sem ficar embaixo dos controles. */
export function alturaLivre(): number {
  if (!visivel(caixaControles)) return tela.H;
  return Math.min(tela.H, caixaControles.getBoundingClientRect().top - 8);
}

const baseDe = (id: string): number => {
  const el = $(id);
  return visivel(el) ? el.getBoundingClientRect().bottom : 0;
};

/** Onde a cena pode começar, abaixo das caixas do topo: missões à esquerda, botões e painel à direita. */
export function topoLivre(): { esquerda: number; direita: number } {
  return { esquerda: baseDe('missoes') + 8, direita: Math.max(baseDe('topoBtns'), baseDe('painel')) + 8 };
}

export function ajustaTela(): void {
  const d = Math.min(2, devicePixelRatio || 1);
  tela.W = innerWidth;
  tela.H = innerHeight;
  canvas.width = Math.round(tela.W * d);
  canvas.height = Math.round(tela.H * d);
}

const ESTRELAS = Array.from({ length: 260 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.4 + Math.random() ** 3 * 1.3,
  fase: Math.random() * TAU,
}));

/** Começa o quadro: limpa a tela e desenha o céu estrelado. `t` em segundos. */
export function comecaQuadro(t: number): CanvasRenderingContext2D {
  const d = canvas.width / tela.W;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  const { W, H } = tela;
  const g = ctx.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, Math.max(W, H) * 0.8);
  g.addColorStop(0, '#151233');
  g.addColorStop(1, '#0e0b16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#dfe5ff';
  for (const e of ESTRELAS) {
    ctx.globalAlpha = reduzMovimento ? 0.6 : 0.45 + 0.3 * Math.sin(t * 1.3 + e.fase);
    ctx.beginPath();
    ctx.arc(e.x * W, e.y * H, e.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return ctx;
}

interface Manipuladores {
  /** Devolve true se o clique pegou algo para arrastar. */
  aperta(p: Ponto): boolean;
  arrasta(p: Ponto): void;
  solta(): void;
  /** Mouse passando sobre a cena sem arrastar. */
  passa(p: Ponto): void;
}

/** Mouse, caneta e dedo pelos eventos de ponteiro: um arraste por vez. */
export function iniciaPonteiro(m: Manipuladores): void {
  let arrastando: number | null = null;
  const ponto = (e: PointerEvent): Ponto => ({ x: e.clientX, y: e.clientY });
  canvas.addEventListener('pointerdown', (e) => {
    if (arrastando !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (!m.aperta(ponto(e))) return;
    e.preventDefault();
    arrastando = e.pointerId;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId === arrastando) m.arrasta(ponto(e));
    else if (arrastando === null && e.pointerType === 'mouse') m.passa(ponto(e));
  });
  const fim = (e: PointerEvent): void => {
    if (e.pointerId !== arrastando) return;
    arrastando = null;
    m.solta();
  };
  canvas.addEventListener('pointerup', fim);
  canvas.addEventListener('pointercancel', fim);
}
