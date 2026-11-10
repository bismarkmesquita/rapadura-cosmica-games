import { COR, rotulo } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { aumento, aumentoMaximoUtil, magnitudeLimite, tamanhoDaImagem } from '@shared/physics/telescopio';
import type { Fase } from '../types';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrelaBorrada, saturno } from '../scene/desenho';
import { terminaFase } from './util';
import * as T from '../content/missao';

type Alvo = keyof typeof T.ALVOS;
const ALVOS = Object.keys(T.ALVOS) as Alvo[];

interface Escolha {
  abertura: (typeof T.ABERTURAS)[number];
  arranjo: (typeof T.ARRANJOS)[number];
  local: (typeof T.LOCAIS)[number];
  oculares: Set<number>;
}

interface Resultado {
  ok: boolean;
  motivo: string;
  /** Para o desenho: o aumento usado (planeta), a folga de magnitude (galáxia) ou o borrão (dupla). */
  valor: number;
}

function custo(e: Escolha): number {
  return e.abertura.custo + e.arranjo.custo + e.local.custo + e.oculares.size * T.CUSTO_OCULAR;
}

function avalia(e: Escolha): Record<Alvo, Resultado> {
  const D = e.abertura.mm;
  const F = D * e.arranjo.razao;
  const maximo = aumentoMaximoUtil(D);
  // Planeta: a ocular escolhida que dá o maior aumento sem passar do útil (ou a que chega mais perto).
  const aumentos = [...e.oculares].map((f) => aumento(F, f)).sort((a, b) => a - b);
  const bons = aumentos.filter((a) => a <= maximo);
  const A = bons.length ? bons[bons.length - 1] : aumentos[0];
  const planeta: Resultado =
    A === undefined
      ? { ok: false, motivo: T.MOTIVOS.semOcular, valor: 0 }
      : A > maximo
        ? { ok: false, motivo: T.MOTIVOS.muitoAumento, valor: A }
        : A < T.ALVOS.planeta.aumentoMin
          ? { ok: false, motivo: T.MOTIVOS.poucoAumento, valor: A }
          : { ok: true, motivo: T.MOTIVOS.planetaOk(A), valor: A };
  const lim = magnitudeLimite(D) - (e.local.id === 'cidade' ? T.PERDA_CEU_CIDADE : 0);
  const galaxia: Resultado = {
    ok: lim >= T.ALVOS.galaxia.mag,
    motivo: lim >= T.ALVOS.galaxia.mag ? T.MOTIVOS.galaxiaOk(lim) : T.MOTIVOS.galaxiaNao(lim),
    valor: lim - T.ALVOS.galaxia.mag,
  };
  const img = tamanhoDaImagem(D, e.local.seeing);
  const separa = img <= T.ALVOS.dupla.separacao;
  const dupla: Resultado = {
    ok: separa,
    motivo: separa
      ? T.MOTIVOS.duplaOk(img)
      : e.local.seeing >= 2
        ? T.MOTIVOS.duplaAr
        : T.MOTIVOS.duplaPequena(img),
    valor: img,
  };
  return { planeta, galaxia, dupla };
}

export class FaseMissao implements Fase {
  readonly id = 7;
  readonly nome = T.NOME_FASE;
  private e: Escolha = this.inicial();
  private r = avalia(this.e);
  private t = 0;

  private inicial(): Escolha {
    return { abertura: T.ABERTURAS[0], arranjo: T.ARRANJOS[0], local: T.LOCAIS[0], oculares: new Set([25]) };
  }

  init(): void {
    this.e = this.inicial();
    this.r = avalia(this.e);
    missoes.define(this.nome, [{ id: 'tres', texto: T.MISSOES.tres }]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  /** Aplica uma mudanca só se couber no orçamento. */
  private tenta(muda: (e: Escolha) => Escolha): void {
    const nova = muda({ ...this.e, oculares: new Set(this.e.oculares) });
    if (custo(nova) > T.ORCAMENTO) {
      toast.mostra(T.AVISOS.caro, 3);
      return;
    }
    this.e = nova;
    this.r = avalia(nova);
    this.montaControles();
  }

  private montaControles(): void {
    const btn = (sel: boolean, attr: string, valor: string, texto: string): string =>
      `<button class="btn${sel ? ' sel' : ''}" data-${attr}="${valor}" aria-pressed="${sel}">${texto}</button>`;
    const e = this.e;
    controles(
      `<div class="opcoes largo">` +
        T.ABERTURAS.map((a) =>
          btn(a === e.abertura, 'abertura', String(a.mm), T.ROTULOS.preco(T.ROTULOS.mm(a.mm), a.custo)),
        ).join('') +
        T.ARRANJOS.map((a) => btn(a === e.arranjo, 'arranjo', a.id, T.ROTULOS.preco(a.nome, a.custo))).join(
          '',
        ) +
        `</div><div class="opcoes">` +
        T.LOCAIS.map((l) => btn(l === e.local, 'local', l.id, T.ROTULOS.preco(l.nome, l.custo))).join('') +
        T.OCULARES.map((f) =>
          btn(e.oculares.has(f), 'ocular', String(f), T.ROTULOS.preco(T.ROTULOS.mm(f), T.CUSTO_OCULAR)),
        ).join('') +
        `</div>`,
      (caixa) => {
        const liga = (attr: string, muda: (e: Escolha, valor: string) => Escolha): void =>
          caixa.querySelectorAll<HTMLButtonElement>(`[data-${attr}]`).forEach((b) => {
            b.onclick = () => this.tenta((e2) => muda(e2, b.dataset[attr] ?? ''));
          });
        liga('abertura', (e2, v) => ({
          ...e2,
          abertura: T.ABERTURAS.find((a) => String(a.mm) === v) ?? e2.abertura,
        }));
        liga('arranjo', (e2, v) => ({ ...e2, arranjo: T.ARRANJOS.find((a) => a.id === v) ?? e2.arranjo }));
        liga('local', (e2, v) => ({ ...e2, local: T.LOCAIS.find((l) => l.id === v) ?? e2.local }));
        liga('ocular', (e2, v) => {
          const f = Number(v);
          if (e2.oculares.has(f)) e2.oculares.delete(f);
          else e2.oculares.add(f);
          return e2;
        });
      },
    );
  }

  update(dt: number): void {
    this.t += dt;
    if (missoes.atual()?.id !== 'tres' || !ALVOS.every((a) => this.r[a].ok)) return;
    missoes.conclui('tres');
    toast.mostra(T.AVISOS.tres, 5);
    controles('');
    terminaFase(this.id, T.fim);
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 24;
    const alto = h - topo;
    const r = Math.max(30, Math.min(w * 0.13, alto * 0.32));
    const y = topo + r + 4;
    ALVOS.forEach((alvo, i) => {
      const x = w * (0.2 + 0.3 * i);
      const res = this.r[alvo];
      c.save();
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fillStyle = '#04050c';
      c.fill();
      c.clip();
      this.desenhaAlvo(c, alvo, x, y, r, res);
      c.restore();
      c.strokeStyle = res.ok ? COR.ok : COR.muted;
      c.lineWidth = res.ok ? 3 : 2;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.stroke();
      rotulo(c, T.ALVOS[alvo].nome, x, y - r - 10, COR.ink, 'center', 13);
      rotulo(
        c,
        `${res.ok ? '✓' : '✗'} ${res.motivo}`,
        x,
        y + r + 20,
        res.ok ? COR.ok : COR.alerta,
        'center',
        12,
      );
    });
  }

  /** Vista de cada alvo com as escolhas atuais: o mesmo jeito de desenhar das fases do Observatório. */
  private desenhaAlvo(
    c: CanvasRenderingContext2D,
    alvo: Alvo,
    x: number,
    y: number,
    r: number,
    res: Resultado,
  ): void {
    if (alvo === 'planeta') {
      if (!res.valor) return;
      const borrao = res.ok || res.valor < T.ALVOS.planeta.aumentoMin ? 0 : 4;
      const tam = Math.max(1.5, (r * 0.12 * res.valor) / 150);
      for (let k = 0; k < (borrao ? 8 : 1); k++) {
        const a = (k / 8) * TAU;
        c.globalAlpha = borrao ? 0.2 : 1;
        saturno(c, x + Math.cos(a) * borrao, y + Math.sin(a) * borrao, tam, -0.25);
      }
      c.globalAlpha = 1;
    } else if (alvo === 'galaxia') {
      if (res.valor < 0) return;
      const g = c.createRadialGradient(x, y, 0, x, y, r * 0.35);
      g.addColorStop(0, `rgba(255,236,200,${0.3 + 0.5 * Math.min(1, res.valor / 2)})`);
      g.addColorStop(1, 'rgba(255,236,200,0)');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x, y, r * 0.35, r * 0.15, -0.5, 0, TAU);
      c.fill();
    } else {
      // Campo da dupla: 3″ de meia largura; o borrão vem da difração e do ar.
      const k = r / 3;
      const danca = this.e.local.seeing * 0.12 * Math.sin(this.t * 9) * k;
      for (const lado of [-1, 1])
        estrelaBorrada(
          c,
          x + danca + (lado * T.ALVOS.dupla.separacao * k) / 2,
          y,
          res.valor * k,
          Math.min(1, 0.6 / res.valor + 0.3),
        );
    }
  }

  hud(): void {
    const vistos = ALVOS.filter((a) => this.r[a].ok).length;
    painel(
      linhaHud(T.HUD.gasto, T.ROTULOS.moedas(custo(this.e), T.ORCAMENTO)) +
        linhaHud(T.HUD.focal, `${fmt(this.e.abertura.mm * this.e.arranjo.razao, 0)} mm`) +
        linhaHud(T.HUD.alvos, T.HUD.de(vistos)),
    );
  }
}
