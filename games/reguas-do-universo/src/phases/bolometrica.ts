import { COR, rotulo } from '@shared/draw/helpers';
import { limita } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import { MAG_BOL_SOL } from '@shared/physics/constantes';
import type { Fase } from '../types';
import { estado } from '../core/estado';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { estrela } from '../scene/desenho';
import { graficoEspectro, type Faixa } from '../scene/espectro';
import { pergunta, terminaFase } from './util';
import * as T from '../content/bolometrica';

const FAIXAS = Object.keys(T.FILTROS) as Faixa[];
type Estrela = (typeof T.ESTRELAS_FASE)[number];
const L_MAX = Math.max(...T.ESTRELAS_FASE.map((e) => e.L));
const SPICA = T.ESTRELAS_FASE.find((e) => e.id === 'spica');
const BETELGEUSE = T.ESTRELAS_FASE.find((e) => e.id === 'betelgeuse');
/**
 * Magnitudes que viram o menor e o maior tamanho no visor. O brilho vai do Sol no ultravioleta a Betelgeuse
 * no filtro Tudo, quase um milhão de vezes: o tamanho segue a magnitude, não o brilho direto.
 */
const M_FRACA = 8;
const M_FORTE = -8;

/** Luz da estrela no filtro, em luminosidades solares: o brilho real, sem ajuste nenhum. */
const luzNoFiltro = (e: Estrela, f: Faixa): number => e.L * (f === 'tudo' ? 1 : e.fracoes[f]);

export class FaseBolometrica implements Fase {
  readonly id = 6;
  readonly nome = T.NOME_FASE;
  private filtro: Faixa = 'visivel';

  init(): void {
    this.filtro = 'visivel';
    missoes.define(this.nome, [
      { id: 'uv', texto: T.MISSOES.uv },
      { id: 'pergunta', texto: T.MISSOES.pergunta },
    ]);
    this.montaFiltros();
    cards.enfileira(T.intro);
  }

  private montaFiltros(): void {
    controles(
      `<div class="opcoes">` +
        FAIXAS.map(
          (f) =>
            `<button class="btn${f === this.filtro ? ' sel' : ''}" data-filtro="${f}" aria-pressed="${f === this.filtro}">${T.FILTROS[f]}</button>`,
        ).join('') +
        `</div>`,
      (caixa) =>
        caixa.querySelectorAll<HTMLButtonElement>('[data-filtro]').forEach((b) => {
          b.onclick = () => {
            this.filtro = b.dataset.filtro as Faixa;
            this.montaFiltros();
          };
        }),
    );
  }

  update(): void {
    if (missoes.atual()?.id !== 'uv' || !SPICA || !BETELGEUSE) return;
    if (luzNoFiltro(SPICA, this.filtro) <= luzNoFiltro(BETELGEUSE, this.filtro)) return;
    missoes.conclui('uv');
    toast.mostra(T.AVISOS.uv, 5);
    // Os filtros saem e a pergunta entra no lugar; o visor fica no filtro que acabou de mostrar a resposta.
    pergunta(T.PERGUNTA, () => {
      missoes.conclui('pergunta');
      terminaFase(this.id, T.fim, T.DESAFIO);
    });
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const base = h - 30;

    // Visor, à esquerda.
    const vx = w * 0.05;
    const vw = w * 0.42;
    c.fillStyle = '#05060f';
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(vx, topo + 20, vw, base - topo - 20, 16);
    c.fill();
    c.stroke();
    rotulo(c, T.ROTULOS.visor(T.FILTROS[this.filtro]), vx + vw / 2, topo + 10, COR.ink, 'center', 13);
    rotulo(c, T.ROTULOS.legenda, vx + vw / 2, topo + 40, COR.muted, 'center', 12);
    // Embaixo de cada estrela vão nome, temperatura e, no Avançado, mais três linhas: uns 84 px.
    const rMax = Math.max(8, Math.min(vw / 8, (base - topo - 146) / 2));
    // Estrelas e textos centrados no visor, sem subir para cima da legenda.
    const cy = Math.max(topo + 50 + rMax, (topo + 20 + base) / 2 - 42);
    T.ESTRELAS_FASE.forEach((e, i) => {
      const x = vx + vw * (0.18 + 0.32 * i);
      const m = MAG_BOL_SOL - 2.5 * Math.log10(luzNoFiltro(e, this.filtro));
      const k = limita((M_FRACA - m) / (M_FRACA - M_FORTE), 0, 1);
      c.globalAlpha = 0.35 + 0.65 * k;
      // Ao quadrado: sem isso, 10 vezes mais brilho (Betelgeuse × Spica no visível) mal muda o tamanho.
      estrela(c, x, cy, 2 + (rMax - 2) * k * k, e.cor);
      c.globalAlpha = 1;
      rotulo(c, e.nome, x, cy + rMax + 22, COR.ink, 'center', 13);
      rotulo(c, T.ROTULOS.temperatura(e.T), x, cy + rMax + 38, COR.muted, 'center', 11);
      if (estado.avancado) {
        rotulo(c, T.HUD.lum(e.L), x, cy + rMax + 54, COR.orbita, 'center', 11);
        rotulo(c, T.HUD.mBol(e.mBol), x, cy + rMax + 68, COR.orbita, 'center', 11);
        rotulo(c, T.HUD.bc(e.bc), x, cy + rMax + 82, COR.orbita, 'center', 11);
      }
    });

    // Espectro, à direita, na escala real: a área de cada faixa é a luz da estrela nela.
    const gx = w * 0.53;
    rotulo(c, T.ROTULOS.grafico, gx + w * 0.21, topo + 10, COR.ink, 'center', 13);
    graficoEspectro(
      c,
      gx,
      topo + 20,
      w * 0.42,
      base - topo - 54,
      T.ESTRELAS_FASE.map((e) => ({
        T: e.T,
        cor: e.cor,
        nome: T.ROTULOS.nomeNoGrafico(e.nome, e.id),
        escala: e.L / L_MAX,
      })),
      T.ROTULOS,
      this.filtro,
    );
  }

  hud(): void {
    painel(linhaHud(T.HUD.filtro, T.FILTROS[this.filtro]));
  }
}
