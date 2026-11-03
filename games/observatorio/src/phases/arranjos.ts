import * as THREE from 'three';
import { COR, rotulo } from '@shared/draw/helpers';
import { limita, TAU } from '@shared/math/format';
import { linhaHud } from '@shared/ui/hud';
import {
  GEOMETRIA,
  tracaCassegrain,
  tracaNewtoniano,
  tracaRefrator,
  type TipoEspelho,
  type Tracado,
} from '@shared/physics/optica';
import type { Fase, Ponto } from '../types';
import type { Arranjo } from '../core/telescopio';
import { estado } from '../core/estado';
import { tela, topoLivre } from '../core/palco';
import { descarta, LUZ, renderer3d, type Cena3D } from '../core/tres';
import { cards, controles, missoes, painel, toast } from '../core/ui';
import { SEM_3D } from '../content/jogo';
import { estrela } from '../scene/desenho';
import { andaFotons, montaModelo, tuboTransparente, type Modelo } from '../scene/telescopio3d';
import { Firmeza, terminaFase } from './util';
import * as T from '../content/arranjos';

const ARRANJOS = Object.keys(T.ARRANJOS) as Arranjo[];
const TIPOS = Object.keys(T.ROTULOS.tipo) as TipoEspelho[];
/** Unidades da cena que os fótons andam por segundo. */
const VELOCIDADE_LUZ = 4;
/** Pixels que o dedo pode andar e ainda contar como toque (e não como giro). */
const TOQUE_PX = 6;
/** Começo do newtoniano: o espelho pequeno torto, para o aluno acertar. */
const ANGULO_INICIAL = 20;
/** Distância inicial da câmera: mais perto em telas baixas (celular deitado), onde sobra pouca altura. */
const distanciaInicial = (): number => (innerHeight < 500 ? 10 : 14);

export class FaseArranjos implements Fase {
  readonly id = 1;
  readonly nome = T.NOME_FASE;
  private arranjo: Arranjo = 'newtoniano';
  private angulo = ANGULO_INICIAL;
  private tipo: TipoEspelho = 'plano';
  private posicao: number = GEOMETRIA.cassegrain.posicaoMax;
  private luzBranca = false;
  private transparente = true;
  private tracado: Tracado = tracaNewtoniano(ANGULO_INICIAL);
  private cena: Cena3D | null = null;
  private modelo: Modelo | null = null;
  private orbita = { az: -0.55, el: 0.35, dist: 14 };
  private arrasto: { x: number; y: number; inicio: Ponto; moveu: boolean } | null = null;
  private firmeza = new Firmeza();
  /** Altura livre da tela no último quadro: a vista desce o telescópio para o meio dela. */
  private hLivre = innerHeight;

  init(): void {
    this.arranjo = 'newtoniano';
    this.angulo = ANGULO_INICIAL;
    this.tipo = 'plano';
    this.posicao = GEOMETRIA.cassegrain.posicaoMax;
    this.luzBranca = false;
    this.transparente = true;
    this.orbita = { az: -0.55, el: 0.35, dist: distanciaInicial() };
    this.firmeza.zera();
    missoes.define(this.nome, [
      { id: 'newtoniano', texto: T.MISSOES.newtoniano },
      { id: 'cassegrain', texto: T.MISSOES.cassegrain },
      { id: 'cores', texto: T.MISSOES.cores },
    ]);
    if (renderer3d()) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0e0b16);
      const luz = new THREE.DirectionalLight(0xffffff, 1.1 * LUZ);
      luz.position.set(4, 8, 6);
      const chao = new THREE.GridHelper(40, 40, 0x2c2838, 0x1f1b2e);
      chao.position.y = -2.2;
      scene.add(new THREE.AmbientLight(0xffffff, 0.45 * LUZ), luz, chao);
      this.cena = { scene, camera: new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 200) };
    } else toast.mostra(SEM_3D, 8);
    this.remonta();
    cards.enfileira(T.historia);
    cards.enfileira(T.intro);
  }

  sai(): void {
    if (this.cena) descarta(this.cena.scene);
    this.cena = this.modelo = null;
  }

  private traca(): Tracado {
    if (this.arranjo === 'refrator') return tracaRefrator(this.luzBranca);
    if (this.arranjo === 'newtoniano') return tracaNewtoniano(this.angulo);
    if (this.arranjo === 'sct') return tracaCassegrain('convexo', GEOMETRIA.cassegrain.posicaoIdeal);
    return tracaCassegrain(this.tipo, this.posicao);
  }

  /** Refaz o traçado e o modelo depois de qualquer mudança (arranjo, ângulo, espelho, posição, luz). */
  private remonta(controlesTambem = true): void {
    this.tracado = this.traca();
    if (this.cena) {
      // A leva continua de onde estava: mexer na barra não faz os fótons voltarem ao começo.
      const leva = this.modelo?.leva ?? 0;
      if (this.modelo) {
        this.cena.scene.remove(this.modelo.grupo);
        descarta(this.modelo.grupo);
      }
      this.modelo = montaModelo(this.arranjo, this.tracado, {
        angulo: this.angulo,
        tipo: this.tipo,
        posicao: this.posicao,
      });
      tuboTransparente(this.modelo, this.transparente);
      andaFotons(this.modelo, leva);
      this.cena.scene.add(this.modelo.grupo);
    }
    if (controlesTambem) this.montaControles();
  }

  private montaControles(): void {
    const sel = (sim: boolean): string => (sim ? ' sel' : '');
    const linha1 =
      `<div class="opcoes">` +
      ARRANJOS.map(
        (a) =>
          `<button class="btn${sel(a === this.arranjo)}" data-arranjo="${a}" aria-pressed="${a === this.arranjo}">${T.ARRANJOS[a].curto}</button>`,
      ).join('') +
      `<button class="btn${sel(this.transparente)}" data-transparente aria-pressed="${this.transparente}">${T.ROTULOS.transparente}</button></div>`;
    let linha2 = '';
    if (this.arranjo === 'newtoniano')
      linha2 =
        `<label class="faixa"><span class="longo">${T.ROTULOS.angulo}</span>` +
        `<input type="range" min="0" max="90" step="1" value="${this.angulo}" data-angulo aria-label="${T.ROTULOS.angulo}">` +
        `<output>${T.ROTULOS.graus(this.angulo)}</output></label>`;
    else if (this.arranjo === 'cassegrain') {
      const { posicaoMin, posicaoMax } = GEOMETRIA.cassegrain;
      linha2 =
        `<div class="opcoes">` +
        TIPOS.map(
          (t) =>
            `<button class="btn${sel(t === this.tipo)}" data-tipo="${t}" aria-pressed="${t === this.tipo}">${T.ROTULOS.tipo[t]}</button>`,
        ).join('') +
        `</div><label class="faixa"><span class="longo">${T.ROTULOS.posicao}</span>` +
        `<input type="range" min="${posicaoMin * 100}" max="${posicaoMax * 100}" step="1" value="${Math.round(this.posicao * 100)}" data-posicao aria-label="${T.ROTULOS.posicao}"></label>`;
    } else if (this.arranjo === 'refrator')
      linha2 = `<div class="opcoes"><button class="btn${sel(this.luzBranca)}" data-luz aria-pressed="${this.luzBranca}">${T.ROTULOS.luzBranca}</button></div>`;
    else linha2 = `<p class="nota">${T.ROTULOS.sct}</p>`;

    controles(linha1 + linha2, (caixa) => {
      caixa.querySelectorAll<HTMLButtonElement>('[data-arranjo]').forEach((b) => {
        b.onclick = () => {
          this.arranjo = b.dataset.arranjo as Arranjo;
          this.remonta();
        };
      });
      caixa.querySelectorAll<HTMLButtonElement>('[data-tipo]').forEach((b) => {
        b.onclick = () => {
          this.tipo = b.dataset.tipo as TipoEspelho;
          this.remonta();
        };
      });
      const q = <E extends HTMLElement>(s: string): E | null => caixa.querySelector<E>(s);
      const transp = q<HTMLButtonElement>('[data-transparente]');
      if (transp)
        transp.onclick = () => {
          this.transparente = !this.transparente;
          this.remonta();
        };
      const luz = q<HTMLButtonElement>('[data-luz]');
      if (luz)
        luz.onclick = () => {
          this.luzBranca = !this.luzBranca;
          this.remonta();
        };
      const ang = q<HTMLInputElement>('[data-angulo]');
      if (ang)
        ang.oninput = () => {
          this.angulo = Number(ang.value);
          const saida = ang.parentElement?.querySelector('output');
          if (saida) saida.textContent = T.ROTULOS.graus(this.angulo);
          this.remonta(false);
        };
      const pos = q<HTMLInputElement>('[data-posicao]');
      if (pos)
        pos.oninput = () => {
          this.posicao = Number(pos.value) / 100;
          this.remonta(false);
        };
    });
  }

  update(dt: number): void {
    if (this.modelo) andaFotons(this.modelo, dt * VELOCIDADE_LUZ);
    const m = missoes.atual();
    if (!m) return;
    const ok =
      m.id === 'cores'
        ? this.arranjo === 'refrator' && this.luzBranca
        : this.arranjo === m.id && this.tracado.chegou;
    if (!this.firmeza.conta(dt, ok) || !missoes.conclui(m.id)) return;
    this.firmeza.zera();
    toast.mostra(T.AVISOS_MISSAO[m.id as keyof typeof T.MISSOES], 5);
    if (!missoes.atual()) terminaFase(this.id, T.fim, T.DESAFIO);
  }

  cena3d(): Cena3D | null {
    if (!this.cena || !this.modelo) return null;
    const { camera } = this.cena;
    const { az, el, dist } = this.orbita;
    const alvo = this.modelo.centro;
    camera.position.set(
      alvo.x + dist * Math.cos(el) * Math.sin(az),
      alvo.y + dist * Math.sin(el),
      alvo.z + dist * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(alvo);
    // Desloca a vista para o telescópio ficar no meio da área livre, acima dos controles.
    const H = innerHeight;
    camera.setViewOffset(innerWidth, H, 0, (H - this.hLivre) / 2, innerWidth, H);
    return this.cena;
  }

  aperta(p: Ponto): boolean {
    this.arrasto = { x: p.x, y: p.y, inicio: { ...p }, moveu: false };
    return true;
  }

  arrasta(p: Ponto): void {
    const a = this.arrasto;
    if (!a) return;
    if (Math.hypot(p.x - a.inicio.x, p.y - a.inicio.y) > TOQUE_PX) a.moveu = true;
    this.orbita.az -= (p.x - a.x) * 0.008;
    this.orbita.el = limita(this.orbita.el + (p.y - a.y) * 0.006, -0.2, 1.3);
    a.x = p.x;
    a.y = p.y;
  }

  solta(): void {
    const a = this.arrasto;
    this.arrasto = null;
    if (!a || a.moveu || !this.cena || !this.modelo) return;
    // Toque sem arrastar: mostra o nome da peça tocada.
    const ndc = new THREE.Vector2((a.inicio.x / innerWidth) * 2 - 1, -(a.inicio.y / innerHeight) * 2 + 1);
    const raio = new THREE.Raycaster();
    raio.setFromCamera(ndc, this.cena.camera);
    const id = raio
      .intersectObjects(this.modelo.grupo.children, false)
      .map((i) => i.object.userData.peca as string | undefined)
      .find((x) => x && !(x === 'tubo' && this.transparente));
    const peca = id ? T.PECAS[id] : undefined;
    if (peca) toast.mostra(T.peca(estado.avancado ? peca.tecnico : peca.simples, peca.funcao), 4);
  }

  rola(dy: number): void {
    this.orbita.dist = limita(this.orbita.dist * Math.exp(dy * 0.001), 6, 30);
  }

  cursor(): string {
    return this.arrasto ? 'grabbing' : 'grab';
  }

  desenha(c: CanvasRenderingContext2D, w: number, h: number): void {
    this.hLivre = h;
    if (this.cena && this.modelo && estado.avancado) this.desenhaNomes(c);
    if (!this.cena) this.desenhaCorte(c, w, h);
    this.desenhaOcular(c, w);
    rotulo(c, T.ROTULOS.girar, w / 2, h - 10, COR.muted, 'center', 12);
  }

  private naTela(v: THREE.Vector3): Ponto | null {
    if (!this.cena) return null;
    const p = v.clone().project(this.cena.camera);
    if (p.z > 1) return null;
    return { x: ((p.x + 1) / 2) * tela.W, y: ((1 - p.y) / 2) * tela.H };
  }

  /** Avançado: o nome técnico de cada peça (e o plano focal) preso a ela na tela. */
  private desenhaNomes(c: CanvasRenderingContext2D): void {
    const vistos = new Set<string>();
    for (const o of this.modelo?.grupo.children ?? []) {
      const id = o.userData.peca as string | undefined;
      if (!id || id === 'tubo' || vistos.has(id)) continue;
      vistos.add(id);
      const p = this.naTela(o.getWorldPosition(new THREE.Vector3()));
      // Peças vizinhas (primário, focalizador e ocular no Cassegrain): nomes alternando acima e abaixo.
      const dy = vistos.size % 2 ? -22 : 30;
      if (p) rotulo(c, T.PECAS[id].tecnico, p.x, p.y + dy, COR.orbita, 'center', 12);
    }
    const f = this.modelo?.foco && this.naTela(this.modelo.foco);
    if (f) {
      c.strokeStyle = COR.sol;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(f.x - 6, f.y - 6);
      c.lineTo(f.x + 6, f.y + 6);
      c.moveTo(f.x + 6, f.y - 6);
      c.lineTo(f.x - 6, f.y + 6);
      c.stroke();
      rotulo(c, T.PLANO_FOCAL, f.x, f.y + 20, COR.sol, 'center', 12);
    }
  }

  /** Sem WebGL: o mesmo corte com os raios, em 2D. */
  private desenhaCorte(c: CanvasRenderingContext2D, w: number, h: number): void {
    const esc = Math.min(w / 16, h / 6);
    const x0 = w * 0.18;
    const y0 = h * 0.55;
    c.strokeStyle = COR.muted;
    c.strokeRect(x0, y0 - esc, esc * 9, esc * 2);
    for (const r of this.tracado.raios) {
      c.strokeStyle = r.cor;
      c.lineWidth = 2;
      c.beginPath();
      r.pontos.forEach(([x, y], i) =>
        i ? c.lineTo(x0 + x * esc, y0 - y * esc) : c.moveTo(x0 + x * esc, y0 - y * esc),
      );
      c.stroke();
    }
  }

  /** O que o olho veria na ocular: a estrela nítida, borrada, com bordas coloridas ou nada. */
  private desenhaOcular(c: CanvasRenderingContext2D, w: number): void {
    const r = Math.min(70, Math.max(40, w * 0.05));
    const x = w - r - 22;
    const y = topoLivre().direita + r + 22;
    c.save();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fillStyle = '#05060f';
    c.fill();
    c.clip();
    const { chegou, desfoque } = this.tracado;
    if (this.arranjo === 'refrator' && this.luzBranca) {
      for (const [cor, raio] of [
        ['rgba(255,127,110,.55)', 14],
        ['rgba(110,168,255,.6)', 9],
      ] as const) {
        c.fillStyle = cor;
        c.beginPath();
        c.arc(x, y, raio, 0, TAU);
        c.fill();
      }
      estrela(c, x, y, 4, '#ffffff');
    } else if (chegou) estrela(c, x, y, 4, '#ffffff');
    else if (desfoque < 1) {
      c.globalAlpha = 0.25 + 0.5 * (1 - desfoque);
      c.fillStyle = '#fff1c4';
      c.beginPath();
      c.arc(x, y, 5 + desfoque * r * 0.7, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
    } else rotulo(c, T.ROTULOS.semLuz, x, y + 4, COR.muted, 'center', 11);
    c.restore();
    c.strokeStyle = COR.muted;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    rotulo(c, T.ROTULOS.ocular, x, y + r + 16, COR.muted, 'center', 12);
  }

  hud(): void {
    const a = T.ARRANJOS[this.arranjo];
    let html = linhaHud(T.HUD.arranjo, a.nome);
    if (estado.avancado)
      html += linhaHud(T.HUD.tubo, T.HUD.metros(a.tuboM)) + linhaHud(T.HUD.focal, T.HUD.metros(a.focalM));
    painel(html);
  }
}
