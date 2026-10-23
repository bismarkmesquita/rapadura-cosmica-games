import * as THREE from 'three';
import { LUZ } from '../core/engine';
import { fmt } from '@shared/math/format';
import { avanca, gravidadeCentral } from '@shared/physics/gravity';
import { linhaHud, medidorHud, tituloHud } from '@shared/ui/hud';
import { COR } from '@shared/draw/helpers';
import type { Fase } from '../types';
import { scene } from '../core/engine';
import { nave, posicionaNave } from '../core/estado';
import { iniciaCamera } from '../core/camera';
import { controlaNave, moveNave, registraTrilha } from '../core/ship';
import { cards, info, missoes, painel, teclasDaFase, toast, toqueDaFase } from '../core/ui';
import { desenhaAlvo, rotulo3D } from '../core/overlay';
import { fluxo } from '../core/flow';
import { brilho } from '../scene/sprites';
import { atualizaLinha, linhaDinamica } from '../scene/common';
import { alturaPoco, criaGrade, type Grade, type MassaGrade } from '../scene/grid';
import { texSol, texTerra } from '../scene/textures';
import { Temporizador, rebate } from './util';
import * as T from '../content/einstein';

const GM_SOL = 4e6;
const RAIO_ORBITA_TERRA = 900;

interface Sonda {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trilha: [number, number][];
  morta: boolean;
  mesh: THREE.Mesh;
  linha: THREE.Line;
}

/** Caminho de um raio de luz que passa perto do Sol (desvio muito exagerado). */
function caminhoDaLuz(): {
  pts: [number, number][];
  ini: [number, number];
  fim: [number, number];
  dir: [number, number];
} {
  let x = -2100,
    z = -200,
    vx = 1,
    vz = 0;
  const pts: [number, number][] = [[x, z]];
  for (let i = 0; i < 2000 && x < 2100; i++) {
    const r2 = x * x + z * z,
      r = Math.sqrt(r2),
      a = 26 / r2;
    vx -= ((a * x) / r) * 5;
    vz -= ((a * z) / r) * 5;
    const v = Math.hypot(vx, vz);
    vx /= v;
    vz /= v;
    x += vx * 5;
    z += vz * 5;
    if (i % 4 === 0) pts.push([x, z]);
  }
  pts.push([x, z]);
  return { pts, ini: pts[0], fim: [x, z], dir: [vx, vz] };
}

export class FaseEinstein implements Fase {
  readonly id = 3;
  readonly nome = T.NOME_FASE;
  readonly dMin = 30;
  readonly dMax = 9000;
  readonly escalaNave = 3;
  readonly corTrilha = COR.orbita;
  grupo: THREE.Group | null = null;

  private massa = 0;
  private ligado = false;
  private mostraRaio = false;
  private sondas: Sonda[] = [];
  private lancadas = 0;
  private relNave = 0;
  private relLonge = 0;
  private tPerto = 0;
  private angTerra = 1.2;
  private timer = new Temporizador();
  private raio = caminhoDaLuz();
  private aparente: [number, number] = [0, 0];
  private luz!: THREE.PointLight;
  private sol!: THREE.Mesh;
  private solBrilho!: THREE.Sprite;
  private grade!: Grade;
  private terra!: THREE.Mesh;
  private objetosLuz: THREE.Object3D[] = [];
  private observatorio!: THREE.Mesh;
  private grupoSondas!: THREE.Group;

  private constroi(): void {
    const g = new THREE.Group();
    g.add(new THREE.AmbientLight(0x8890c0, 0.32 * LUZ));
    this.luz = new THREE.PointLight(0xfff1d6, 0, 0, 0);
    this.sol = new THREE.Mesh(
      new THREE.SphereGeometry(70, 48, 32),
      new THREE.MeshBasicMaterial({ map: texSol() }),
    );
    this.solBrilho = brilho(0xffb040, 560, 0.9);
    this.grade = criaGrade(4400, 67, 133);
    this.terra = new THREE.Mesh(
      new THREE.SphereGeometry(18, 32, 24),
      new THREE.MeshStandardMaterial({ map: texTerra(), roughness: 0.9 }),
    );
    g.add(this.luz, this.sol, this.solBrilho, this.grade, this.terra);

    const [ox, oz] = this.raio.fim,
      [dx, dz] = this.raio.dir;
    this.aparente = [ox - dx * 4200, oz - dz * 4200];
    const linhaRaio = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this.raio.pts.map(([x, z]) => new THREE.Vector3(x, 10, z))),
      new THREE.LineBasicMaterial({ color: 0xffe08a }),
    );
    const linhaAparente = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ox, 10, oz),
        new THREE.Vector3(this.aparente[0], 10, this.aparente[1]),
      ]),
      new THREE.LineDashedMaterial({
        color: 0x73d2ff,
        dashSize: 40,
        gapSize: 30,
        transparent: true,
        opacity: 0.75,
      }),
    );
    linhaAparente.computeLineDistances();
    const estrelaReal = brilho(0xfff3c0, 240, 1);
    estrelaReal.position.set(this.raio.ini[0], 10, this.raio.ini[1]);
    const estrelaFantasma = brilho(0x73d2ff, 240, 0.65);
    estrelaFantasma.position.set(this.aparente[0], 10, this.aparente[1]);
    this.observatorio = new THREE.Mesh(
      new THREE.TorusGeometry(40, 4, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xffb547 }),
    );
    this.observatorio.rotation.x = Math.PI / 2;
    this.observatorio.position.set(ox, 10, oz);
    this.objetosLuz = [linhaRaio, linhaAparente, estrelaReal, estrelaFantasma, this.observatorio];
    this.grupoSondas = new THREE.Group();
    g.add(...this.objetosLuz, this.grupoSondas);
    scene.add(g);
    this.grupo = g;
  }

  init(): void {
    Object.assign(this, {
      massa: 0,
      ligado: false,
      mostraRaio: false,
      sondas: [],
      lancadas: 0,
      relNave: 0,
      relLonge: 0,
      tPerto: 0,
      angTerra: 1.2,
    });
    this.timer = new Temporizador();
    this.constroi();
    posicionaNave({ x: 0, y: 1800, ang: -Math.PI / 2 });
    iniciaCamera(2600);
    missoes.define(this.nome, [
      { id: 'centro', texto: T.MISSOES.centro, alvo: () => ({ x: 0, y: 0, nome: 'Centro' }) },
      { id: 'sondas', texto: T.MISSOES.sondas },
      {
        id: 'eclipse',
        texto: T.MISSOES.eclipse,
        alvo: () => ({ x: this.raio.fim[0], y: this.raio.fim[1], nome: 'Observatório' }),
      },
      { id: 'tempo', texto: T.MISSOES.tempo, alvo: () => ({ x: 0, y: 0, nome: 'Sol' }) },
    ]);
    teclasDaFase(T.TECLAS);
    toqueDaFase(T.TOQUE);
    cards.enfileira(T.intro);
  }

  private massas(): MassaGrade[] {
    return [
      { x: 0, z: 0, A: 15000 * this.massa, s: 60 },
      { x: this.terra.position.x, z: this.terra.position.z, A: 900, s: 22 },
    ];
  }

  /** Ritmo do tempo na nave (exagerado de propósito). */
  private ritmo(r: number): number {
    return this.massa > 0 ? Math.sqrt(Math.max(0.05, 1 - (40 * this.massa) / Math.max(r, 70))) : 1;
  }

  private gravidade = (x: number, y: number): [number, number] =>
    gravidadeCentral(GM_SOL * this.massa, x, y, 400);

  tecla(k: string): void {
    if (k === 'f') this.lancaSonda();
  }

  private lancaSonda(): void {
    if (!this.ligado) return toast.mostra(T.AVISOS.primeiroCentro);
    const cores = [0x7fe0a6, 0x73d2ff, 0xff7f6e, 0xc7a6ff, 0xffb547];
    const cor = cores[this.lancadas % cores.length];
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 12),
      new THREE.MeshBasicMaterial({ color: cor }),
    );
    const linha = linhaDinamica(500, cor, 0.8);
    this.grupoSondas.add(mesh, linha);
    const v = 130;
    this.sondas.push({
      x: nave.x + Math.cos(nave.ang) * 20,
      y: nave.y + Math.sin(nave.ang) * 20,
      vx: nave.vx + Math.cos(nave.ang) * v,
      vy: nave.vy + Math.sin(nave.ang) * v,
      trilha: [],
      morta: false,
      mesh,
      linha,
    });
    if (this.sondas.length > 8) {
      const s = this.sondas.shift()!;
      this.grupoSondas.remove(s.mesh, s.linha);
      s.mesh.geometry.dispose();
      s.linha.geometry.dispose();
    }
    this.lancadas++;
    toast.mostra(T.AVISOS.sonda(this.lancadas));
    if (missoes.atual()?.id === 'sondas' && this.lancadas >= 3 && missoes.conclui('sondas')) {
      this.timer.depois(4, () => cards.enfileira({ ...T.sondas, aoFechar: () => (this.mostraRaio = true) }));
    }
  }

  update(dt: number): void {
    this.timer.tick(dt);
    if (this.ligado && this.massa < 1) this.massa = Math.min(1, this.massa + dt / 2.5);
    this.angTerra += dt * 0.08;
    this.terra.position.x = Math.cos(this.angTerra) * RAIO_ORBITA_TERRA;
    this.terra.position.z = Math.sin(this.angTerra) * RAIO_ORBITA_TERRA;
    controlaNave(dt, 110, 360, 110);
    moveNave(dt, this.gravidade);
    registraTrilha();
    const r = Math.hypot(nave.x, nave.y);
    if (this.massa > 0.5) rebate(85, T.AVISOS.quente);
    this.relNave += dt * this.ritmo(r);
    this.relLonge += dt;
    for (const s of this.sondas) {
      if (s.morta) continue;
      avanca(s, dt, this.gravidade, 6);
      s.trilha.push([s.x, s.y]);
      if (s.trilha.length > 500) s.trilha.shift();
      const rs = Math.hypot(s.x, s.y);
      if (rs < 75 || rs > 2600) s.morta = true;
    }
    const m = missoes.atual();
    if (m?.id === 'centro' && r < 450 && missoes.conclui('centro')) {
      this.ligado = true;
      toast.mostra(T.AVISOS.apareceu);
      this.timer.depois(3.2, () => cards.enfileira(T.curvatura));
    }
    if (
      m?.id === 'eclipse' &&
      Math.hypot(nave.x - this.raio.fim[0], nave.y - this.raio.fim[1]) < 140 &&
      missoes.conclui('eclipse')
    )
      cards.enfileira(T.eclipse);
    if (m?.id === 'tempo') {
      if (r < 210) this.tPerto += dt;
      if (this.tPerto >= 8 && missoes.conclui('tempo')) {
        cards.enfileira(T.tempo);
        cards.enfileira({ ...T.final, aoFechar: () => fluxo.iniciaFase(4) });
      }
    }
  }

  sync(dt: number): void {
    const ms = this.massas();
    const altura = (x: number, z: number): number => alturaPoco(ms, x, z);
    this.grade.atualiza(altura);
    const ySol = altura(0, 0) + 70 * this.massa;
    this.sol.visible = this.solBrilho.visible = this.massa > 0;
    this.sol.scale.setScalar(Math.max(0.01, this.massa));
    this.sol.position.y = this.solBrilho.position.y = this.luz.position.y = ySol;
    (this.solBrilho.material as THREE.SpriteMaterial).opacity = 0.9 * this.massa;
    this.luz.intensity = 2 * this.massa * LUZ;
    this.sol.rotation.y += dt * 0.05;
    this.terra.position.y = altura(this.terra.position.x, this.terra.position.z) + 18;
    this.terra.rotation.y += dt * 0.5;
    for (const s of this.sondas) {
      s.mesh.visible = !s.morta;
      s.mesh.position.set(s.x, altura(s.x, s.y) + 6, s.y);
      atualizaLinha(s.linha, s.trilha, (x, y) => altura(x, y) + 3);
    }
    for (const o of this.objetosLuz) o.visible = this.mostraRaio;
    this.observatorio.rotation.z += dt;
  }

  overlay(): void {
    const ms = this.massas();
    if (this.massa > 0) rotulo3D(T.ROTULOS.sol, 0, 0, COR.sol, -12, 13, alturaPoco(ms, 0, 0) + 160);
    rotulo3D(
      T.ROTULOS.terra,
      this.terra.position.x,
      this.terra.position.z,
      COR.ink,
      -12,
      12,
      this.terra.position.y + 24,
    );
    if (this.mostraRaio) {
      rotulo3D(T.ROTULOS.estrelaReal, this.raio.ini[0], this.raio.ini[1], '#ffe08a', -16, 13, 10);
      rotulo3D(T.ROTULOS.estrelaAparente, this.aparente[0], this.aparente[1], COR.orbita, -16, 13, 10);
      rotulo3D(T.ROTULOS.observatorio, this.raio.fim[0], this.raio.fim[1], COR.sol, -18, 13, 10);
    }
    desenhaAlvo(missoes.alvoAtual());
  }

  hud(): void {
    const r = Math.hypot(nave.x, nave.y),
      f = this.ritmo(r);
    painel(
      tituloHud('Painel da nave') +
        linhaHud('Distância ao Sol', `${fmt(r / 70, 1)} raios solares`) +
        tituloHud('Relógios (efeito exagerado)', true) +
        linhaHud('Relógio da nave', `${fmt(this.relNave, 1)} s`) +
        linhaHud('Relógio de quem está longe', `${fmt(this.relLonge, 1)} s`) +
        linhaHud('Ritmo do tempo aqui', `${fmt(f * 100, 0)}%`) +
        medidorHud(f) +
        linhaHud('Sondas lançadas', this.lancadas) +
        (missoes.atual()?.id === 'tempo'
          ? linhaHud('Tempo perto do Sol', `${fmt(Math.min(8, this.tPerto), 1)} de 8 s`)
          : ''),
    );
    info(null);
  }
}
