import * as THREE from 'three';
import { LUZ } from '../core/engine';
import { difAngulo, fmt, lerNumero, TAU } from '@shared/math/format';
import { avanca, gravidadeCentral } from '@shared/physics/gravity';
import { linhaHud, medidorHud, tituloHud } from '@shared/ui/hud';
import { COR } from '@shared/draw/helpers';
import { $ } from '@shared/ui/dom';
import type { Fase } from '../types';
import { scene } from '../core/engine';
import { nave, posicionaNave } from '../core/estado';
import { entraMapa, iniciaCamera, rig } from '../core/camera';
import { controlaNave, moveNave, registraTrilha } from '../core/ship';
import { cards, info, missoes, painel, teclasDaFase, toast } from '../core/ui';
import { desenhaAlvo, rotulo3D } from '../core/overlay';
import { fluxo } from '../core/flow';
import { brilho } from '../scene/sprites';
import { atualizaLinha, linhaCirculo, linhaDinamica } from '../scene/common';
import { texNuvens, texRochoso, texTerra } from '../scene/textures';
import * as T from '../content/newton';

/** Raio da Terra no jogo e GM escolhido para a órbita rasante valer 160 u/s (= 7,9 km/s). */
const R = 300;
const GM = 160 * 160 * R;
const KM_POR_U = 6371 / R;
const KMS_POR_U = 7.91 / 160;
const MONTANHA = 18;
const LUA = { d: 3000, r: 82 };

interface Bala {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kms: number;
  trilha: [number, number][];
  ang: number;
  angAnt: number;
  fim: 'caiu' | 'orbita' | 'escapou' | null;
  viva: boolean;
  mesh: THREE.Mesh;
  linha: THREE.Line;
}

const corBala = (b: Bala): number =>
  b.fim === 'orbita' ? 0x7fe0a6 : b.fim === 'escapou' ? 0x73d2ff : b.fim === 'caiu' ? 0xff7f6e : 0xffb547;

export class FaseNewton implements Fase {
  readonly id = 2;
  readonly nome = T.NOME_FASE;
  readonly dMin = 30;
  readonly dMax = 9000;
  readonly escalaNave = 3;
  readonly camFixa = { az: Math.PI / 2, el: 1.5 };
  readonly corTrilha = COR.sol;
  grupo: THREE.Group | null = null;

  private balas: Bala[] = [];
  private resultados: { txt: string; fim: Bala['fim'] }[] = [];
  private angLua = -0.6;
  private canhao = { x: 0, y: -(R + MONTANHA) };
  private escapeVisto = false;
  private luaVista = false;
  private decolou = false;
  private angAcum = 0;
  private angAnt: number | null = null;
  private semMotor = 0;
  private nuvens!: THREE.Mesh;
  private luaMesh!: THREE.Mesh;
  private seta!: THREE.ArrowHelper;
  private grupoBalas!: THREE.Group;

  constructor() {
    this.ligaPainelCanhao();
  }

  private constroi(): void {
    const g = new THREE.Group();
    g.add(new THREE.AmbientLight(0x8890c0, 0.28 * LUZ));
    const luz = new THREE.DirectionalLight(0xfff4e0, 1.35 * LUZ);
    luz.position.set(-1000, 600, 400);
    const solLonge = brilho(0xffc070, 2600, 0.8);
    solLonge.position.set(-20000, 12000, 8000);
    g.add(luz, solLonge);
    g.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R, 72, 48),
        new THREE.MeshStandardMaterial({ map: texTerra(), roughness: 0.9 }),
      ),
    );
    this.nuvens = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.012, 72, 48),
      new THREE.MeshStandardMaterial({ map: texNuvens(), transparent: true, depthWrite: false }),
    );
    const atmosfera = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.07, 64, 40),
      new THREE.MeshBasicMaterial({
        color: 0x6fb4ff,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    g.add(this.nuvens, atmosfera);
    // Montanha e canhão (fora de escala).
    const hM = MONTANHA + 16;
    const montanha = new THREE.Mesh(
      new THREE.ConeGeometry(48, hM, 28),
      new THREE.MeshStandardMaterial({ color: 0x6b6f8f, roughness: 0.95, flatShading: true }),
    );
    montanha.rotation.x = -Math.PI / 2;
    montanha.position.set(0, 0, -(R - 14 + hM / 2));
    const neve = new THREE.Mesh(
      new THREE.ConeGeometry(14, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0xf0f4ff, roughness: 0.7 }),
    );
    neve.rotation.x = -Math.PI / 2;
    neve.position.set(0, 0, -(R + MONTANHA - 3));
    const canhao = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.2, 14, 16),
      new THREE.MeshStandardMaterial({ color: 0xffb547, metalness: 0.6, roughness: 0.35 }),
    );
    canhao.rotation.z = Math.PI / 2;
    canhao.position.set(5, 2, -(R + MONTANHA));
    g.add(
      montanha,
      neve,
      canhao,
      linhaCirculo(2 * R, 0x73d2ff, 0.45, true),
      linhaCirculo(4 * R, 0x73d2ff, 0.22, true),
    );
    this.luaMesh = new THREE.Mesh(
      new THREE.SphereGeometry(LUA.r, 48, 32),
      new THREE.MeshStandardMaterial({
        map: texRochoso('#9a9aa0', ['#7d7d84', '#b8b8bd', '#6a6a70']),
        roughness: 1,
      }),
    );
    this.seta = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 30, 0x73d2ff, 8, 5);
    this.grupoBalas = new THREE.Group();
    g.add(this.luaMesh, this.seta, this.grupoBalas);
    scene.add(g);
    this.grupo = g;
  }

  init(): void {
    this.balas = [];
    this.resultados = [];
    this.angLua = -0.6;
    this.escapeVisto = this.luaVista = this.decolou = false;
    this.angAcum = 0;
    this.angAnt = null;
    this.semMotor = 0;
    $('resultados').innerHTML = '';
    this.constroi();
    this.posicaoInicial();
    iniciaCamera(1050);
    entraMapa();
    missoes.define(this.nome, [
      { id: 'cair', texto: T.MISSOES.cair },
      {
        id: 'doisR',
        texto: T.MISSOES.doisR,
        alvo: () => {
          const a = Math.atan2(nave.y, nave.x);
          return { x: Math.cos(a) * 2 * R, y: Math.sin(a) * 2 * R, nome: '2 raios' };
        },
      },
      {
        id: 'canhao',
        texto: T.MISSOES.canhao,
        alvo: () => ({ x: this.canhao.x, y: this.canhao.y - 20, nome: 'Canhão' }),
      },
      { id: 'orbitaBala', texto: T.MISSOES.orbitaBala },
      { id: 'orbitaNave', texto: T.MISSOES.orbitaNave },
    ]);
    teclasDaFase(T.TECLAS);
    $('canhao').hidden = true;
    cards.enfileira(T.intro);
  }

  private posicaoInicial(): void {
    posicionaNave({ x: R * 3.2, y: -R * 3.2, ang: Math.PI * 0.75 });
  }

  private acopla(): void {
    posicionaNave({ x: this.canhao.x + 26, y: this.canhao.y - 12, ang: 0, acoplada: true });
    $('canhao').hidden = false;
  }

  private posLua(): [number, number] {
    return [Math.cos(this.angLua) * LUA.d, Math.sin(this.angLua) * LUA.d];
  }

  /** Gravidade da Terra mais a da Lua (1/81 da massa). */
  private gravidade = (x: number, y: number): [number, number] => {
    const [ax, ay] = gravidadeCentral(GM, x, y);
    const [lx, ly] = this.posLua();
    const [bx, by] = gravidadeCentral(GM / 81, x - lx, y - ly);
    return [ax + bx, ay + by];
  };

  tecla(k: string): void {
    if (k === 'f' && !$('canhao').hidden) this.dispara();
  }

  update(dt: number): void {
    this.angLua += Math.sqrt(GM / LUA.d ** 3) * dt;
    if (!nave.acoplada) this.atualizaNave(dt);
    this.atualizaBalas(dt);
  }

  private atualizaNave(dt: number): void {
    controlaNave(dt, 110, null, 110);
    moveNave(dt, this.gravidade);
    registraTrilha();
    const r = Math.hypot(nave.x, nave.y);
    if (r < R + 6 && !this.naMontanha(nave.x, nave.y)) return this.bateu(T.AVISOS.caiu);
    const [lx, ly] = this.posLua();
    const dLua = Math.hypot(nave.x - lx, nave.y - ly);
    if (dLua < LUA.r + 6) return this.bateu(T.AVISOS.bateuLua);
    if (!this.luaVista && dLua < LUA.r + 400) {
      this.luaVista = true;
      cards.enfileira(T.lua);
    }
    const m = missoes.atual();
    if (m?.id === 'cair') {
      this.semMotor = nave.motor ? 0 : this.semMotor + dt;
      if (this.semMotor > 2.5 && missoes.conclui('cair')) toast.mostra(T.AVISOS.caindo);
    }
    if (m?.id === 'doisR' && r < 2 * R + 15 && missoes.conclui('doisR')) cards.enfileira(T.distancia);
    if (
      m?.id === 'canhao' &&
      Math.hypot(nave.x - this.canhao.x, nave.y - this.canhao.y) < 130 &&
      missoes.conclui('canhao')
    ) {
      this.acopla();
      cards.enfileira(T.canhao);
    }
    if (m?.id === 'orbitaNave' && this.decolou) {
      const a = Math.atan2(nave.y, nave.x);
      if (this.angAnt !== null) this.angAcum += difAngulo(a, this.angAnt);
      this.angAnt = a;
      if (Math.abs(this.angAcum) >= TAU && missoes.conclui('orbitaNave'))
        cards.enfileira({ ...T.orbitaNave, aoFechar: () => fluxo.iniciaFase(3) });
    }
    const energia = (nave.vx ** 2 + nave.vy ** 2) / 2 - GM / r;
    if (!this.escapeVisto && r > 2500 && energia > 0 && dLua > 600) {
      this.escapeVisto = true;
      cards.enfileira(T.escape);
    }
  }

  private atualizaBalas(dt: number): void {
    for (const b of this.balas) {
      if (!b.viva) continue;
      for (let i = 0; i < 8 && b.viva; i++) {
        avanca(b, dt / 8, this.gravidade, 1);
        const a = Math.atan2(b.y, b.x);
        b.ang += difAngulo(a, b.angAnt);
        b.angAnt = a;
        const r = Math.hypot(b.x, b.y);
        if (r < R) {
          b.viva = false;
          b.fim = 'caiu';
          this.registra(b, `${fmt(b.kms, 1)} km/s: caiu a ${fmt(Math.abs(b.ang) * 6371, 0)} km do canhão`);
        } else if (!b.fim && Math.abs(b.ang) >= TAU) {
          b.fim = 'orbita';
          this.registra(b, `${fmt(b.kms, 1)} km/s: entrou em órbita!`);
          if (missoes.atual()?.id === 'orbitaBala' && missoes.conclui('orbitaBala'))
            cards.enfileira(T.orbitaBala);
        } else if (r > 9000) {
          b.viva = false;
          b.fim = 'escapou';
          this.registra(b, `${fmt(b.kms, 1)} km/s: escapou da Terra`);
        }
      }
      if (b.viva) {
        b.trilha.push([b.x, b.y]);
        if (b.trilha.length > (b.fim === 'orbita' ? 900 : 600)) b.trilha.shift();
      }
    }
  }

  private naMontanha(x: number, y: number): boolean {
    return Math.abs(difAngulo(Math.atan2(y, x), -Math.PI / 2)) < 0.08 && Math.hypot(x, y) > R - 2;
  }

  private bateu(msg: string): void {
    toast.mostra(msg, 4);
    nave.trilha = [];
    const m = missoes.atual();
    if (m && (m.id === 'orbitaBala' || m.id === 'orbitaNave')) {
      this.acopla();
      this.decolou = false;
      this.angAcum = 0;
      this.angAnt = null;
    } else this.posicaoInicial();
  }

  private dispara(): void {
    const kms = parseFloat(($('velCanhao') as HTMLInputElement).value);
    if (this.balas.length >= 6) this.removeBala(this.balas.shift()!);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb547 }),
    );
    const linha = linhaDinamica(900, 0xffb547);
    this.grupoBalas.add(mesh, linha);
    this.balas.push({
      x: this.canhao.x + 12,
      y: this.canhao.y,
      vx: kms / KMS_POR_U,
      vy: 0,
      kms,
      trilha: [],
      ang: 0,
      angAnt: Math.atan2(this.canhao.y, this.canhao.x),
      fim: null,
      viva: true,
      mesh,
      linha,
    });
  }

  private removeBala(b: Bala): void {
    this.grupoBalas.remove(b.mesh, b.linha);
    b.mesh.geometry.dispose();
    b.linha.geometry.dispose();
  }

  private registra(b: Bala, txt: string): void {
    this.resultados.unshift({ txt, fim: b.fim });
    this.resultados = this.resultados.slice(0, 4);
    $('resultados').innerHTML = this.resultados
      .map(
        (r) =>
          `<div style="color:${r.fim === 'orbita' ? COR.ok : r.fim === 'escapou' ? COR.orbita : COR.muted}">${r.txt}</div>`,
      )
      .join('');
  }

  private ligaPainelCanhao(): void {
    const vel = $('velCanhao') as HTMLInputElement;
    $('desafioDados').textContent = T.DESAFIO.dados;
    $('formulaOrbita').innerHTML = T.DESAFIO.formulaOrbita;
    $('formulaEscape').innerHTML = T.DESAFIO.formulaEscape;
    vel.addEventListener('input', () => ($('velTxt').textContent = fmt(parseFloat(vel.value), 1)));
    $('disparar').onclick = () => this.dispara();
    $('limpar').onclick = () => {
      this.balas.forEach((b) => this.removeBala(b));
      this.balas = [];
      this.resultados = [];
      $('resultados').innerHTML = '';
    };
    $('decolar').onclick = () => {
      if (missoes.atual()?.id !== 'orbitaNave') return toast.mostra(T.AVISOS.balaPrimeiro);
      nave.acoplada = false;
      this.decolou = true;
      this.angAcum = 0;
      this.angAnt = null;
      nave.vx = 0;
      nave.vy = -25;
      nave.y -= 6;
      $('canhao').hidden = true;
      toast.mostra(T.AVISOS.decolar, 4);
    };
    $('conferir').onclick = () => {
      const o = lerNumero(($('calcOrb') as HTMLInputElement).value);
      const e = lerNumero(($('calcEsc') as HTMLInputElement).value);
      const res: string[] = [];
      const acertouOrbita = Math.abs(o - 7.91) < 0.25;
      if (!Number.isNaN(o))
        res.push(
          acertouOrbita
            ? `<span style="color:var(--ok)">${T.DESAFIO.acertoOrbita}</span>`
            : `<span style="color:var(--alerta)">${T.DESAFIO.erroOrbita}</span>`,
        );
      if (!Number.isNaN(e))
        res.push(
          Math.abs(e - 11.19) < 0.35
            ? `<span style="color:var(--ok)">${T.DESAFIO.acertoEscape}</span>`
            : `<span style="color:var(--alerta)">${T.DESAFIO.erroEscape}</span>`,
        );
      $('calcRes').innerHTML = res.length ? res.join('<br>') : 'Digite pelo menos um valor em km/s.';
      if (acertouOrbita) {
        vel.value = '7.9';
        $('velTxt').textContent = '7,9';
      }
    };
  }

  sync(dt: number): void {
    this.nuvens.rotation.y += dt * 0.01;
    const [lx, ly] = this.posLua();
    this.luaMesh.position.set(lx, 0, ly);
    this.luaMesh.rotation.y = -this.angLua;
    const escalaMapa = rig.modo === 'mapa';
    for (const b of this.balas) {
      const cor = corBala(b);
      b.mesh.visible = b.viva;
      b.mesh.position.set(b.x, 0, b.y);
      (b.mesh.material as THREE.MeshBasicMaterial).color.setHex(cor);
      b.mesh.scale.setScalar(escalaMapa ? Math.max(1, rig.dist / 500) : 1);
      atualizaLinha(b.linha, b.trilha);
      (b.linha.material as THREE.LineBasicMaterial).color.setHex(cor);
    }
    this.seta.visible = !nave.acoplada;
    if (!nave.acoplada) {
      const [ax, ay] = this.gravidade(nave.x, nave.y);
      const g = Math.hypot(ax, ay),
        k = escalaMapa ? Math.max(0.8, rig.dist / 400) : 1;
      const L = (14 + 50 * Math.min(1, g / (GM / R / R))) * k;
      const dir = new THREE.Vector3(ax / g, 0, ay / g);
      this.seta.position.set(nave.x + dir.x * 10 * k, 0, nave.y + dir.z * 10 * k);
      this.seta.setDirection(dir);
      this.seta.setLength(L, 8 * k, 5 * k);
    }
  }

  overlay(): void {
    rotulo3D('2 raios · gravidade 1/4', 0, -2 * R, 'rgba(115,210,255,.85)', -8);
    rotulo3D('4 raios · gravidade 1/16', 0, -4 * R, 'rgba(115,210,255,.55)', -8);
    const [lx, ly] = this.posLua();
    rotulo3D('Lua (distância fora de escala)', lx, ly, COR.muted, -14, 13, 95);
    rotulo3D('canhão', this.canhao.x, this.canhao.y, COR.sol, -14, 12, 8);
    desenhaAlvo(missoes.alvoAtual());
  }

  hud(): void {
    const r = Math.hypot(nave.x, nave.y),
      frac = (R / r) ** 2;
    painel(
      tituloHud('Painel da nave') +
        linhaHud('Altitude', `${fmt(Math.max(0, (r - R) * KM_POR_U), 0)} km`) +
        linhaHud('Distância ao centro', `${fmt(r / R, 2)} raios`) +
        linhaHud('Velocidade', `${fmt(Math.hypot(nave.vx, nave.vy) * KMS_POR_U, 2)} km/s`) +
        linhaHud('Gravidade aqui', `${fmt(9.8 * frac, 2)} m/s²`) +
        medidorHud(frac) +
        linhaHud('Comparada ao chão', `${frac >= 0.1 ? fmt(frac * 100, 0) : fmt(frac * 100, 1)}%`),
    );
    info(null);
  }
}
