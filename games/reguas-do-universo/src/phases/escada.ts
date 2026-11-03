import { COR, rotulo } from '@shared/draw/helpers';
import { linhaHud } from '@shared/ui/hud';
import type { Fase } from '../types';
import { estado } from '../core/estado';
import { fluxo } from '../core/flow';
import { topoLivre } from '../core/palco';
import { cards, controles, missoes, painel } from '../core/ui';
import { FASES_MENU } from '../content/jogo';
import { CORES_REGUAS as CORES } from '../scene/desenho';
import * as T from '../content/escada';

/** Tela final: as réguas empilhadas em escada, acesas as que o aluno conquistou. */
export class FaseEscada implements Fase {
  readonly id = T.ID_ESCADA;
  readonly nome = T.NOME_FASE;

  init(): void {
    missoes.define(this.nome, []);
    controles(
      `<div class="opcoes"><button class="btn prim" data-menu>${T.ROTULOS.menu}</button></div>`,
      (caixa) => {
        const b = caixa.querySelector<HTMLButtonElement>('[data-menu]');
        if (b) b.onclick = () => fluxo.vaiMenu();
      },
    );
    cards.enfileira(T.intro);
  }

  update(): void {}

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    const livre = topoLivre();
    const topo = Math.max(livre.esquerda, livre.direita) + 10;
    const n = FASES_MENU.length;
    const passo = (h - 20 - topo) / n;
    const alto = Math.min(26, passo * 0.55);
    const largura = Math.min(260, w * 0.24);
    const recuo = (w * 0.5 - largura) / (n - 1);
    FASES_MENU.forEach((f, i) => {
      const x = w * 0.04 + i * recuo;
      const y = h - 20 - (i + 1) * passo + (passo - alto) / 2;
      const acesa = estado.reguas.has(f.id);
      c.fillStyle = acesa ? CORES[i] : 'rgba(255,255,255,.08)';
      c.beginPath();
      c.roundRect(x, y, largura, alto, 4);
      c.fill();
      // Marcas de régua.
      c.strokeStyle = acesa ? 'rgba(14,11,22,.55)' : 'rgba(255,255,255,.12)';
      c.lineWidth = 1.2;
      for (let k = 6; k < largura; k += 12) {
        c.beginPath();
        c.moveTo(x + k, y);
        c.lineTo(x + k, y + (k % 24 === 6 ? alto * 0.45 : alto * 0.25));
        c.stroke();
      }
      rotulo(c, f.regua, x + 10, y + alto - 6, acesa ? '#0e0b16' : COR.muted, 'left', 13);
      const d = T.DEGRAUS[f.id];
      const tx = x + largura + 16;
      rotulo(
        c,
        `${T.ROTULOS.alcance}: ${d.alcance}`,
        tx,
        y + alto / 2 - 2,
        acesa ? COR.ink : COR.muted,
        'left',
        13,
      );
      rotulo(
        c,
        acesa ? `${T.ROTULOS.usa}: ${d.usa}` : T.ROTULOS.falta,
        tx,
        y + alto / 2 + 14,
        COR.muted,
        'left',
        11,
      );
    });
  }

  hud(): void {
    painel(linhaHud(T.ROTULOS.conquistadas, T.ROTULOS.de(estado.reguas.size, FASES_MENU.length)));
  }
}
