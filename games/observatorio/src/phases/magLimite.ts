import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { ganhoDeLuz, magnitudeLimite } from '@shared/physics/telescopio';
import type { Fase } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrela } from '../scene/desenho';
import { Firmeza, terminaFase } from './util';
import * as T from '../content/magLimite';

/** Magnitudes das estrelas do campo: das que o olho vê até bem além do que o maior telescópio alcança. */
const MAG_MAIS_BRILHANTE = 3;
const MAG_MAIS_FRACA = 15;
/**
 * Cada magnitude a mais tem umas 3 vezes mais estrelas (contagens de estrelas na Via Láctea): sorteia as
 * magnitudes com esse crescimento.
 */
const CRESCIMENTO = 0.45;

const CAMPO = Array.from({ length: 700 }, () => {
  const u = Math.random();
  const amplitude = 10 ** (CRESCIMENTO * (MAG_MAIS_FRACA - MAG_MAIS_BRILHANTE)) - 1;
  const mag = MAG_MAIS_BRILHANTE + Math.log10(1 + u * amplitude) / CRESCIMENTO;
  const a = Math.random() * TAU;
  const d = Math.sqrt(Math.random()) * 0.95;
  return { x: d * Math.cos(a), y: d * Math.sin(a), mag };
});
/** Posição da galáxia no campo, em frações do raio. */
const GALAXIA = { x: 0.32, y: -0.18 };

const visivel = (mag: number, D: number): boolean => mag <= magnitudeLimite(D);
const MENOR_QUE_MOSTRA =
  T.ABERTURAS.find((D) => visivel(T.GALAXIA_MAG, D)) ?? T.ABERTURAS[T.ABERTURAS.length - 1];

export class FaseMagLimite implements Fase {
  readonly id = 4;
  readonly nome = T.NOME_FASE;
  private abertura = T.ABERTURAS[0];
  private firmeza = new Firmeza(0.8);

  init(): void {
    this.abertura = T.ABERTURAS[0];
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'galaxia', texto: T.MISSOES.galaxia },
      { id: 'menor', texto: T.MISSOES.menor },
    ]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  private montaControles(): void {
    controles(
      `<div class="opcoes">` +
        T.ABERTURAS.map(
          (D) =>
            `<button class="btn${D === this.abertura ? ' sel' : ''}" data-abertura="${D}" aria-pressed="${D === this.abertura}">${T.ROTULOS.abertura(D)}</button>`,
        ).join('') +
        `</div>`,
      (caixa) =>
        caixa.querySelectorAll<HTMLButtonElement>('[data-abertura]').forEach((b) => {
          b.onclick = () => {
            this.abertura = Number(b.dataset.abertura);
            this.montaControles();
            if (missoes.atual()?.id !== 'menor') return;
            if (!visivel(T.GALAXIA_MAG, this.abertura)) toast.mostra(T.AVISOS.sumiu, 3);
            else if (this.abertura !== MENOR_QUE_MOSTRA) toast.mostra(T.AVISOS.maior, 3);
          };
        }),
    );
  }

  update(dt: number): void {
    const m = missoes.atual()?.id;
    if (!m) return;
    const ve = visivel(T.GALAXIA_MAG, this.abertura);
    const ok = m === 'galaxia' ? ve : this.abertura === MENOR_QUE_MOSTRA;
    if (!this.firmeza.conta(dt, ok) || !missoes.conclui(m)) return;
    this.firmeza.zera();
    toast.mostra(T.AVISOS[m as keyof typeof T.MISSOES], 5);
    if (!missoes.atual()) terminaFase(this.id, T.fim, T.DESAFIO);
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const alto = h - topo;
    const r = Math.min(alto * 0.44, w * 0.24);
    const x = w * 0.58;
    const y = topo + alto / 2;
    const lim = magnitudeLimite(this.abertura);

    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#04050c';
    c.fill();
    c.clip();
    for (const s of CAMPO) {
      if (s.mag > lim) continue;
      // Quanto mais acima do limite, mais forte; as do limite mal aparecem.
      const folga = Math.min(1, (lim - s.mag) / 3);
      c.globalAlpha = 0.35 + 0.65 * folga;
      estrela(c, x + s.x * r, y + s.y * r, 0.7 + 1.8 * folga, '#e9ecff');
    }
    if (visivel(T.GALAXIA_MAG, this.abertura)) {
      const folga = Math.min(1, (lim - T.GALAXIA_MAG) / 2);
      const gx = x + GALAXIA.x * r;
      const gy = y + GALAXIA.y * r;
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, r * 0.09);
      g.addColorStop(0, `rgba(255,236,200,${0.35 + 0.5 * folga})`);
      g.addColorStop(1, 'rgba(255,236,200,0)');
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(gx, gy, r * 0.09, r * 0.04, -0.5, 0, TAU);
      c.fill();
      rotulo(c, T.ROTULOS.galaxia, gx, gy + r * 0.09, COR.sol, 'center', 11);
    }
    c.globalAlpha = 1;
    c.restore();
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.campo, x, y - r - 10, COR.ink, 'center', 13);

    // À esquerda, o "balde": a boca do telescópio comparada com a pupila do olho, na mesma escala.
    const bx = w * 0.16;
    const by = y;
    const raioMax = Math.min(w * 0.12, alto * 0.38);
    const escala = raioMax / T.ABERTURAS[T.ABERTURAS.length - 1];
    // Contorno da maior abertura, para comparar.
    c.setLineDash([4, 5]);
    c.strokeStyle = 'rgba(115,210,255,.35)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(bx, by, raioMax, 0, TAU);
    c.stroke();
    c.setLineDash([]);
    c.strokeStyle = COR.orbita;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(bx, by, Math.max(2, this.abertura * escala), 0, TAU);
    c.stroke();
    c.fillStyle = COR.sol;
    c.beginPath();
    c.arc(bx, by, Math.max(1.5, T.ABERTURAS[0] * escala), 0, TAU);
    c.fill();
    rotulo(c, T.ROTULOS.balde, bx, by - raioMax - 10, COR.muted, 'center', 12);
    rotulo(
      c,
      `${T.ROTULOS.telescopio}: ${T.ROTULOS.abertura(this.abertura)}`,
      bx,
      by + raioMax + 18,
      COR.orbita,
      'center',
      12,
    );
    rotulo(c, `● ${T.ROTULOS.olho}`, bx, by + raioMax + 34, COR.sol, 'center', 11);
  }

  hud(): void {
    const lim = magnitudeLimite(this.abertura);
    let html =
      linhaHud(T.HUD.abertura, T.ROTULOS.abertura(this.abertura)) +
      linhaHud(T.HUD.estrelas, fmt(CAMPO.filter((s) => s.mag <= lim).length, 0));
    if (estado.avancado)
      html +=
        linhaHud(T.HUD.ganho, `${fmt(ganhoDeLuz(this.abertura), 0)}×`) + linhaHud(T.HUD.limite, fmt(lim, 1));
    painel(html);
  }
}
