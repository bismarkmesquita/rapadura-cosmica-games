import { COR, rotulo } from '@shared/draw/helpers';
import { TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { resolucaoRayleigh, tamanhoDaImagem } from '@shared/physics/telescopio';
import type { Fase } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrelaBorrada } from '../scene/desenho';
import { Firmeza, pergunta, terminaFase } from './util';
import * as T from '../content/atmosfera';

/** Metade do campo mostrado, em segundos de arco: a dupla de 0,4″ ainda aparece separada no espaço. */
const MEIO_CAMPO = 1.2;
/** Quanto a imagem dança, em frações do seeing (o tremor é parte do borrão). */
const DANCA = 0.35;
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tremor suave: soma de senos com frequências diferentes, igual para as duas estrelas (o mesmo ar). */
function tremor(t: number, eixo: number): number {
  return (
    (Math.sin(t * 7.1 + eixo) + 0.6 * Math.sin(t * 12.7 + 2 * eixo) + 0.4 * Math.sin(t * 19.3 + 3 * eixo)) / 2
  );
}

export class FaseAtmosfera implements Fase {
  readonly id = 6;
  readonly nome = T.NOME_FASE;
  private local = T.LOCAIS[0];
  private telescopio = T.TELESCOPIOS[0];
  private t = 0;
  private firmeza = new Firmeza(0.8);

  init(): void {
    this.local = T.LOCAIS[0];
    this.telescopio = T.TELESCOPIOS[T.TELESCOPIOS.length - 1];
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'separar', texto: T.MISSOES.separar },
      { id: 'pergunta', texto: T.MISSOES.pergunta },
    ]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  private imagem(): number {
    return tamanhoDaImagem(this.telescopio.mm, this.local.seeing);
  }

  private separada(): boolean {
    return this.imagem() <= T.SEPARACAO;
  }

  private montaControles(): void {
    if (missoes.atual()?.id !== 'separar') return;
    controles(
      `<div class="opcoes">` +
        T.LOCAIS.map(
          (l) =>
            `<button class="btn${l === this.local ? ' sel' : ''}" data-local="${l.id}" aria-pressed="${l === this.local}">${l.nome}</button>`,
        ).join('') +
        `</div><div class="opcoes">` +
        T.TELESCOPIOS.map(
          (t) =>
            `<button class="btn${t === this.telescopio ? ' sel' : ''}" data-tel="${t.mm}" aria-pressed="${t === this.telescopio}">${t.nome}</button>`,
        ).join('') +
        `</div>`,
      (caixa) => {
        caixa.querySelectorAll<HTMLButtonElement>('[data-local]').forEach((b) => {
          b.onclick = () => {
            this.local = T.LOCAIS.find((l) => l.id === b.dataset.local) ?? T.LOCAIS[0];
            this.escolheu();
          };
        });
        caixa.querySelectorAll<HTMLButtonElement>('[data-tel]').forEach((b) => {
          b.onclick = () => {
            this.telescopio = T.TELESCOPIOS.find((t) => String(t.mm) === b.dataset.tel) ?? T.TELESCOPIOS[0];
            this.escolheu();
          };
        });
      },
    );
  }

  private escolheu(): void {
    this.montaControles();
    if (this.separada()) return;
    if (this.local.seeing >= 2) toast.mostra(T.AVISOS.cidade, 3);
    else if (resolucaoRayleigh(this.telescopio.mm) > T.SEPARACAO) toast.mostra(T.AVISOS.pequeno, 3);
  }

  update(dt: number): void {
    this.t += dt;
    if (missoes.atual()?.id !== 'separar') return;
    if (!this.firmeza.conta(dt, this.separada()) || !missoes.conclui('separar')) return;
    toast.mostra(T.AVISOS.separar, 5);
    pergunta(T.PERGUNTA, () => {
      missoes.conclui('pergunta');
      terminaFase(this.id, T.fim, T.DESAFIO);
    });
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const alto = h - topo;
    const r = Math.min(alto * 0.42, w * 0.26);
    const x = w / 2;
    const y = topo + alto / 2;
    const k = r / MEIO_CAMPO;
    const seeing = this.local.seeing;
    const t = reduzMovimento ? 0 : this.t;
    const dx = tremor(t, 0) * seeing * DANCA * k;
    const dy = tremor(t, 1.7) * seeing * DANCA * k;
    // O brilho total se espalha pelo borrão: quanto maior a mancha, mais apagada.
    const raio = this.imagem() * k;
    const brilho = Math.min(1, (0.25 * r) / raio + 0.35);

    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#04050c';
    c.fill();
    c.clip();
    for (const lado of [-1, 1])
      estrelaBorrada(c, x + dx + (lado * T.SEPARACAO * k) / 2, y + dy, raio, brilho);
    c.restore();
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.vista, x, y - r - 10, COR.ink, 'center', 13);
    rotulo(
      c,
      this.separada() ? T.ROTULOS.separada : T.ROTULOS.junta,
      x,
      y + r + 20,
      this.separada() ? COR.ok : COR.ink,
      'center',
      13,
    );
    if (seeing > 0) this.desenhaAr(c, x - r - 40, y, r);
  }

  /** Faixas de ar ondulando ao lado da vista, mais agitadas quanto pior o seeing. */
  private desenhaAr(c: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    if (x < 30) return;
    c.strokeStyle = 'rgba(115,210,255,.35)';
    c.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      for (let k = 0; k <= 20; k++) {
        const py = y - r * 0.6 + (k / 20) * r * 1.2;
        const px = x - 20 + i * 10 + Math.sin(k * 0.9 + this.t * 3 + i) * 3 * this.local.seeing;
        if (k) c.lineTo(px, py);
        else c.moveTo(px, py);
      }
      c.stroke();
    }
    rotulo(c, T.ROTULOS.ar, x, y + r * 0.6 + 18, COR.muted, 'center', 11);
  }

  hud(): void {
    let html = linhaHud(T.HUD.local, this.local.nome) + linhaHud(T.HUD.telescopio, this.telescopio.nome);
    if (estado.avancado)
      html +=
        linhaHud(T.HUD.difracao, T.HUD.seg(resolucaoRayleigh(this.telescopio.mm))) +
        linhaHud(T.HUD.seeing, T.HUD.seg(this.local.seeing)) +
        linhaHud(T.HUD.imagem, T.HUD.seg(this.imagem()));
    painel(html);
  }
}
