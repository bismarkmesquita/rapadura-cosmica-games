import { COR, rotulo, terrinha } from '@shared/draw/helpers';
import { fmt, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { ESTRELAS } from '@shared/physics/constantes';
import type { Fase, Ponto } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrela, sol } from '../scene/desenho';
import { perto, terminaFase } from './util';
import * as T from '../content/paralaxe';

interface EstrelaDoCampo {
  letra: string;
  /** Paralaxe em segundos de arco. */
  p: number;
  /** Posição no campo do telescópio, em fração do raio. */
  x: number;
  y: number;
  r: number;
  cor: string;
}

/**
 * Sirius, Vega e Proxima Centauri, juntas num campo só para comparar (no céu ficam longe umas das outras).
 * Nem as letras nem o brilho seguem a distância, para a ordem sair só do tamanho do pulo.
 */
const DO_CAMPO: EstrelaDoCampo[] = [
  { letra: 'A', p: 1 / ESTRELAS.sirius.distPc, x: -0.45, y: -0.3, r: 5, cor: '#dfe8ff' },
  { letra: 'B', p: 1 / ESTRELAS.vega.distPc, x: 0.42, y: -0.12, r: 5.5, cor: '#f4f6ff' },
  { letra: 'C', p: ESTRELAS.proxima.paralaxe, x: -0.02, y: 0.36, r: 3, cor: '#ff9a6a' },
];
const ORDEM_CERTA = [...DO_CAMPO]
  .sort((a, b) => b.p - a.p)
  .map((e) => e.letra)
  .join('');
const P_MAX = Math.max(...DO_CAMPO.map((e) => e.p));
/** Pulo para cada lado da estrela mais próxima, em fração do raio do campo: grande o bastante para ver. */
const PULO_MAX = 0.22;
/** Meses por segundo no botão "Passar o ano": um ano em 6 s. */
const MESES_POR_SEGUNDO = 2;
/** Meses que o aluno precisa passar (meio ano: de um lado a outro da órbita) antes de ordenar as estrelas. */
const MESES_PARA_VER = 6;

const FUNDO = Array.from({ length: 70 }, () => {
  const a = Math.random() * TAU;
  const d = Math.sqrt(Math.random()) * 0.95;
  return {
    x: d * Math.cos(a),
    y: d * Math.sin(a),
    r: 0.5 + Math.random() * 0.9,
    alfa: 0.35 + Math.random() * 0.4,
  };
});

export class FaseParalaxe implements Fase {
  readonly id = 2;
  readonly nome = T.NOME_FASE;
  /** Mês de 0 (janeiro) a 12, contínuo. */
  private mes = 0;
  private tocando = false;
  private varrido = 0;
  private escolha: string[] = [];
  private campo = { cx: 0, cy: 0, r: 1 };
  private faixa: HTMLInputElement | null = null;
  private botaoTocar: HTMLButtonElement | null = null;

  init(): void {
    this.mes = this.varrido = 0;
    this.tocando = false;
    this.escolha = [];
    missoes.define(this.nome, [
      { id: 'ano', texto: T.MISSOES.ano },
      { id: 'ordem', texto: T.MISSOES.ordem },
    ]);
    controles(
      `<label class="faixa"><span class="longo">${T.ROTULOS.mes}</span>` +
        `<input type="range" min="0" max="1200" value="0" aria-label="${T.ROTULOS.mes}">` +
        `<output>${T.MESES[0]}</output></label>` +
        `<button class="btn" data-tocar>${T.ROTULOS.passar}</button>`,
      (caixa) => {
        this.faixa = caixa.querySelector('input');
        this.botaoTocar = caixa.querySelector('[data-tocar]');
        if (this.faixa)
          this.faixa.oninput = () => {
            const novo = Number(this.faixa?.value) / 100;
            this.varrido += Math.abs(novo - this.mes);
            this.mes = novo;
          };
        if (this.botaoTocar) this.botaoTocar.onclick = () => this.alternaTocar();
      },
    );
    cards.enfileira(T.intro);
  }

  private alternaTocar(): void {
    this.tocando = !this.tocando;
    if (this.botaoTocar) this.botaoTocar.textContent = this.tocando ? T.ROTULOS.parar : T.ROTULOS.passar;
  }

  private nomeDoMes(): string {
    return T.MESES[Math.round(this.mes) % 12];
  }

  update(dt: number): void {
    if (this.tocando) {
      this.mes = (this.mes + dt * MESES_POR_SEGUNDO) % 12;
      this.varrido += dt * MESES_POR_SEGUNDO;
      if (this.faixa) this.faixa.value = String(Math.round(this.mes * 100));
    }
    const saida = this.faixa?.parentElement?.querySelector('output');
    if (saida) saida.textContent = this.nomeDoMes();
    if (this.varrido >= MESES_PARA_VER && missoes.atual()?.id === 'ano' && missoes.conclui('ano'))
      toast.mostra(T.AVISOS.ano, 4);
  }

  /** Desvio da estrela em segundos de arco: oposto ao lado em que a Terra está na órbita. */
  private desvio(e: EstrelaDoCampo): number {
    const d = -e.p * Math.cos((this.mes / 12) * TAU);
    // Sem "−0,000″" no painel quando a estrela passa pelo meio.
    return Math.abs(d) < 5e-4 ? 0 : d;
  }

  private posicao(e: EstrelaDoCampo): Ponto {
    const { cx, cy, r } = this.campo;
    return { x: cx + (e.x + (this.desvio(e) / P_MAX) * PULO_MAX) * r, y: cy + e.y * r };
  }

  private estrelaEm(p: Ponto): EstrelaDoCampo | undefined {
    return DO_CAMPO.find((e) => {
      const q = this.posicao(e);
      return perto(p.x, p.y, q.x, q.y, 22);
    });
  }

  aperta(p: Ponto): boolean {
    const e = this.estrelaEm(p);
    if (!e) return false;
    if (missoes.atual()?.id !== 'ordem') {
      toast.mostra(T.AVISOS.primeiro);
      return false;
    }
    if (this.escolha.includes(e.letra)) return false;
    this.escolha.push(e.letra);
    if (this.escolha.length < DO_CAMPO.length) return false;
    if (this.escolha.join('') !== ORDEM_CERTA) {
      toast.mostra(T.AVISOS.errado);
      this.escolha = [];
      return false;
    }
    missoes.conclui('ordem');
    toast.mostra(T.AVISOS.certo, 4);
    if (this.tocando) this.alternaTocar();
    terminaFase(this.id, T.fim, T.DESAFIO);
    return false;
  }

  cursor(p: Ponto): string {
    return this.estrelaEm(p) ? 'pointer' : 'default';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    this.desenhaOrbita(c, w, h);
    c.strokeStyle = 'rgba(255,255,255,.08)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(w * 0.52, h * 0.3);
    c.lineTo(w * 0.52, h - 10);
    c.stroke();
    this.desenhaCampo(c, w, h);
  }

  /** Metade esquerda: a Terra na órbita e as linhas de visada até uma estrela próxima. */
  private desenhaOrbita(c: CanvasRenderingContext2D, w: number, h: number): void {
    // Do fundo (logo abaixo das missões) ao rótulo da órbita (no pé da cena) cabem 3,35 raios da órbita.
    const yFundo = topoLivre().esquerda + 22;
    const R = Math.max(30, Math.min(w * 0.14, (h - 34 - yFundo) / 3.35));
    const cx = w * 0.3;
    const cy = h - 34 - R;
    const est = { x: cx, y: cy - R * 1.75 };
    const terraEm = (mes: number): Ponto => {
      const a = (mes / 12) * TAU;
      return { x: cx + R * Math.cos(a), y: cy - R * Math.sin(a) };
    };
    // Onde a linha que sai da Terra e passa pela estrela encontra o fundo.
    const noFundo = (t: Ponto): number => est.x + ((est.x - t.x) * (yFundo - est.y)) / (est.y - t.y);

    c.fillStyle = '#dfe5ff';
    for (let i = 0; i < 9; i++) {
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(cx + (i - 4) * R * 0.17, yFundo - 6 + (i % 3) * 5, 1.1, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    rotulo(c, T.ROTULOS.fundo, cx, yFundo - 16, COR.muted, 'center', 12);

    c.setLineDash([5, 6]);
    c.strokeStyle = 'rgba(115,210,255,.35)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(cx, cy, R, 0, TAU);
    c.stroke();
    c.setLineDash([]);

    for (const [mes, nome, lado] of [
      [0, T.ROTULOS.janeiro, 'left'],
      [6, T.ROTULOS.julho, 'right'],
    ] as const) {
      const t = terraEm(mes);
      c.strokeStyle = 'rgba(255,255,255,.18)';
      c.beginPath();
      c.moveTo(t.x, t.y);
      c.lineTo(noFundo(t), yFundo);
      c.stroke();
      rotulo(c, nome, t.x + (lado === 'left' ? 12 : -12), t.y + 22, COR.muted, lado, 12);
    }
    const terra = terraEm(this.mes);
    c.strokeStyle = COR.orbita;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(terra.x, terra.y);
    c.lineTo(noFundo(terra), yFundo);
    c.stroke();

    sol(c, cx, cy, Math.max(7, R * 0.12));
    terrinha(c, terra.x, terra.y, Math.max(6, R * 0.08));
    rotulo(c, T.ROTULOS.terra, terra.x, terra.y - 14, COR.ink, 'center', 12);
    estrela(c, est.x, est.y, 5, '#ff9a6a');
    rotulo(c, T.ROTULOS.proxima, est.x + 12, est.y + 4, COR.ink, 'left', 12);
    rotulo(c, T.ROTULOS.orbita, cx, cy + R + 30, COR.muted, 'center', 12);
  }

  /** Metade direita: o campo do telescópio, com as três estrelas pulando contra o fundo. */
  private desenhaCampo(c: CanvasRenderingContext2D, w: number, h: number): void {
    // Entre o painel do canto e os dois rótulos de baixo.
    const topo = topoLivre().direita;
    const base = h - 44;
    const r = Math.max(40, Math.min(w * 0.19, (base - topo) / 2));
    const cx = w * 0.76;
    const cy = (topo + base) / 2;
    this.campo = { cx, cy, r };

    c.save();
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.fillStyle = '#05060f';
    c.fill();
    c.clip();
    c.fillStyle = '#dfe5ff';
    for (const f of FUNDO) {
      c.globalAlpha = f.alfa;
      c.beginPath();
      c.arc(cx + f.x * r, cy + f.y * r, f.r, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(115,210,255,.12)';
    c.beginPath();
    c.moveTo(cx - r, cy);
    c.lineTo(cx + r, cy);
    c.moveTo(cx, cy - r);
    c.lineTo(cx, cy + r);
    c.stroke();
    for (const e of DO_CAMPO) {
      const q = this.posicao(e);
      // Marca da posição de janeiro e de julho, para comparar o tamanho do pulo.
      c.strokeStyle = 'rgba(255,255,255,.18)';
      c.beginPath();
      c.moveTo(cx + (e.x - (e.p / P_MAX) * PULO_MAX) * r, q.y + 10);
      c.lineTo(cx + (e.x + (e.p / P_MAX) * PULO_MAX) * r, q.y + 10);
      c.stroke();
      estrela(c, q.x, q.y, e.r, e.cor);
      rotulo(c, e.letra, q.x + 10, q.y - 8, COR.ink, 'left', 14);
      const ordem = this.escolha.indexOf(e.letra);
      if (ordem >= 0) {
        c.fillStyle = COR.sol;
        c.beginPath();
        c.arc(q.x - 14, q.y - 14, 9, 0, TAU);
        c.fill();
        rotulo(c, String(ordem + 1), q.x - 14, q.y - 10, '#1b1205', 'center', 12);
      }
    }
    if (estado.avancado) {
      const um = (PULO_MAX * r) / P_MAX;
      const y = cy + r * 0.78;
      c.strokeStyle = COR.sol;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(cx - um / 2, y);
      c.lineTo(cx + um / 2, y);
      c.moveTo(cx - um / 2, y - 4);
      c.lineTo(cx - um / 2, y + 4);
      c.moveTo(cx + um / 2, y - 4);
      c.lineTo(cx + um / 2, y + 4);
      c.stroke();
      rotulo(c, T.ROTULOS.segundo, cx, y - 8, COR.sol, 'center', 12);
    }
    c.restore();

    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.telescopio, cx, cy + r + 18, COR.muted, 'center', 12);
    rotulo(c, T.ROTULOS.foraDeEscala, cx, cy + r + 36, COR.muted, 'center', 12);
  }

  hud(): void {
    let html = linhaHud(T.HUD.mes, this.nomeDoMes());
    if (estado.avancado)
      for (const e of DO_CAMPO) html += linhaHud(T.HUD.desvio(e.letra), `${fmt(this.desvio(e), 3)}″`);
    painel(html);
  }
}
