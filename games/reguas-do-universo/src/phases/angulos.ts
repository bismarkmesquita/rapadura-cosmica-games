import { COR, luazinha, olho, rotulo } from '@shared/draw/helpers';
import { fmt, limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { LUA, SOL, UA_KM } from '@shared/physics/constantes';
import { diametroAngular, radianosParaGraus, radianosParaSegundos } from '@shared/physics/distancias';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { moeda, sol } from '../scene/desenho';
import { Firmeza, perto, terminaFase } from './util';
import * as T from '../content/angulos';

type Objeto = keyof typeof T.OBJETOS;
type Situacao = keyof typeof T.SITUACAO;

/** Onde o objeto pode ficar, em fração da distância olho–Sol na cena (fora de escala). */
const POS_MIN = 0.18;
const POS_MAX = 0.8;
/** Raio do objeto em fração do raio do Sol: assim ele cobre o Sol justinho a 42% do caminho, no meio da barra. */
const RAIO_OBJETO = 0.42;
/** Até 8% maior que o Sol no céu, a Lua ainda deixa a coroa aparecer. */
const TOTAL_MAX = 1.08;
/** Abaixo disso, a Lua é pequena demais para parecer um anel. */
const ANULAR_MIN = 0.85;
const THETA_SOL = diametroAngular(SOL.diametroKm, UA_KM);
const DIAMETRO_KM = { lua: LUA.diametroKm, moeda: T.MOEDA_MM / 1e6 };

interface Cena {
  x0: number;
  y: number;
  ds: number;
  ro: number;
}

export class FaseAngulos implements Fase {
  readonly id = 1;
  readonly nome = T.NOME_FASE;
  /** Posição do objeto na barra, de 0 (perto do olho) a 1 (longe). */
  private pos = 0.75;
  private objeto: Objeto = 'lua';
  private arrastando = false;
  private mexeu = false;
  private firmeza = new Firmeza();
  private cena: Cena | null = null;
  private faixa: HTMLInputElement | null = null;

  init(): void {
    this.pos = 0.75;
    this.objeto = 'lua';
    this.arrastando = this.mexeu = false;
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'total', texto: T.MISSOES.total },
      { id: 'anular', texto: T.MISSOES.anular },
      { id: 'moeda', texto: T.MISSOES.moeda },
    ]);
    this.montaControles();
    cards.enfileira(T.intro);
  }

  /**
   * Ângulo do objeto dividido pelo do Sol. A cena decide (ângulo ≈ tamanho ÷ distância) e os números reais
   * saem dela: a Lua no meio da barra cobre o Sol justinho, como no céu.
   */
  private razao(): number {
    return RAIO_OBJETO / (POS_MIN + this.pos * (POS_MAX - POS_MIN));
  }

  private situacao(r: number): Situacao {
    if (r > TOTAL_MAX) return 'grande';
    if (r >= 1) return 'total';
    if (r >= ANULAR_MIN) return 'anular';
    return 'pequena';
  }

  private montaControles(): void {
    const o = T.OBJETOS[this.objeto];
    const comMoeda = !missoes.atual() || missoes.atual()?.id === 'moeda';
    const botoes = (Object.keys(T.OBJETOS) as Objeto[])
      .map(
        (k) =>
          `<button class="btn${k === this.objeto ? ' sel' : ''}" data-objeto="${k}" aria-pressed="${k === this.objeto}">${T.OBJETOS[k].nome}</button>`,
      )
      .join('');
    controles(
      `<label class="faixa"><span>${o.distancia}</span>` +
        `<input type="range" min="0" max="1000" value="${Math.round(this.pos * 1000)}" aria-label="${o.distancia}"></label>` +
        // Os botões ocupam o lugar desde o começo, para a caixa (e a cena acima dela) não mudar de altura.
        `<div class="opcoes${comMoeda ? '' : ' invisivel'}">${botoes}</div>`,
      (caixa) => {
        this.faixa = caixa.querySelector('input');
        if (this.faixa) this.faixa.oninput = () => (this.pos = Number(this.faixa?.value) / 1000);
        caixa.querySelectorAll<HTMLButtonElement>('[data-objeto]').forEach((b) => {
          b.onclick = () => {
            this.objeto = b.dataset.objeto as Objeto;
            this.montaControles();
          };
        });
      },
    );
  }

  update(dt: number): void {
    const m = missoes.atual();
    if (!m) return;
    const s = this.situacao(this.razao());
    const ok =
      m.id === 'moeda'
        ? this.objeto === 'moeda' && (s === 'total' || s === 'grande')
        : this.objeto === 'lua' && s === m.id;
    if (!this.firmeza.conta(dt, ok) || !missoes.conclui(m.id)) return;
    this.firmeza.zera();
    toast.mostra(T.AVISOS[m.id as keyof typeof T.AVISOS], 4);
    if (m.id === 'anular') this.montaControles();
    if (m.id === 'moeda') terminaFase(this.id, T.fim, T.DESAFIO);
  }

  private moveObjeto(x: number): void {
    const c = this.cena;
    if (!c) return;
    this.pos = limita(((x - c.x0) / c.ds - POS_MIN) / (POS_MAX - POS_MIN), 0, 1);
    this.mexeu = true;
    if (this.faixa) this.faixa.value = String(Math.round(this.pos * 1000));
  }

  /** Pega o objeto ou qualquer ponto da linha de visada, e o objeto pula para lá. */
  aperta(p: Ponto): boolean {
    const c = this.cena;
    if (!c) return false;
    const naLinha =
      Math.abs(p.y - c.y) < Math.max(c.ro, 24) + 16 &&
      p.x > c.x0 + c.ds * POS_MIN - 30 &&
      p.x < c.x0 + c.ds * POS_MAX + 30;
    if (!naLinha) return false;
    this.arrastando = true;
    this.moveObjeto(p.x);
    return true;
  }

  arrasta(p: Ponto): void {
    this.moveObjeto(p.x);
  }

  solta(): void {
    this.arrastando = false;
  }

  cursor(p: Ponto): string {
    const c = this.cena;
    if (this.arrastando) return 'grabbing';
    if (!c) return 'default';
    const xo = c.x0 + c.ds * (POS_MIN + this.pos * (POS_MAX - POS_MIN));
    return perto(p.x, p.y, xo, c.y, Math.max(c.ro, 20) + 8) ? 'grab' : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const y = h * 0.74;
    const x0 = Math.max(48, w * 0.07);
    const rs = Math.min(h * 0.13, w * 0.08);
    const xs = w - rs - Math.max(24, w * 0.04);
    const ds = xs - x0;
    const ro = RAIO_OBJETO * rs;
    const r = this.razao();
    const xo = x0 + ds * (POS_MIN + this.pos * (POS_MAX - POS_MIN));
    this.cena = { x0, y, ds, ro };

    // Linhas de visada: do olho às bordas do Sol (âmbar) e às bordas do objeto, prolongadas até o Sol (ciano).
    const cone = (abertura: number, cor: string, preenche: string): void => {
      c.fillStyle = preenche;
      c.beginPath();
      c.moveTo(x0, y);
      c.lineTo(xs, y - abertura);
      c.lineTo(xs, y + abertura);
      c.closePath();
      c.fill();
      c.strokeStyle = cor;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x0, y);
      c.lineTo(xs, y - abertura);
      c.moveTo(x0, y);
      c.lineTo(xs, y + abertura);
      c.stroke();
    };
    cone(rs, 'rgba(255,181,71,.7)', 'rgba(255,181,71,.06)');
    cone(r * rs, 'rgba(115,210,255,.85)', 'rgba(115,210,255,.08)');

    sol(c, xs, y, rs);
    if (this.objeto === 'lua') luazinha(c, xo, y, ro);
    else moeda(c, xo, y, ro);
    olho(c, x0, y, Math.max(14, rs * 0.28));

    const yRot = y + rs + 22;
    rotulo(c, T.ROTULOS.olho, x0, yRot, COR.muted, 'center', 13);
    rotulo(c, T.ROTULOS.sol, xs, yRot, COR.sol, 'center', 13);
    rotulo(c, T.OBJETOS[this.objeto].nome, xo, y + ro + 20, COR.ink, 'center', 13);
    if (!this.mexeu) {
      const pulso = 0.5 + 0.5 * Math.sin(performance.now() / 300);
      c.globalAlpha = 0.5 + 0.5 * pulso;
      rotulo(c, `◀ ${T.ROTULOS.arraste} ▶`, xo, y - ro - 12, COR.sol, 'center', 13);
      c.globalAlpha = 1;
    }
    rotulo(c, T.ROTULOS.foraDeEscala, w - 16, h - 14, COR.muted, 'right', 12);

    this.desenhaJanela(c, w, h, r);
  }

  /** O céu visto pelo olho: Sol e objeto alinhados, com o tamanho de cada um no céu. */
  private desenhaJanela(c: CanvasRenderingContext2D, w: number, h: number, r: number): void {
    const jr = Math.min(h * 0.19, w * 0.15);
    const jx = w / 2;
    const jy = Math.max(jr + 16, h * 0.32);
    const rSol = jr * 0.3;
    const s = this.situacao(r);
    // Fração do disco do Sol coberta; o céu só escurece de verdade perto da totalidade.
    const coberta = Math.min(1, r * r);
    const escuro = coberta ** 6;

    c.save();
    c.beginPath();
    c.arc(jx, jy, jr, 0, TAU);
    c.clip();
    const dia = [61, 111, 184];
    const noite = [8, 10, 28];
    const mistura = dia.map((v, i) => Math.round(v + (noite[i] - v) * escuro));
    c.fillStyle = `rgb(${mistura.join(',')})`;
    c.fillRect(jx - jr, jy - jr, jr * 2, jr * 2);
    if (r >= 1) {
      c.fillStyle = '#dfe5ff';
      for (const [ex, ey] of [
        [-0.6, -0.4],
        [0.5, -0.55],
        [0.65, 0.3],
        [-0.45, 0.5],
        [0.1, 0.7],
      ]) {
        c.beginPath();
        c.arc(jx + ex * jr, jy + ey * jr, 1.3, 0, TAU);
        c.fill();
      }
      const coroa = c.createRadialGradient(jx, jy, rSol * 0.9, jx, jy, rSol * 2.6);
      coroa.addColorStop(0, 'rgba(235,240,255,.9)');
      coroa.addColorStop(0.35, 'rgba(200,215,255,.35)');
      coroa.addColorStop(1, 'rgba(200,215,255,0)');
      c.fillStyle = coroa;
      c.beginPath();
      c.arc(jx, jy, rSol * 2.6, 0, TAU);
      c.fill();
    } else {
      sol(c, jx, jy, rSol);
    }
    c.fillStyle = this.objeto === 'lua' ? '#15171f' : '#24231f';
    c.beginPath();
    c.arc(jx, jy, rSol * r, 0, TAU);
    c.fill();
    c.restore();

    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(jx, jy, jr, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.ceu, jx, jy + jr + 18, COR.muted, 'center', 12);
    rotulo(
      c,
      T.SITUACAO[s],
      jx,
      jy + jr + 38,
      s === 'total' || s === 'anular' ? COR.ok : COR.ink,
      'center',
      15,
    );
  }

  hud(): void {
    const r = this.razao();
    const o = T.OBJETOS[this.objeto];
    const tamanho = r > TOTAL_MAX ? T.HUD.maior : r >= 0.98 ? T.HUD.igual : T.HUD.menor;
    let html = linhaHud(T.HUD.tamanho, tamanho);
    if (estado.avancado) {
      const theta = r * THETA_SOL;
      const dKm = DIAMETRO_KM[this.objeto] / (2 * Math.tan(theta / 2));
      const angulo = (t: number): string =>
        `${fmt(radianosParaGraus(t), 3)}° = ${fmt(radianosParaSegundos(t), 0)}″`;
      html +=
        linhaHud(o.angulo, angulo(theta)) +
        linhaHud(T.HUD.anguloSol, angulo(THETA_SOL)) +
        linhaHud(o.distancia, this.objeto === 'lua' ? `${fmt(dKm, 0)} km` : `${fmt(dKm * 1000, 2)} m`);
    }
    painel(html);
  }
}
