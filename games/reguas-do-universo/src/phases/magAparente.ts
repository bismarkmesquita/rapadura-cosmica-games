import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { razaoDeBrilho } from '@shared/physics/distancias';
import { LIMITE_OLHO_NU_MAG } from '@shared/physics/constantes';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrela, raioPorMagnitude } from '../scene/desenho';
import { pergunta, perto, terminaFase } from './util';
import * as T from '../content/magAparente';

/** Trecho da escala na régua: de Vênus à estrela mais fraca a olho nu, com folga. */
const MAG_MIN = -5;
const MAG_MAX = 7;
/** Posição inicial de cada astro no céu (na ordem de T.ASTROS), em fração da área do céu: não segue o brilho. */
const INICIO: [number, number][] = [
  [0.62, 0.62],
  [0.26, 0.7],
  [0.86, 0.28],
  [0.38, 0.22],
  [0.1, 0.25],
  [0.42, 0.82],
];
/** Distância (px) do centro de um lugar da régua em que o astro solto "encaixa". */
const ENCAIXE = 34;

interface Peca {
  id: string;
  nome: string;
  mag: number;
  /** Posição no céu, em fração da área do céu. */
  fx: number;
  fy: number;
  colocada: boolean;
}

export class FaseMagAparente implements Fase {
  readonly id = 4;
  readonly nome = T.NOME_FASE;
  private pecas: Peca[] = [];
  private arrastando: Peca | null = null;
  /** Posição do astro arrastado, em px. */
  private mao: Ponto = { x: 0, y: 0 };
  private ultima: Peca | null = null;
  private cena = { ceu: { x: 0, y: 0, w: 1, h: 1 }, xa: 0, xb: 1, yr: 0 };

  init(): void {
    this.pecas = T.ASTROS.map((a, i) => ({ ...a, fx: INICIO[i][0], fy: INICIO[i][1], colocada: false }));
    this.arrastando = this.ultima = null;
    missoes.define(this.nome, [
      { id: 'regua', texto: T.MISSOES.regua },
      { id: 'pergunta', texto: T.MISSOES.pergunta },
    ]);
    controles('');
    cards.enfileira(T.intro);
  }

  update(): void {
    if (missoes.atual()?.id !== 'regua' || this.pecas.some((p) => !p.colocada)) return;
    missoes.conclui('regua');
    toast.mostra(T.AVISOS.regua, 4);
    pergunta(T.PERGUNTA, () => {
      missoes.conclui('pergunta');
      terminaFase(this.id, T.fim, T.DESAFIO);
    });
  }

  private xDaMag(m: number): number {
    const { xa, xb } = this.cena;
    return xa + ((m - MAG_MIN) / (MAG_MAX - MAG_MIN)) * (xb - xa);
  }

  private lugar(p: Peca): Ponto {
    return { x: this.xDaMag(p.mag), y: this.cena.yr - 30 };
  }

  private posicao(p: Peca): Ponto {
    if (p === this.arrastando) return this.mao;
    if (p.colocada) return this.lugar(p);
    const { ceu } = this.cena;
    return { x: ceu.x + p.fx * ceu.w, y: ceu.y + p.fy * ceu.h };
  }

  aperta(p: Ponto): boolean {
    const peca = this.pecas.find((x) => {
      if (x.colocada) return false;
      const q = this.posicao(x);
      return perto(p.x, p.y, q.x, q.y, raioPorMagnitude(x.mag) + 16);
    });
    if (!peca) return false;
    this.arrastando = peca;
    this.mao = { ...p };
    return true;
  }

  arrasta(p: Ponto): void {
    this.mao = { ...p };
  }

  solta(): void {
    const peca = this.arrastando;
    if (!peca) return;
    this.arrastando = null;
    const alvo = this.pecas.find(
      (x) => !x.colocada && perto(this.mao.x, this.mao.y, this.lugar(x).x, this.lugar(x).y, ENCAIXE),
    );
    if (alvo === peca) {
      peca.colocada = true;
      this.ultima = peca;
      toast.mostra(T.AVISOS.certo, 1.5);
      return;
    }
    if (alvo) {
      toast.mostra(T.AVISOS.errado, 4);
      return;
    }
    // Solto no céu: fica onde o aluno deixou.
    const { ceu } = this.cena;
    peca.fx = limita((this.mao.x - ceu.x) / ceu.w, 0, 1);
    peca.fy = limita((this.mao.y - ceu.y) / ceu.h, 0, 1);
  }

  cursor(p: Ponto): string {
    if (this.arrastando) return 'grabbing';
    return this.pecas.some((x) => !x.colocada && perto(p.x, p.y, this.posicao(x).x, this.posicao(x).y, 24))
      ? 'grab'
      : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const yr = h - 46;
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    this.cena = {
      ceu: { x: w * 0.12, y: topo + 24, w: w * 0.76, h: Math.max(40, yr - 110 - topo - 24) },
      xa: w * 0.08,
      xb: w * 0.92,
      yr,
    };
    const { xa, xb } = this.cena;

    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(xa, yr);
    c.lineTo(xb, yr);
    c.stroke();
    for (let m = MAG_MIN; m <= MAG_MAX; m++) {
      const x = this.xDaMag(m);
      c.beginPath();
      c.moveTo(x, yr - 6);
      c.lineTo(x, yr + 6);
      c.stroke();
      rotulo(c, fmt(m, 0), x, yr + 20, COR.muted, 'center', 12);
    }
    rotulo(c, T.ROTULOS.maisBrilhante, xa, yr + 38, COR.sol, 'left', 12);
    rotulo(c, T.ROTULOS.regua, (xa + xb) / 2, yr + 38, COR.muted, 'center', 12);
    rotulo(c, T.ROTULOS.maisFraca, xb, yr + 38, COR.muted, 'right', 12);

    for (const p of this.pecas) {
      if (p.colocada) continue;
      const q = this.lugar(p);
      c.setLineDash([4, 4]);
      c.strokeStyle = 'rgba(255,181,71,.6)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(q.x, q.y, 14, 0, TAU);
      c.stroke();
      c.setLineDash([]);
    }
    rotulo(c, T.ROTULOS.ceu, w / 2, topo + 12, COR.muted, 'center', 12);
    // O astro arrastado por último, para ficar por cima.
    const ordem = [...this.pecas].sort(
      (a, b) => Number(a === this.arrastando) - Number(b === this.arrastando),
    );
    for (const p of ordem) {
      const q = this.posicao(p);
      const r = raioPorMagnitude(p.mag);
      estrela(c, q.x, q.y, r, p.id === 'venus' ? '#fff6dc' : '#eef2ff');
      rotulo(
        c,
        p.nome,
        q.x,
        p.colocada ? q.y - r - 10 : q.y + r + 16,
        p.colocada ? COR.ok : COR.ink,
        'center',
        12,
      );
    }
  }

  hud(): void {
    const n = this.pecas.filter((p) => p.colocada).length;
    let html = linhaHud(T.HUD.colocados, T.HUD.de(n, this.pecas.length));
    const u = this.ultima;
    if (estado.avancado && u && u.mag < LIMITE_OLHO_NU_MAG)
      html += linhaHud(T.HUD.vezes(u.nome), fmt(razaoDeBrilho(u.mag, LIMITE_OLHO_NU_MAG), 0));
    painel(html);
  }
}
