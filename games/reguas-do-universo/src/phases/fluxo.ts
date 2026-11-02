import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, limita } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { fluxo } from '@shared/physics/distancias';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { lampada } from '../scene/desenho';
import { Firmeza, perto, terminaFase } from './util';
import * as T from '../content/fluxo';

type Id = keyof typeof T.LAMPADAS;
const IDS = Object.keys(T.LAMPADAS) as Id[];

/** Distâncias possíveis no trilho, em metros. */
const D_MIN = 0.5;
const D_MAX = 4;
/** Fluxo (W/m²) em que a mancha do medidor fica quase branca: a lâmpada de 25 W a 1 m dá uns 2 W/m². */
const F_REF = 1;
/** Diferença aceita entre os dois brilhos para contar como iguais. */
const TOLERANCIA = 0.06;

export class FaseFluxo implements Fase {
  readonly id = 3;
  readonly nome = T.NOME_FASE;
  private d: Record<Id, number> = { a: 2.5, b: 1 };
  private arrastando: Id | null = null;
  private mexeu = false;
  private firmeza = new Firmeza();
  private cena = { x0: 0, px: 1, y: { a: 0, b: 0 } as Record<Id, number> };
  private faixas: Partial<Record<Id, HTMLInputElement>> = {};

  init(): void {
    this.d = { a: 2.5, b: 1 };
    this.arrastando = null;
    this.mexeu = false;
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'iguais', texto: T.MISSOES.iguais },
      { id: 'pergunta', texto: T.MISSOES.pergunta },
    ]);
    controles(
      IDS.map((id) => {
        const nome = T.LAMPADAS[id].nome;
        return (
          `<label class="faixa"><span class="longo">${T.ROTULOS.lampadaCurta(nome)}</span><span class="curto">${nome}</span>` +
          `<input type="range" min="${D_MIN * 100}" max="${D_MAX * 100}" value="${this.d[id] * 100}" data-lampada="${id}" aria-label="${T.ROTULOS.distancia(nome)}">` +
          `<output>${T.ROTULOS.metros(this.d[id])}</output></label>`
        );
      }).join(''),
      (caixa) => {
        caixa.querySelectorAll<HTMLInputElement>('[data-lampada]').forEach((faixa) => {
          const id = faixa.dataset.lampada as Id;
          this.faixas[id] = faixa;
          faixa.oninput = () => this.poe(id, Number(faixa.value) / 100);
        });
      },
    );
    cards.enfileira(T.intro);
  }

  private poe(id: Id, d: number): void {
    this.d[id] = limita(d, D_MIN, D_MAX);
    this.mexeu = true;
    const faixa = this.faixas[id];
    if (!faixa) return;
    faixa.value = String(Math.round(this.d[id] * 100));
    const saida = faixa.parentElement?.querySelector('output');
    if (saida) saida.textContent = T.ROTULOS.metros(this.d[id]);
  }

  private fluxoDe(id: Id): number {
    return fluxo(T.LAMPADAS[id].potencia, this.d[id]);
  }

  private iguais(): boolean {
    return Math.abs(this.fluxoDe('a') / this.fluxoDe('b') - 1) < TOLERANCIA;
  }

  update(dt: number): void {
    if (missoes.atual()?.id !== 'iguais') return;
    if (!this.firmeza.conta(dt, this.iguais()) || !missoes.conclui('iguais')) return;
    toast.mostra(T.AVISOS.iguais(this.d.b / this.d.a), 5);
    this.mostraPergunta();
  }

  /** A pergunta fica no lugar das barras, que já não fazem falta, para não cobrir as lâmpadas. */
  private mostraPergunta(): void {
    const P = T.PERGUNTA;
    this.faixas = {};
    controles(
      `<p class="pergunta"><b>${P.titulo}</b> ${P.texto}</p><div class="opcoes">` +
        P.opcoes.map((o, i) => `<button class="btn" data-opcao="${i}">${o.texto}</button>`).join('') +
        `</div><p class="res" data-res></p>`,
      (caixa) => {
        const res = caixa.querySelector<HTMLElement>('[data-res]');
        caixa.querySelectorAll<HTMLButtonElement>('[data-opcao]').forEach((b) => {
          const o = P.opcoes[Number(b.dataset.opcao)];
          b.onclick = () => {
            if (!o.certa) {
              if (res) res.textContent = o.resposta;
              return;
            }
            controles('');
            missoes.conclui('pergunta');
            terminaFase(this.id, T.fim, T.DESAFIO);
          };
        });
      },
    );
  }

  private xDe(id: Id): number {
    return this.cena.x0 + this.d[id] * this.cena.px;
  }

  aperta(p: Ponto): boolean {
    const { x0, px, y } = this.cena;
    const id = IDS.find(
      (i) =>
        perto(p.x, p.y, this.xDe(i), y[i], 30) || (Math.abs(p.y - y[i]) < 22 && p.x > x0 + D_MIN * px - 20),
    );
    if (!id) return false;
    this.arrastando = id;
    this.arrasta(p);
    return true;
  }

  arrasta(p: Ponto): void {
    if (this.arrastando) this.poe(this.arrastando, (p.x - this.cena.x0) / this.cena.px);
  }

  solta(): void {
    this.arrastando = null;
  }

  cursor(p: Ponto): string {
    if (this.arrastando) return 'grabbing';
    return IDS.some((i) => perto(p.x, p.y, this.xDe(i), this.cena.y[i], 30)) ? 'grab' : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const x0 = Math.max(90, w * 0.13);
    const px = (w - Math.max(70, w * 0.07) - x0) / D_MAX;
    const rl = Math.max(9, h * 0.025);
    // Trilho A logo abaixo das caixas do topo (com espaço para o nome da lâmpada); B acima das marcas de metro.
    const livre = topoLivre();
    const ya = Math.max(livre.esquerda, livre.direita) + rl * 2.4 + 22;
    const y = { a: ya, b: Math.max(ya + 60, h - rl - 52) };
    this.cena = { x0, px, y };
    const lado = Math.max(26, h * 0.07);
    const xm = x0 - lado * 1.3;

    for (const id of IDS) {
      const xl = this.xDe(id);
      const brilho = 1 - Math.exp(-this.fluxoDe(id) / F_REF);
      // Trilho com marcas de metro em metro.
      c.strokeStyle = 'rgba(255,255,255,.15)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(xm, y[id]);
      c.lineTo(x0 + D_MAX * px, y[id]);
      c.stroke();
      for (let k = 1; k <= D_MAX; k++) {
        c.beginPath();
        c.moveTo(x0 + k * px, y[id] - 5);
        c.lineTo(x0 + k * px, y[id] + 5);
        c.stroke();
        if (id === 'b') rotulo(c, T.ROTULOS.metros(k), x0 + k * px, y[id] + rl + 40, COR.muted, 'center', 12);
      }
      // A luz da lâmpada chegando à mancha do medidor: mais fraca quanto mais longe.
      c.fillStyle = `rgba(255,214,140,${0.05 + 0.25 * brilho})`;
      c.beginPath();
      c.moveTo(xl, y[id]);
      c.lineTo(xm, y[id] - lado / 2);
      c.lineTo(xm, y[id] + lado / 2);
      c.closePath();
      c.fill();
      const L = T.LAMPADAS[id];
      lampada(c, xl, y[id], rl, L.potencia / T.LAMPADAS.b.potencia);
      rotulo(c, T.ROTULOS.lampada(L.nome, L.potencia), xl, y[id] - rl * 2.4 - 8, COR.ink, 'center', 13);
      if (!this.mexeu) rotulo(c, `◀ ${T.ROTULOS.arraste} ▶`, xl, y[id] + rl + 20, COR.sol, 'center', 12);

      const v = Math.round(40 + 215 * brilho);
      c.fillStyle = `rgb(${v},${Math.round(v * 0.93)},${Math.round(v * 0.8)})`;
      c.fillRect(xm - lado / 2, y[id] - lado / 2, lado, lado);
      c.strokeStyle = COR.muted;
      c.lineWidth = 1.5;
      c.strokeRect(xm - lado / 2, y[id] - lado / 2, lado, lado);
      rotulo(c, L.nome, xm - lado * 0.7 - 8, y[id] + 5, COR.muted, 'right', 13);
    }
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.strokeRect(xm - lado * 0.7, y.a - lado * 0.7, lado * 1.4, y.b - y.a + lado * 1.4);
    rotulo(c, T.ROTULOS.medidor, xm, y.b + lado * 0.7 + 20, COR.muted, 'center', 12);
    if (this.iguais()) rotulo(c, T.ROTULOS.iguais, xm, y.a - lado * 0.7 - 12, COR.ok, 'center', 14);
  }

  hud(): void {
    const fa = this.fluxoDe('a');
    const fb = this.fluxoDe('b');
    let html = linhaHud(
      T.HUD.medidor,
      this.iguais() ? T.HUD.iguais : T.HUD.maisForte(T.LAMPADAS[fa > fb ? 'a' : 'b'].nome),
    );
    if (estado.avancado)
      for (const id of IDS)
        html += linhaHud(T.HUD.fluxo(T.LAMPADAS[id].nome), `${fmt(this.fluxoDe(id), 2)} W/m²`);
    painel(html);
  }
}
