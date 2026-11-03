import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { escalaDePlaca, resolucaoRayleigh } from '@shared/physics/telescopio';
import type { Fase } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { telescopio } from '../core/telescopio';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrelaBorrada } from '../scene/desenho';
import { Firmeza, terminaFase } from './util';
import * as T from '../content/resolucao';

/** Metade do campo mostrado, em segundos de arco: a dupla de 1,2″ fica bem no meio. */
const MEIO_CAMPO = 3;
/** O disco de difração aproximado por uma gaussiana: σ ≈ 0,45 do raio do primeiro anel escuro. */
const SIGMA = 0.45;
/** Subamostras por lado em cada pixel da câmera, para somar a luz que cai nele. */
const SUB = 4;

export class FaseResolucao implements Fase {
  readonly id = 5;
  readonly nome = T.NOME_FASE;
  private abertura = T.ABERTURAS[0];
  private camera = T.CAMERAS[0];
  private firmeza = new Firmeza(0.6);

  init(): void {
    this.abertura = T.ABERTURAS[0];
    this.camera = T.CAMERAS[0];
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'separar', texto: T.MISSOES.separar },
      { id: 'camera', texto: T.MISSOES.camera },
    ]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  private resolucao(): number {
    return resolucaoRayleigh(this.abertura);
  }

  private separada(): boolean {
    return this.resolucao() <= T.SEPARACAO;
  }

  /** Tamanho do pixel da câmera no céu (″), pela escala de placa do telescópio. */
  private pixelSeg(): number | null {
    const p = this.camera.pixelUm;
    return p === null ? null : p * 1e-3 * escalaDePlaca(telescopio.focalMm);
  }

  private montaControles(): void {
    const botoes = <V>(
      lista: V[],
      atual: V,
      nome: (v: V) => string,
      chave: string,
      valor: (v: V) => string,
    ): string =>
      `<div class="opcoes">` +
      lista
        .map(
          (v) =>
            `<button class="btn${v === atual ? ' sel' : ''}" data-${chave}="${valor(v)}" aria-pressed="${v === atual}">${nome(v)}</button>`,
        )
        .join('') +
      `</div>`;
    controles(
      botoes(T.ABERTURAS, this.abertura, T.ROTULOS.mm, 'abertura', String) +
        botoes(
          T.CAMERAS,
          this.camera,
          (c) => c.nome,
          'camera',
          (c) => c.id,
        ),
      (caixa) => {
        caixa.querySelectorAll<HTMLButtonElement>('[data-abertura]').forEach((b) => {
          b.onclick = () => {
            this.abertura = Number(b.dataset.abertura);
            this.montaControles();
            if (missoes.atual()?.id === 'separar' && !this.separada()) toast.mostra(T.AVISOS.junta, 3);
          };
        });
        caixa.querySelectorAll<HTMLButtonElement>('[data-camera]').forEach((b) => {
          b.onclick = () => {
            this.camera = T.CAMERAS.find((c) => c.id === b.dataset.camera) ?? T.CAMERAS[0];
            this.montaControles();
            const p = this.pixelSeg();
            if (missoes.atual()?.id === 'camera' && p !== null && T.SEPARACAO / p <= 1)
              toast.mostra(T.AVISOS.pixelGrande, 3);
          };
        });
      },
    );
  }

  update(dt: number): void {
    const m = missoes.atual()?.id;
    if (!m) return;
    const p = this.pixelSeg();
    const ok = m === 'separar' ? this.separada() : this.separada() && p !== null && T.SEPARACAO / p > 1;
    if (!this.firmeza.conta(dt, ok) || !missoes.conclui(m)) return;
    this.firmeza.zera();
    toast.mostra(T.AVISOS[m as keyof typeof T.MISSOES], 5);
    if (!missoes.atual()) terminaFase(this.id, T.fim, T.DESAFIO);
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const alto = h - topo;
    const r = Math.min(alto * 0.42, w * 0.26);
    const x = w / 2;
    const y = topo + alto / 2;
    const k = r / MEIO_CAMPO;
    const meia = (T.SEPARACAO / 2) * k;
    const raio = this.resolucao() * k;
    const p = this.pixelSeg();

    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#04050c';
    c.fill();
    c.clip();
    if (p === null) {
      estrelaBorrada(c, x - meia, y, raio);
      estrelaBorrada(c, x + meia, y, raio);
    } else this.desenhaPixels(c, x, y, r, k, p);
    c.restore();
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.vista, x, y - r - 10, COR.ink, 'center', 13);
    const legenda =
      p === null
        ? this.separada()
          ? T.ROTULOS.separada
          : T.ROTULOS.junta
        : T.ROTULOS.pixels(T.SEPARACAO / p);
    rotulo(c, legenda, x, y + r + 20, this.separada() ? COR.ok : COR.ink, 'center', 13);
  }

  /** Modo câmera: soma a luz das duas estrelas em cada pixel e pinta o pixel com esse brilho. */
  private desenhaPixels(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    k: number,
    p: number,
  ): void {
    const lado = p * k;
    const sigma = SIGMA * this.resolucao();
    const luz = (sx: number, sy: number): number =>
      [-1, 1].reduce((soma, lado2) => {
        const dx = sx - (lado2 * T.SEPARACAO) / 2;
        return soma + Math.exp(-(dx * dx + sy * sy) / (2 * sigma * sigma));
      }, 0);
    const n = Math.ceil(r / lado) + 1;
    const valores: { px: number; py: number; v: number }[] = [];
    let max = 0;
    for (let i = -n; i < n; i++)
      for (let j = -n; j < n; j++) {
        let v = 0;
        for (let a = 0; a < SUB; a++)
          for (let b = 0; b < SUB; b++) v += luz((i + (a + 0.5) / SUB) * p, (j + (b + 0.5) / SUB) * p);
        valores.push({ px: x + i * lado, py: y + j * lado, v });
        max = Math.max(max, v);
      }
    for (const { px, py, v } of valores) {
      const brilho = Math.round(255 * Math.min(1, v / max));
      c.fillStyle = `rgb(${brilho},${brilho},${Math.min(255, brilho + 10)})`;
      c.fillRect(px, py, lado, lado);
    }
    c.strokeStyle = 'rgba(115,210,255,.25)';
    c.lineWidth = 1;
    for (let i = -n; i <= n; i++) {
      c.beginPath();
      c.moveTo(x + i * lado, y - r);
      c.lineTo(x + i * lado, y + r);
      c.moveTo(x - r, y + i * lado);
      c.lineTo(x + r, y + i * lado);
      c.stroke();
    }
  }

  hud(): void {
    let html =
      linhaHud(T.HUD.abertura, T.ROTULOS.mm(this.abertura)) +
      linhaHud(T.HUD.separacao, T.HUD.seg(T.SEPARACAO));
    if (estado.avancado) {
      const p = this.pixelSeg();
      html +=
        linhaHud(T.HUD.resolucao, T.HUD.seg(this.resolucao())) +
        linhaHud(T.HUD.escala, `${T.HUD.seg(escalaDePlaca(telescopio.focalMm))}/mm`) +
        (p === null ? '' : linhaHud(T.HUD.pixel, T.HUD.seg(p)));
    }
    painel(html);
  }
}
