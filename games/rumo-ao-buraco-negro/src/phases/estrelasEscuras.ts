import * as THREE from 'three';
import { LUZ } from '../core/engine';
import { fmt } from '@shared/math/format';
import { gravidadeCentral } from '@shared/physics/gravity';
import { linhaHud, medidorHud, tituloHud } from '@shared/ui/hud';
import { COR } from '@shared/draw/helpers';
import type { Fase } from '../types';
import { scene } from '../core/engine';
import { nave, posicionaNave } from '../core/estado';
import { iniciaCamera, olhaDeLonge, rig, saiMapa } from '../core/camera';
import { controlaNave, moveNave, registraTrilha } from '../core/ship';
import { acao, cards, info, missoes, painel, teclasDaFase } from '../core/ui';
import { desenhaAlvo, rotulo3D } from '../core/overlay';
import { fluxo } from '../core/flow';
import { brilho } from '../scene/sprites';
import { alturaPoco, criaGrade, type Grade, type MassaGrade } from '../scene/grid';
import { criaBuracoNegro, type ModeloBuracoNegro } from '../scene/blackHoleModel';
import { texEstrelaAzul } from '../scene/textures';
import { rebate } from './util';
import * as T from '../content/estrelasEscuras';

const GM = 3e6;
const ORIGEM = new THREE.Vector3(0, 0, 0);
type Estado = keyof typeof T.ESTADOS;

/** Fração de 0 a 1 do tempo t entre a e b. */
const entre = (t: number, a: number, b: number): number => Math.min(1, Math.max(0, (t - a) / (b - a)));

export class FaseEstrelasEscuras implements Fase {
  readonly id = 4;
  readonly nome = T.NOME_FASE;
  readonly dMin = 30;
  readonly dMax = 9000;
  readonly escalaNave = 3;
  readonly corTrilha = COR.orbita;
  grupo: THREE.Group | null = null;

  private estadoEstrela: Estado = 'estrela';
  private tColapso = 0;
  private suavidadeGrade = 120;
  private luz!: THREE.PointLight;
  private estrela!: THREE.Mesh;
  private brilho1!: THREE.Sprite;
  private brilho2!: THREE.Sprite;
  private grade!: Grade;
  private buraco!: ModeloBuracoNegro;
  private clarao!: THREE.Sprite;
  private casca!: THREE.Mesh;

  private constroi(): void {
    const g = new THREE.Group();
    g.add(new THREE.AmbientLight(0x8890c0, 0.3 * LUZ));
    this.luz = new THREE.PointLight(0xbfd8ff, 2.2 * LUZ, 0, 0);
    this.estrela = new THREE.Mesh(
      new THREE.SphereGeometry(120, 64, 40),
      new THREE.MeshBasicMaterial({ map: texEstrelaAzul(), color: 0xffffff }),
    );
    this.brilho1 = brilho(0x8fb8ff, 900, 0.9);
    this.brilho2 = brilho(0x5f8cff, 2400, 0.35);
    this.grade = criaGrade(4400, 67, 133);
    this.buraco = criaBuracoNegro(30);
    this.buraco.visible = false;
    this.clarao = brilho(0xffffff, 10, 0);
    this.casca = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x9fd0ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    // A estrela fica no fundo do poço inicial da grade (alturaPoco com s = 120 dá ≈ −173).
    for (const o of [this.estrela, this.brilho1, this.brilho2, this.luz]) o.position.y = -53;
    g.add(
      this.luz,
      this.estrela,
      this.brilho1,
      this.brilho2,
      this.grade,
      this.buraco,
      this.clarao,
      this.casca,
    );
    scene.add(g);
    this.grupo = g;
  }

  init(): void {
    this.estadoEstrela = 'estrela';
    this.tColapso = 0;
    this.suavidadeGrade = 120;
    this.constroi();
    posicionaNave({ x: 0, y: 1900, ang: -Math.PI / 2 });
    iniciaCamera(2600);
    missoes.define(this.nome, [
      { id: 'chegar', texto: T.MISSOES.chegar, alvo: () => ({ x: 0, y: 0, nome: 'Estrela gigante' }) },
      { id: 'colapso', texto: T.MISSOES.colapso },
      { id: 'calculo', texto: T.MISSOES.calculo },
    ]);
    teclasDaFase(T.TECLAS);
    cards.enfileira(T.intro);
  }

  private massas(): MassaGrade[] {
    return [{ x: 0, z: 0, A: 22000, s: this.suavidadeGrade }];
  }

  alvoCamera(): THREE.Vector3 | null {
    return this.estadoEstrela === 'colapso' ? ORIGEM : null;
  }

  update(dt: number): void {
    if (this.estadoEstrela === 'colapso') return this.animaColapso(dt);
    controlaNave(dt, 110, 360, 110);
    moveNave(dt, (x, y) => gravidadeCentral(GM, x, y, 300));
    registraTrilha();
    if (this.estadoEstrela === 'bn') rebate(110, T.AVISOS.pertoBuraco);
    else rebate(140, T.AVISOS.pertoEstrela);
    if (missoes.atual()?.id === 'chegar' && Math.hypot(nave.x, nave.y) < 800 && missoes.conclui('chegar')) {
      cards.enfileira({ ...T.michell, aoFechar: () => this.mostraBotaoColapso() });
    }
  }

  private mostraBotaoColapso(): void {
    const b = T.BOTAO_COLAPSO;
    acao.botao(b.eyebrow, b.titulo, b.texto, b.rotulo, () => this.iniciaColapso());
  }

  private iniciaColapso(): void {
    acao.esconde();
    this.estadoEstrela = 'colapso';
    this.tColapso = 0;
    nave.vx = nave.vy = 0;
    nave.motor = false;
    rig.dist = Math.max(rig.dist, 600);
    olhaDeLonge(new THREE.Vector3(nave.x, 0, nave.y), Math.atan2(nave.y, nave.x), 0.4, 1700);
  }

  /** Cena de corte de 9,5 s: a estrela incha, explode e o núcleo vira buraco negro. */
  private animaColapso(dt: number): void {
    const t = (this.tColapso += dt);
    const incha = entre(t, 0, 3.5),
      encolhe = entre(t, 3.5, 4.3);
    this.estrela.visible = t < 4.3;
    this.estrela.scale.setScalar((1 + 0.8 * incha) * (1 - encolhe) + 0.001);
    (this.estrela.material as THREE.MeshBasicMaterial).color.setRGB(1, 1 - 0.5 * incha, 1 - 0.72 * incha);
    const corBrilho = (this.brilho1.material as THREE.SpriteMaterial).color;
    corBrilho.setRGB(0.56 + 0.44 * incha, 0.72 - 0.3 * incha, 1 - 0.75 * incha);
    (this.brilho2.material as THREE.SpriteMaterial).color.copy(corBrilho);
    this.brilho1.visible = this.brilho2.visible = t < 4.4;
    this.brilho1.scale.setScalar(900 * (1 + 0.6 * incha));
    this.luz.intensity = 2.2 * (1 - encolhe) * LUZ;
    const acende = entre(t, 3.5, 4.1),
      apaga = entre(t, 4.1, 6);
    this.clarao.scale.setScalar(10 + 3800 * acende);
    (this.clarao.material as THREE.SpriteMaterial).opacity = acende > 0 ? 1 - apaga : 0;
    const onda = entre(t, 3.7, 8.5);
    this.casca.scale.setScalar(150 + 2300 * onda);
    (this.casca.material as THREE.MeshBasicMaterial).opacity = onda > 0 && onda < 1 ? 0.55 * (1 - onda) : 0;
    this.buraco.visible = t > 4.2;
    this.buraco.scale.setScalar(Math.max(0.01, entre(t, 4.2, 5.6)));
    this.suavidadeGrade = 120 - 110 * entre(t, 4.2, 6.8);
    if (t > 9.5) {
      this.estadoEstrela = 'bn';
      saiMapa();
      missoes.conclui('colapso');
      cards.enfileira({ ...T.schwarzschild, aoFechar: () => this.mostraDesafio() });
    }
  }

  private mostraDesafio(): void {
    const d = T.DESAFIO;
    acao.calculo({
      titulo: d.titulo,
      texto: d.texto,
      formula: d.formula,
      unidade: d.unidade,
      resposta: d.resposta,
      tolerancia: d.tolerancia,
      msgAcerto: d.acerto,
      aoTerminar: () => {
        missoes.conclui('calculo');
        cards.enfileira({ ...T.wheeler, aoFechar: () => fluxo.iniciaFase(5) });
      },
    });
  }

  sync(dt: number): void {
    const ms = this.massas();
    this.grade.atualiza((x: number, z: number) => alturaPoco(ms, x, z));
    if (this.estadoEstrela !== 'colapso') {
      const ehEstrela = this.estadoEstrela === 'estrela';
      this.estrela.visible = this.brilho1.visible = this.brilho2.visible = ehEstrela;
      this.buraco.visible = !ehEstrela;
      if (!ehEstrela) this.buraco.scale.setScalar(1);
    }
    this.estrela.rotation.y += dt * 0.04;
    this.buraco.atualiza(dt);
  }

  overlay(): void {
    if (this.estadoEstrela === 'estrela')
      rotulo3D(T.ROTULOS.estrela, 0, 0, '#b9d4ff', -12, 13, alturaPoco(this.massas(), 0, 0) + 300);
    if (this.estadoEstrela === 'bn') rotulo3D(T.ROTULOS.buracoNegro, 0, 0, COR.sol, -12, 13, 140);
    desenhaAlvo(missoes.alvoAtual());
  }

  hud(): void {
    const r = Math.hypot(nave.x, nave.y),
      g = GM / (r * r + 300);
    painel(
      tituloHud('Painel da nave') +
        linhaHud('Objeto', T.ESTADOS[this.estadoEstrela]) +
        linhaHud('Massa', '~25 sóis (não muda)') +
        linhaHud('Distância ao centro', `${fmt(r, 0)} u`) +
        linhaHud('Puxão da gravidade aqui', `${fmt(g, 1)} u/s²`) +
        medidorHud(g / 150),
    );
    info(null);
  }
}
