import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { aumento, aumentoMaximoUtil, pupilaDeSaida, razaoFocal } from '@shared/physics/telescopio';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { telescopio } from '../core/telescopio';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrela, saturno } from '../scene/desenho';
import { Firmeza, perto, terminaFase } from './util';
import * as T from '../content/ampliacao';

/** Metade do campo aparente da ocular, em graus (oculares comuns têm uns 50° de campo). */
const CAMPO_APARENTE = 25;
/** O desenho da ocular é 10 vezes maior que a vista real, para Saturno caber na tela; igual para todas. */
const ESCALA_DESENHO = 10;
/** A partir deste aumento os anéis aparecem separados do disco. */
const AUMENTO_ANEIS = 90;
/** Pupila de saída (mm) em que a imagem já tem o brilho todo; abaixo dela, escurece. */
const PUPILA_CHEIA = 2;
/** Pixels que o dedo pode andar e ainda contar como toque. */
const TOQUE_PX = 6;

const FUNDO = Array.from({ length: 30 }, () => {
  const a = Math.random() * TAU;
  const d = Math.sqrt(Math.random()) * 0.92;
  return { x: d * Math.cos(a), y: d * Math.sin(a), r: 0.6 + Math.random() * 0.8 };
});

interface Layout {
  focalizador: Ponto;
  bandeja: Ponto[];
  ocular: { x: number; y: number; r: number };
}

export class FaseAmpliacao implements Fase {
  readonly id = 3;
  readonly nome = T.NOME_FASE;
  private instalada: number | null = null;
  private arrasto: { ocular: number; p: Ponto; inicio: Ponto } | null = null;
  private layout: Layout | null = null;
  private firmeza = new Firmeza(0.8);

  init(): void {
    this.instalada = null;
    this.arrasto = null;
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'pequeno', texto: T.MISSOES.pequeno },
      { id: 'aneis', texto: T.MISSOES.aneis },
      { id: 'limite', texto: T.MISSOES.limite },
    ]);
    controles('');
    cards.enfileira(T.intro);
  }

  private aumentoAtual(): number | null {
    return this.instalada === null ? null : aumento(telescopio.focalMm, this.instalada);
  }

  private instala(f: number): void {
    this.instalada = f;
    const A = aumento(telescopio.focalMm, f);
    const m = missoes.atual()?.id;
    if (m === 'aneis' && A < AUMENTO_ANEIS) toast.mostra(T.AVISOS.semAneis, 3);
    if (m === 'aneis' && A > aumentoMaximoUtil(telescopio.aberturaMm)) toast.mostra(T.AVISOS.borrado, 3);
  }

  update(dt: number): void {
    const m = missoes.atual()?.id;
    const A = this.aumentoAtual();
    if (!m || A === null) return;
    const ok =
      m === 'pequeno'
        ? this.instalada === 25
        : m === 'aneis'
          ? A >= AUMENTO_ANEIS && A <= aumentoMaximoUtil(telescopio.aberturaMm)
          : this.instalada === 2;
    if (!this.firmeza.conta(dt, ok) || !missoes.conclui(m)) return;
    this.firmeza.zera();
    toast.mostra(T.AVISOS[m as keyof typeof T.MISSOES], 5);
    if (!missoes.atual()) terminaFase(this.id, T.fim, T.DESAFIO);
  }

  private ocularEm(p: Ponto): number | null {
    const l = this.layout;
    if (!l) return null;
    const i = l.bandeja.findIndex((q) => perto(p.x, p.y, q.x, q.y - 12, 26));
    return i < 0 ? null : T.OCULARES[i];
  }

  aperta(p: Ponto): boolean {
    const f = this.ocularEm(p);
    if (f === null) return false;
    this.arrasto = { ocular: f, p: { ...p }, inicio: { ...p } };
    return true;
  }

  arrasta(p: Ponto): void {
    if (this.arrasto) this.arrasto.p = { ...p };
  }

  solta(): void {
    const a = this.arrasto;
    this.arrasto = null;
    if (!a || !this.layout) return;
    const tocou = Math.hypot(a.p.x - a.inicio.x, a.p.y - a.inicio.y) < TOQUE_PX;
    const f = this.layout.focalizador;
    if (tocou || perto(a.p.x, a.p.y, f.x, f.y, 60)) this.instala(a.ocular);
  }

  cursor(p: Ponto): string {
    if (this.arrasto) return 'grabbing';
    return this.ocularEm(p) === null ? 'default' : 'grab';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const alto = h - topo;
    const x1 = w * 0.06;
    const x2 = w * 0.48;
    const yt = topo + alto * 0.3;
    const rt = limita(alto * 0.08, 14, 30);
    const xf = x1 + (x2 - x1) * 0.8;
    const yb = topo + alto * 0.78;
    const r = Math.min(alto * 0.4, w * 0.21);
    this.layout = {
      focalizador: { x: xf, y: yt - rt - 16 },
      bandeja: T.OCULARES.map((_, i) => ({ x: x1 + ((i + 0.5) / T.OCULARES.length) * (x2 - x1), y: yb })),
      ocular: { x: w * 0.75, y: topo + alto / 2, r },
    };

    // Telescópio de lado, com o focalizador em cima, perto da frente (newtoniano).
    c.fillStyle = '#edebf5';
    c.beginPath();
    c.roundRect(x1, yt - rt, x2 - x1, rt * 2, 6);
    c.fill();
    c.fillStyle = '#23202f';
    c.fillRect(xf - 9, yt - rt - 14, 18, 14);
    rotulo(c, T.ROTULOS.focalizador, xf, yt + rt + 18, COR.muted, 'center', 11);
    if (this.instalada !== null && this.arrasto?.ocular !== this.instalada)
      this.desenhaOcularPeca(c, xf, yt - rt - 14, this.instalada, true);

    c.strokeStyle = COR.muted;
    c.lineWidth = 1.5;
    c.strokeRect(x1 - 6, yb - 46, x2 - x1 + 12, 70);
    rotulo(c, T.ROTULOS.caixa, x1, yb - 54, COR.muted, 'left', 12);
    rotulo(c, T.ROTULOS.arraste, x2, yb - 54, COR.sol, 'right', 11);
    this.layout.bandeja.forEach((q, i) => {
      const f = T.OCULARES[i];
      if (f !== this.instalada && f !== this.arrasto?.ocular) this.desenhaOcularPeca(c, q.x, q.y, f, false);
      rotulo(c, T.ROTULOS.mm(f), q.x, q.y + 16, COR.ink, 'center', 11);
    });
    if (this.arrasto)
      this.desenhaOcularPeca(c, this.arrasto.p.x, this.arrasto.p.y, this.arrasto.ocular, false);

    this.desenhaVista(c);
  }

  /** Ocular como um cilindrinho; a de número menor (mais aumento) tem a lente menor. `y` é a base. */
  private desenhaOcularPeca(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    f: number,
    noTelescopio: boolean,
  ): void {
    const largura = 12 + f * 0.25;
    c.fillStyle = noTelescopio ? '#3b3550' : '#2c2838';
    c.strokeStyle = COR.muted;
    c.lineWidth = 1.2;
    c.beginPath();
    c.roundRect(x - largura / 2, y - 28, largura, 28, 3);
    c.fill();
    c.stroke();
    c.fillStyle = '#9fd8ff';
    c.fillRect(x - largura / 2 + 2, y - 28, largura - 4, 3);
  }

  /** A vista na ocular: Saturno no tamanho do aumento, mais escuro e borrado se passar do útil. */
  private desenhaVista(c: CanvasRenderingContext2D): void {
    const o = this.layout?.ocular;
    if (!o) return;
    const { x, y, r } = o;
    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#05060f';
    c.fill();
    c.clip();
    const A = this.aumentoAtual();
    if (A === null) rotulo(c, T.ROTULOS.semOcular, x, y + 4, COR.muted, 'center', 13);
    else {
      for (const f of FUNDO) estrela(c, x + f.x * r, y + f.y * r, f.r, '#dfe5ff');
      const D = telescopio.aberturaMm;
      const raioAneis = (((T.ANEIS_SEG / 2) * A) / 3600 / CAMPO_APARENTE) * r * ESCALA_DESENHO;
      const pupila = Math.min(PUPILA_CHEIA, pupilaDeSaida(D, A));
      const brilho = 0.3 + 0.7 * Math.sqrt(pupila / PUPILA_CHEIA);
      const borrao = Math.max(0, (A - aumentoMaximoUtil(D)) / aumentoMaximoUtil(D)) * 14;
      // Borrão feito com cópias deslocadas: funciona em qualquer navegador (o filtro do canvas não).
      const copias = borrao > 0.5 ? 10 : 1;
      for (let k = 0; k < copias; k++) {
        const a = (k / copias) * TAU;
        c.globalAlpha = brilho / (copias > 1 ? 4 : 1);
        saturno(c, x + Math.cos(a) * borrao, y + Math.sin(a) * borrao, Math.max(1, raioAneis / 2.3), -0.25);
      }
      c.globalAlpha = 1;
    }
    c.restore();
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(
      c,
      A === null ? T.ROTULOS.ocular : `${T.ROTULOS.ocular} · ${T.ROTULOS.vezes(A)}`,
      x,
      y - r - 10,
      COR.ink,
      'center',
      13,
    );
    rotulo(c, T.ROTULOS.foraDeEscala, x, y + r + 18, COR.muted, 'center', 11);
  }

  hud(): void {
    const A = this.aumentoAtual();
    const D = telescopio.aberturaMm;
    let html =
      linhaHud(T.HUD.ocular, this.instalada === null ? '—' : T.ROTULOS.mm(this.instalada)) +
      linhaHud(T.HUD.aumento, A === null ? '—' : T.ROTULOS.vezes(A));
    if (estado.avancado)
      html +=
        linhaHud(T.HUD.razao, `f/${fmt(razaoFocal(telescopio.focalMm, D), 0)}`) +
        linhaHud(T.HUD.pupila, A === null ? '—' : `${fmt(pupilaDeSaida(D, A), 1)} mm`) +
        linhaHud(T.HUD.maximo, T.ROTULOS.vezes(aumentoMaximoUtil(D)));
    painel(html);
  }
}
