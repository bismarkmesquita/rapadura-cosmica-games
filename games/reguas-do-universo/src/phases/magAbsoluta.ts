import { COR, rotulo, terrinha } from '@shared/draw/helpers';
import { fmt, limita } from '@shared/math/format';
import { magnitudeAbsoluta, magnitudeAparente } from '@shared/physics/distancias';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, missoes, painel, toast } from '../core/ui';
import { estrela, raioPorMagnitude } from '../scene/desenho';
import { pergunta, terminaFase } from './util';
import * as T from '../content/magAbsoluta';

/** Eixo de distância em log10 de parsecs: de 10⁻⁶ pc (perto do Sol, a 1 UA) a 1 000 pc (além de Rigel). */
const LOG_MIN = -6;
const LOG_MAX = 3;
/** Quão perto da linha (em log10) a estrela encaixa nos 10 pc. */
const ENCAIXE = 0.08;

interface EstrelaNaFila {
  id: string;
  nome: string;
  cor: string;
  /** Magnitude absoluta: não muda quando a estrela anda. */
  M: number;
  /** log10 da distância atual, em pc. */
  logD: number;
  naLinha: boolean;
}

export class FaseMagAbsoluta implements Fase {
  readonly id = 5;
  readonly nome = T.NOME_FASE;
  private filas: EstrelaNaFila[] = [];
  private previsao: string | null = null;
  private arrastando: EstrelaNaFila | null = null;
  private cena = { xa: 0, xb: 1, y0: 0, passo: 1 };

  init(): void {
    this.filas = T.ESTRELAS_FASE.map((e) => ({
      id: e.id,
      nome: e.nome,
      cor: e.cor,
      M: magnitudeAbsoluta(e.mag, e.distPc),
      logD: Math.log10(e.distPc),
      naLinha: false,
    }));
    this.previsao = null;
    this.arrastando = null;
    missoes.define(this.nome, [
      { id: 'previsao', texto: T.MISSOES.previsao },
      { id: 'linha', texto: T.MISSOES.linha },
    ]);
    // Na previsão toda resposta vale: o que importa é o aluno se comprometer antes de ver.
    pergunta(
      { ...T.PREVISAO, opcoes: this.filas.map((e) => ({ texto: e.nome, certa: true, resposta: '' })) },
      (i) => {
        this.previsao = this.filas[i].id;
        missoes.conclui('previsao');
      },
    );
    cards.enfileira(T.intro);
  }

  private mag(e: EstrelaNaFila): number {
    return magnitudeAparente(e.M, 10 ** e.logD);
  }

  private x(logD: number): number {
    const { xa, xb } = this.cena;
    return xa + ((logD - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (xb - xa);
  }

  private y(i: number): number {
    return this.cena.y0 + (i + 0.5) * this.cena.passo;
  }

  update(): void {
    if (missoes.atual()?.id !== 'linha' || this.filas.some((e) => !e.naLinha)) return;
    missoes.conclui('linha');
    const maisPotente = [...this.filas].sort((a, b) => a.M - b.M)[0];
    const prevista = this.filas.find((e) => e.id === this.previsao);
    toast.mostra(prevista === maisPotente ? T.AVISOS.acertou : T.AVISOS.errou(prevista?.nome ?? ''), 5);
    terminaFase(this.id, T.fim, T.DESAFIO);
  }

  aperta(p: Ponto): boolean {
    const i = this.filas.findIndex(
      (e, k) => Math.abs(p.y - this.y(k)) < this.cena.passo / 2 && Math.abs(p.x - this.x(e.logD)) < 40,
    );
    if (i < 0) return false;
    if (!this.previsao) {
      toast.mostra(T.AVISOS.prever);
      return false;
    }
    if (this.filas[i].naLinha) return false;
    this.arrastando = this.filas[i];
    return true;
  }

  arrasta(p: Ponto): void {
    const e = this.arrastando;
    if (!e) return;
    const { xa, xb } = this.cena;
    e.logD = limita(LOG_MIN + ((p.x - xa) / (xb - xa)) * (LOG_MAX - LOG_MIN), LOG_MIN + 0.3, LOG_MAX);
    if (Math.abs(e.logD - 1) < ENCAIXE) {
      e.logD = 1;
      e.naLinha = true;
      this.arrastando = null;
      toast.mostra(T.AVISOS.naLinha(e.nome), 2);
    }
  }

  solta(): void {
    this.arrastando = null;
  }

  cursor(p: Ponto): string {
    if (this.arrastando) return 'grabbing';
    const perto = this.filas.some(
      (e, k) =>
        !e.naLinha && Math.abs(p.y - this.y(k)) < this.cena.passo / 2 && Math.abs(p.x - this.x(e.logD)) < 40,
    );
    return perto ? 'grab' : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const y0 = Math.max(livre.esquerda, livre.direita) + 4;
    const yEixo = h - 40;
    this.cena = {
      xa: Math.max(70, w * 0.09),
      xb: w - Math.max(30, w * 0.04),
      y0,
      passo: (yEixo - y0 - 10) / 4,
    };
    const { xa, xb } = this.cena;

    c.strokeStyle = COR.muted;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(xa, yEixo);
    c.lineTo(xb, yEixo);
    c.stroke();
    for (let k = LOG_MIN; k <= LOG_MAX; k++) {
      const x = this.x(k);
      c.beginPath();
      c.moveTo(x, yEixo - 5);
      c.lineTo(x, yEixo + 5);
      c.stroke();
      if (k >= 0) rotulo(c, T.ROTULOS.pc(10 ** k), x, yEixo + 18, COR.muted, 'center', 11);
    }
    rotulo(
      c,
      T.ROTULOS.ua,
      this.x(Math.log10(T.ESTRELAS_FASE[0].distPc)),
      yEixo + 18,
      COR.muted,
      'center',
      11,
    );
    rotulo(c, T.ROTULOS.eixo, (xa + xb) / 2 - 40, yEixo + 34, COR.muted, 'center', 12);
    terrinha(c, xa - 26, yEixo, 9);
    rotulo(c, T.ROTULOS.terra, xa - 26, yEixo - 16, COR.ink, 'center', 12);

    const xLinha = this.x(1);
    c.setLineDash([6, 6]);
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(xLinha, y0 + 14);
    c.lineTo(xLinha, yEixo);
    c.stroke();
    c.setLineDash([]);
    rotulo(c, T.ROTULOS.linha, xLinha, y0 + 8, COR.sol, 'center', 13);

    this.filas.forEach((e, k) => {
      const y = this.y(k);
      c.strokeStyle = 'rgba(255,255,255,.07)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(xa, y);
      c.lineTo(xb, y);
      c.stroke();
      const x = this.x(e.logD);
      const r = Math.min(raioPorMagnitude(this.mag(e)), this.cena.passo * 0.42);
      estrela(c, x, y, r, e.cor);
      const legenda = estado.avancado
        ? `${e.nome} · ${e.naLinha ? 'M' : 'm'} = ${fmt(this.mag(e), 1)}`
        : e.nome;
      rotulo(c, legenda, x + r + 8, y + 4, e.naLinha ? COR.ok : COR.ink, 'left', 12);
      if (this.previsao && !e.naLinha && !this.arrastando)
        rotulo(c, `◀ ${T.ROTULOS.arraste} ▶`, x, y + r + 14, COR.sol, 'center', 11);
    });
  }

  /** Os números do Avançado ficam ao lado de cada estrela; o painel fica vazio. */
  hud(): void {
    painel('');
  }
}
