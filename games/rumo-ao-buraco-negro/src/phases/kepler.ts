import * as THREE from 'three';
import { LUZ } from '../core/engine';
import { fmt, TAU } from '@shared/math/format';
import { anomaliaExcentrica, periodoEmAnos, visVivaSolar } from '@shared/physics/kepler';
import { linhaHud, tituloHud } from '@shared/ui/hud';
import { COR } from '@shared/draw/helpers';
import type { Fase } from '../types';
import { scene } from '../core/engine';
import { estado, nave, posicionaNave } from '../core/estado';
import { iniciaCamera, rig } from '../core/camera';
import { controlaNave, registraTrilha } from '../core/ship';
import { cards, info, missoes, painel, teclasDaFase, toast } from '../core/ui';
import { desenhaAlvo, rotulo3D } from '../core/overlay';
import { fluxo } from '../core/flow';
import { brilho } from '../scene/sprites';
import { texFaixas, texNuvens, texRochoso, texSol, texTerra } from '../scene/textures';
import * as T from '../content/kepler';

/** Unidades do jogo por UA e segundos de jogo por ano (no tempo ×1). */
const UA = 260;
const ANO = 40;

interface Planeta {
  n: string;
  a: number;
  e: number;
  /** Argumento do periélio, em graus. */
  w: number;
  r: number;
  M0: number;
  T: number;
  voltas: number;
  ultimaVolta: number | null;
  px: number;
  py: number;
  textura: () => THREE.Texture;
  mesh?: THREE.Mesh;
  orbita?: THREE.Line;
}

const PLANETAS = (): Planeta[] =>
  (
    [
      ['Mercúrio', 0.387, 0.206, 77, 7, 1.2, () => texRochoso('#8f8378', ['#6f655c', '#b3a597', '#5e554d'])],
      ['Vênus', 0.723, 0.007, 131, 11, 4.1, () => texFaixas(['#e8cf98', '#dcbf86', '#f0dcae', '#d2b27a'])],
      ['Terra', 1, 0.017, 103, 12, 2.6, texTerra],
      ['Marte', 1.524, 0.093, 336, 9, 5.4, () => texRochoso('#b5532f', ['#8e3a20', '#d0784f', '#6d2c18'])],
      [
        'Júpiter',
        5.203,
        0.048,
        14,
        28,
        0.4,
        () => texFaixas(['#d9b48a', '#c99a6a', '#efdcc2', '#b98458', '#e6c9a2']),
      ],
    ] as [string, number, number, number, number, number, () => THREE.Texture][]
  ).map(([n, a, e, w, r, M0, textura]) => ({
    n,
    a,
    e,
    w,
    r,
    M0,
    T: periodoEmAnos(a),
    voltas: 0,
    ultimaVolta: null,
    px: 0,
    py: 0,
    textura,
  }));

export class FaseKepler implements Fase {
  readonly id = 1;
  readonly nome = T.NOME_FASE;
  readonly dMin = 25;
  readonly dMax = 6000;
  readonly escalaNave = 3;
  readonly corTrilha = COR.orbita;
  grupo: THREE.Group | null = null;

  private planetas: Planeta[] = [];
  private t = 0.15;
  private escalaTempo = 1;
  private exagero = 0;
  private exageroAlvo = 0;
  private exageroDesenhado = -1;
  private mostraFocos = false;
  private mostraAreas = false;
  private areasProntas = false;
  private mostraPeriodos = false;
  private perto: Planeta | null = null;
  private sol!: THREE.Mesh;
  private areas!: THREE.Mesh;
  private focoVazio!: THREE.Mesh;
  private linhaFocos!: THREE.Line;

  /** Usado também como fundo animado do menu. */
  preparaCena(): void {
    this.t = 0.15;
    this.escalaTempo = 1;
    this.exagero = this.exageroAlvo = 0;
    this.exageroDesenhado = -1;
    this.mostraFocos = this.mostraAreas = this.areasProntas = this.mostraPeriodos = false;
    this.planetas = PLANETAS();
    const g = new THREE.Group();
    g.add(new THREE.AmbientLight(0x8890c0, 0.22 * LUZ));
    g.add(new THREE.PointLight(0xfff1d6, 2.1 * LUZ, 0, 0));
    this.sol = new THREE.Mesh(
      new THREE.SphereGeometry(40, 48, 32),
      new THREE.MeshBasicMaterial({ map: texSol() }),
    );
    g.add(this.sol, brilho(0xffb040, 320, 0.9), brilho(0xff8a20, 900, 0.35));
    for (const p of this.planetas) {
      p.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.r, 40, 28),
        new THREE.MeshStandardMaterial({ map: p.textura(), roughness: 0.85 }),
      );
      p.mesh.rotation.z = 0.3;
      if (p.n === 'Terra') {
        p.mesh.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(p.r * 1.03, 40, 28),
            new THREE.MeshStandardMaterial({ map: texNuvens(), transparent: true, depthWrite: false }),
          ),
        );
      }
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(181 * 3), 3));
      p.orbita = new THREE.Line(
        lg,
        new THREE.LineBasicMaterial({ color: 0x73d2ff, transparent: true, opacity: 0.3 }),
      );
      p.orbita.frustumCulled = false;
      g.add(p.mesh, p.orbita);
    }
    // Fatias de áreas iguais (2ª lei) na órbita de Mercúrio.
    const NS = 12,
      NJ = 10;
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * NJ * 9), 3));
    const cores = new Float32Array(NS * NJ * 9);
    for (let s = 0; s < NS; s++)
      for (let j = 0; j < NJ * 3; j++)
        cores.set(s % 2 ? [1, 0.71, 0.28] : [0.45, 0.82, 1], (s * NJ * 3 + j) * 3);
    ag.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    this.areas = new THREE.Mesh(
      ag,
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.areas.frustumCulled = false;
    // Foco vazio da órbita de Marte (1ª lei).
    this.focoVazio = new THREE.Mesh(
      new THREE.OctahedronGeometry(5),
      new THREE.MeshBasicMaterial({ color: 0xffb547 }),
    );
    const fl = new THREE.BufferGeometry();
    fl.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    this.linhaFocos = new THREE.Line(
      fl,
      new THREE.LineDashedMaterial({
        color: 0xffb547,
        transparent: true,
        opacity: 0.6,
        dashSize: 6,
        gapSize: 6,
      }),
    );
    this.linhaFocos.frustumCulled = false;
    g.add(this.areas, this.focoVazio, this.linhaFocos);
    scene.add(g);
    this.grupo = g;
  }

  init(): void {
    this.preparaCena();
    posicionaNave({ x: -80, y: UA * 1.35, ang: -Math.PI / 2 });
    iniciaCamera(900);
    missoes.define(this.nome, [
      { id: 'marte', texto: T.MISSOES.marte, alvo: () => this.alvoPlaneta('Marte') },
      { id: 'mercurio', texto: T.MISSOES.mercurio, alvo: () => this.alvoPlaneta('Mercúrio') },
      { id: 'jupiter', texto: T.MISSOES.jupiter, alvo: () => this.alvoPlaneta('Júpiter') },
      { id: 'terra', texto: T.MISSOES.terra, alvo: () => this.alvoPlaneta('Terra') },
    ]);
    teclasDaFase(T.TECLAS);
    cards.enfileira(T.intro);
  }

  private ecc(p: Planeta): number {
    return p.e + (Math.min(0.6, p.e * 3) - p.e) * this.exagero;
  }

  private pos(p: Planeta, t: number, e = this.ecc(p)): [number, number, number] {
    const M = p.M0 + (TAU * t) / p.T;
    const E = anomaliaExcentrica(M, e);
    const x = p.a * (Math.cos(E) - e);
    const y = p.a * Math.sqrt(1 - e * e) * Math.sin(E);
    const w = (p.w * Math.PI) / 180;
    return [UA * (x * Math.cos(w) - y * Math.sin(w)), UA * (x * Math.sin(w) + y * Math.cos(w)), M];
  }

  private alvoPlaneta(n: string): { x: number; y: number; nome: string } {
    const p = this.planetas.find((q) => q.n === n)!;
    return { x: p.px, y: p.py, nome: n };
  }

  private escalaPlaneta(): number {
    return !estado.fase || rig.modo === 'mapa' ? Math.min(3, Math.max(1, rig.dist / 450)) : 1;
  }

  tecla(k: string): void {
    if (k === 'e') {
      this.exageroAlvo = this.exageroAlvo ? 0 : 1;
      toast.mostra(this.exageroAlvo ? T.AVISOS.exagerado : T.AVISOS.real);
    }
    if (k === ']' || k === '[') {
      this.escalaTempo = k === ']' ? Math.min(8, this.escalaTempo * 2) : Math.max(0.25, this.escalaTempo / 2);
      toast.mostra('Tempo ×' + fmt(this.escalaTempo, this.escalaTempo < 1 ? 2 : 0));
    }
  }

  /** Avança o tempo dos planetas (também no fundo do menu). */
  movePlanetas(dt: number, escala = this.escalaTempo): void {
    this.exagero += (this.exageroAlvo - this.exagero) * Math.min(1, dt * 3);
    this.t += (dt * escala) / ANO;
    for (const p of this.planetas) {
      const [x, y, M] = this.pos(p, this.t);
      p.px = x;
      p.py = y;
      const volta = Math.floor((M - p.M0) / TAU);
      if (p.ultimaVolta !== null && volta > p.ultimaVolta) p.voltas++;
      p.ultimaVolta = volta;
    }
  }

  update(dt: number): void {
    this.movePlanetas(dt);
    controlaNave(dt, 420, 420, 900);
    nave.vx *= Math.exp(-0.25 * dt);
    nave.vy *= Math.exp(-0.25 * dt);
    nave.x += nave.vx * dt;
    nave.y += nave.vy * dt;
    const ds = Math.hypot(nave.x, nave.y);
    if (ds < 62) {
      nave.x *= 62 / ds;
      nave.y *= 62 / ds;
      nave.vx *= -0.3;
      nave.vy *= -0.3;
      toast.mostra(T.AVISOS.sol);
    }
    registraTrilha();
    this.perto =
      this.planetas.find((p) => Math.hypot(nave.x - p.px, nave.y - p.py) < p.r * this.escalaPlaneta() + 55) ??
      null;
    const m = missoes.atual();
    if (!m || !this.perto) return;
    const n = this.perto.n;
    if (m.id === 'marte' && n === 'Marte' && missoes.conclui('marte'))
      cards.enfileira({ ...T.lei1, aoFechar: () => (this.mostraFocos = true) });
    else if (m.id === 'mercurio' && n === 'Mercúrio' && missoes.conclui('mercurio'))
      cards.enfileira({
        ...T.lei2,
        aoFechar: () => {
          this.mostraAreas = true;
          this.exageroAlvo = 1;
        },
      });
    else if (m.id === 'jupiter' && n === 'Júpiter' && missoes.conclui('jupiter'))
      cards.enfileira({ ...T.lei3(this.planetas), aoFechar: () => (this.mostraPeriodos = true) });
    else if (m.id === 'terra' && n === 'Terra' && missoes.conclui('terra'))
      cards.enfileira({ ...T.porque, aoFechar: () => fluxo.iniciaFase(2) });
  }

  sync(dt: number): void {
    const s = this.escalaPlaneta();
    this.sol.rotation.y += dt * 0.05;
    for (const p of this.planetas) {
      p.mesh!.position.set(p.px, 0, p.py);
      p.mesh!.scale.setScalar(s);
      p.mesh!.rotation.y += dt * (p.n === 'Júpiter' ? 0.9 : 0.5);
    }
    if (Math.abs(this.exagero - this.exageroDesenhado) > 0.002) {
      this.exageroDesenhado = this.exagero;
      for (const p of this.planetas) {
        const e = this.ecc(p),
          w = (p.w * Math.PI) / 180,
          b = p.a * Math.sqrt(1 - e * e);
        const a = p.orbita!.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i <= 180; i++) {
          const E = (i / 180) * TAU,
            x = p.a * (Math.cos(E) - e),
            y = b * Math.sin(E);
          a.setXYZ(i, UA * (x * Math.cos(w) - y * Math.sin(w)), 0, UA * (x * Math.sin(w) + y * Math.cos(w)));
        }
        a.needsUpdate = true;
      }
      if (this.mostraAreas) this.atualizaAreas();
    }
    if (this.mostraAreas && !this.areasProntas) {
      this.atualizaAreas();
      this.areasProntas = true;
    }
    this.areas.visible = this.mostraAreas;
    this.focoVazio.visible = this.linhaFocos.visible = this.mostraFocos;
    if (this.mostraFocos) {
      const [fx, fz] = this.focoVazioMarte();
      this.focoVazio.position.set(fx, 0, fz);
      this.focoVazio.rotation.y += dt * 1.5;
      this.focoVazio.scale.setScalar(rig.modo === 'mapa' ? Math.max(1, rig.dist / 300) : 1);
      const a = this.linhaFocos.geometry.attributes.position as THREE.BufferAttribute;
      a.setXYZ(0, 0, 0, 0);
      a.setXYZ(1, fx, 0, fz);
      a.needsUpdate = true;
      this.linhaFocos.computeLineDistances();
    }
  }

  private focoVazioMarte(): [number, number] {
    const marte = this.planetas[3];
    const e = this.ecc(marte),
      w = (marte.w * Math.PI) / 180,
      fx = -2 * marte.a * e * UA;
    return [fx * Math.cos(w), fx * Math.sin(w)];
  }

  private atualizaAreas(): void {
    const p = this.planetas[0],
      e = this.ecc(p);
    const a = this.areas.geometry.attributes.position as THREE.BufferAttribute;
    const NS = 12,
      NJ = 10;
    let k = 0;
    for (let s = 0; s < NS; s++) {
      for (let j = 0; j < NJ; j++) {
        const t0 = p.T * ((s + j / NJ) / NS) - (p.M0 * p.T) / TAU;
        const t1 = p.T * ((s + (j + 1) / NJ) / NS) - (p.M0 * p.T) / TAU;
        const [x0, y0] = this.pos(p, t0, e);
        const [x1, y1] = this.pos(p, t1, e);
        a.setXYZ(k++, 0, -0.5, 0);
        a.setXYZ(k++, x0, -0.5, y0);
        a.setXYZ(k++, x1, -0.5, y1);
      }
    }
    a.needsUpdate = true;
  }

  overlay(): void {
    const s = this.escalaPlaneta();
    for (const p of this.planetas) rotulo3D(p.n, p.px, p.py, COR.ink, -12, 13, p.r * s + 6);
    if (this.mostraFocos) {
      const [fx, fz] = this.focoVazioMarte();
      rotulo3D('foco vazio da órbita de Marte', fx, fz, COR.sol, -14);
      rotulo3D('Sol: um dos focos', 0, 0, COR.sol, -12, 13, 60);
    }
    if (estado.fase) desenhaAlvo(missoes.alvoAtual());
  }

  hud(): void {
    let h =
      tituloHud('Painel') +
      linhaHud('Tempo', `ano ${fmt(this.t, 2)}`) +
      linhaHud('Velocidade do tempo', '×' + fmt(this.escalaTempo, this.escalaTempo < 1 ? 2 : 0)) +
      linhaHud('Elipses', this.exagero > 0.5 ? 'exageradas' : 'forma real');
    if (this.mostraPeriodos)
      h += tituloHud('Voltas completas', true) + this.planetas.map((p) => linhaHud(p.n, p.voltas)).join('');
    painel(h);
    const p = this.perto;
    if (!p) return info(null);
    const r = Math.hypot(p.px, p.py) / UA;
    info(
      `<div class="eyebrow">Você está perto de</div><h3>${p.n}</h3>` +
        `<p>Distância ao Sol: ${fmt(r, 2)} UA</p><p>Velocidade na órbita agora: ${fmt(visVivaSolar(r, p.a), 1)} km/s</p>` +
        `<p>Uma volta no Sol: ${p.T < 1 ? fmt(p.T * 365.25, 0) + ' dias' : fmt(p.T, 1) + ' anos'}</p>`,
    );
  }
}
