import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { magnitudeCefeida } from '@shared/physics/distancias';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { curvaDeLuz, estrela } from '../scene/desenho';
import { pergunta, perto, terminaFase } from './util';
import * as T from '../content/velasPadrao';

type Galaxia = (typeof T.GALAXIAS)[number];

/** Dias de jogo por segundo: a Cefeida de 30 dias pisca a cada 7,5 s, dá tempo de marcar. */
const DIAS_POR_SEGUNDO = 4;
/** Erro aceito na medida do período (fração). */
const TOLERANCIA = 0.25;
/** Dias mostrados na curva de brilho. */
const JANELA_DIAS = 40;
/** Gráfico período × brilho real: períodos de 1 a 100 dias (log) e M de −1,5 a −7. */
const P_LOG_MAX = 2;
const M_FRACO = -1.5;
const M_FORTE = -7;

export class FaseVelasPadrao implements Fase {
  readonly id = 7;
  readonly nome = T.NOME_FASE;
  /** Tempo em dias. */
  private t = 0;
  private sel: Galaxia = T.GALAXIAS[0];
  private marca: number | null = null;
  private medido: Record<string, boolean> = {};
  private vistas: Ponto[] = [];
  private rv = 1;

  init(): void {
    this.t = 0;
    this.sel = T.GALAXIAS[0];
    this.marca = null;
    this.medido = {};
    missoes.define(this.nome, [
      { id: 'periodos', texto: T.MISSOES.periodos },
      { id: 'qual', texto: T.MISSOES.qual },
    ]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  private montaControles(): void {
    controles(
      `<div class="opcoes">` +
        T.GALAXIAS.map(
          (g) =>
            `<button class="btn${g === this.sel ? ' sel' : ''}" data-galaxia="${g.id}" aria-pressed="${g === this.sel}">${g.nome}</button>`,
        ).join('') +
        `<button class="btn prim" data-marcar>${this.marca === null ? T.ROTULOS.cronometro : T.ROTULOS.medindo}</button></div>`,
      (caixa) => {
        caixa.querySelectorAll<HTMLButtonElement>('[data-galaxia]').forEach((b) => {
          b.onclick = () => this.seleciona(T.GALAXIAS.find((g) => g.id === b.dataset.galaxia) ?? this.sel);
        });
        const marcar = caixa.querySelector<HTMLButtonElement>('[data-marcar]');
        if (marcar) marcar.onclick = () => this.marcar();
      },
    );
  }

  private seleciona(g: Galaxia): void {
    if (g === this.sel) return;
    this.sel = g;
    this.marca = null;
    this.montaControles();
  }

  /** Primeiro toque começa a contar; o segundo, no máximo seguinte, fecha um ciclo. */
  private marcar(): void {
    if (this.marca === null) {
      this.marca = this.t;
      toast.mostra(T.AVISOS.medindo, 3);
    } else {
      const dias = this.t - this.marca;
      this.marca = null;
      if (Math.abs(dias - this.sel.periodo) / this.sel.periodo > TOLERANCIA) toast.mostra(T.AVISOS.errado, 4);
      else {
        this.medido[this.sel.id] = true;
        toast.mostra(T.AVISOS.medido(this.sel.nome, this.sel.periodo), 4);
        const outra = T.GALAXIAS.find((g) => !this.medido[g.id]);
        if (outra) this.sel = outra;
      }
    }
    if (missoes.atual()?.id === 'periodos') this.montaControles();
  }

  private brilho(g: Galaxia, t = this.t): number {
    // As duas começam em pontos diferentes do ciclo, para não piscarem juntas.
    return curvaDeLuz(t / g.periodo + (g.id === 'a' ? 0.4 : 0.7));
  }

  update(dt: number): void {
    this.t += dt * DIAS_POR_SEGUNDO;
    if (missoes.atual()?.id !== 'periodos' || T.GALAXIAS.some((g) => !this.medido[g.id])) return;
    missoes.conclui('periodos');
    pergunta(T.PERGUNTA, () => {
      missoes.conclui('qual');
      terminaFase(this.id, T.fim, T.DESAFIO);
    });
  }

  aperta(p: Ponto): boolean {
    const i = this.vistas.findIndex((v) => perto(p.x, p.y, v.x, v.y, this.rv));
    if (i >= 0 && missoes.atual()?.id === 'periodos') this.seleciona(T.GALAXIAS[i]);
    return false;
  }

  cursor(p: Ponto): string {
    return this.vistas.some((v) => perto(p.x, p.y, v.x, v.y, this.rv)) ? 'pointer' : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const base = h - 24;
    const alto = base - topo;
    this.rv = Math.max(28, Math.min(w * 0.1, alto * 0.24));
    const cy = topo + 20 + this.rv;
    this.vistas = T.GALAXIAS.map((g, i) => {
      const x = w * (0.14 + 0.24 * i);
      this.desenhaGalaxia(c, g, x, cy);
      return { x, y: cy };
    });
    const yCurva = cy + this.rv + 80;
    if (base - yCurva >= 30) this.desenhaCurva(c, w * 0.04, yCurva, w * 0.44, base - yCurva);
    this.desenhaGrafico(c, w * 0.58, topo + 24, w * 0.37, alto - 60);
  }

  private desenhaGalaxia(c: CanvasRenderingContext2D, g: Galaxia, x: number, y: number): void {
    const rv = this.rv;
    c.save();
    c.beginPath();
    c.arc(x, y, rv, 0, TAU);
    c.fillStyle = '#05060f';
    c.fill();
    c.clip();
    const nucleo = c.createRadialGradient(x, y, 0, x, y, rv * 0.8);
    nucleo.addColorStop(0, 'rgba(255,236,200,.55)');
    nucleo.addColorStop(1, 'rgba(139,124,246,0)');
    c.fillStyle = nucleo;
    c.beginPath();
    c.ellipse(x, y, rv * 0.8, rv * 0.4, -0.4, 0, TAU);
    c.fill();
    // Cefeida: o tamanho base sai da magnitude aparente; a pulsação vem por cima.
    const r = (2.5 + 1.5 * (22 - g.m)) * (0.65 + 0.7 * this.brilho(g));
    estrela(c, x + rv * 0.45, y - rv * 0.25, r, '#fff1c4');
    c.restore();
    c.strokeStyle = g === this.sel ? COR.sol : COR.muted;
    c.lineWidth = g === this.sel ? 3 : 1.5;
    c.beginPath();
    c.arc(x, y, rv, 0, TAU);
    c.stroke();
    rotulo(c, g.nome, x, y - rv - 8, g === this.sel ? COR.sol : COR.ink, 'center', 13);
    rotulo(c, T.ROTULOS.periodo(this.medido[g.id] ? g.periodo : null), x, y + rv + 18, COR.ink, 'center', 12);
    const largura = rv * 1.6 * 10 ** (-0.4 * (g.m - 20.5));
    c.fillStyle = 'rgba(255,241,196,.75)';
    c.fillRect(x - rv * 0.8, y + rv + 28, Math.min(largura, rv * 1.8), 6);
    rotulo(
      c,
      estado.avancado ? `${T.ROTULOS.brilhoAqui} · ${T.ROTULOS.m(g.m)}` : T.ROTULOS.brilhoAqui,
      x,
      y + rv + 48,
      COR.muted,
      'center',
      11,
    );
  }

  /** Curva de brilho da galáxia escolhida nos últimos dias, para achar os máximos. */
  private desenhaCurva(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    c.strokeStyle = 'rgba(255,255,255,.12)';
    c.lineWidth = 1;
    c.strokeRect(x, y, w, h);
    for (let d = 0; d <= JANELA_DIAS; d += 5) {
      const px = x + w - (d / JANELA_DIAS) * w;
      c.beginPath();
      c.moveTo(px, y + h);
      c.lineTo(px, y + h - 4);
      c.stroke();
    }
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.beginPath();
    for (let i = 0; i <= 200; i++) {
      const d = (i / 200) * JANELA_DIAS;
      const px = x + w - (d / JANELA_DIAS) * w;
      const py = y + h - 4 - this.brilho(this.sel, this.t - d) * (h - 10);
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.stroke();
    if (this.marca !== null) {
      const px = x + w - ((this.t - this.marca) / JANELA_DIAS) * w;
      if (px > x) {
        c.strokeStyle = COR.orbita;
        c.beginPath();
        c.moveTo(px, y);
        c.lineTo(px, y + h);
        c.stroke();
      }
    }
    rotulo(c, T.ROTULOS.curva(this.sel.nome), x, y - 6, COR.muted, 'left', 11);
  }

  private desenhaGrafico(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    const px = (P: number): number => x + (Math.log10(P) / P_LOG_MAX) * w;
    const py = (M: number): number => y + ((M - M_FRACO) / (M_FORTE - M_FRACO)) * h;
    rotulo(c, T.ROTULOS.grafico, x + w / 2, y - 10, COR.ink, 'center', 13);
    c.strokeStyle = COR.muted;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y + h);
    c.lineTo(x + w, y + h);
    c.stroke();
    for (const P of [1, 3, 10, 30, 100])
      rotulo(c, T.ROTULOS.dias(P), px(P), y + h + 16, COR.muted, 'center', 11);
    rotulo(c, T.ROTULOS.eixoPeriodo, x + w / 2, y + h + 32, COR.muted, 'center', 11);
    rotulo(c, T.ROTULOS.maisPotente, x + 6, y + 12, COR.muted, 'left', 11);
    if (estado.avancado)
      for (let M = -2; M >= M_FORTE; M--) rotulo(c, fmt(M, 0), x - 6, py(M) + 4, COR.muted, 'right', 10);

    c.strokeStyle = COR.orbita;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(px(1), py(magnitudeCefeida(1)));
    c.lineTo(px(100), py(magnitudeCefeida(100)));
    c.stroke();
    for (const g of T.GALAXIAS) {
      if (!this.medido[g.id]) continue;
      const gx = px(g.periodo);
      const gy = py(g.M);
      c.setLineDash([4, 4]);
      c.strokeStyle = 'rgba(255,181,71,.6)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(gx, y + h);
      c.lineTo(gx, gy);
      c.lineTo(x, gy);
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = COR.sol;
      c.beginPath();
      c.arc(gx, gy, 6, 0, TAU);
      c.fill();
      rotulo(
        c,
        estado.avancado ? `${g.nome} · ${T.ROTULOS.M(g.M)}` : g.nome,
        gx + 10,
        gy + 4,
        COR.sol,
        'left',
        12,
      );
    }
  }

  /** Os números ficam na cena (m embaixo de cada galáxia, M no gráfico): o painel fica vazio. */
  hud(): void {
    painel('');
  }
}
