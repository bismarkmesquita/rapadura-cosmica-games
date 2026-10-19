import * as THREE from 'three';
import { LUZ } from '../core/engine';
import { fmt, TAU } from '@shared/math/format';
import { anomaliaExcentrica } from '@shared/physics/kepler';
import { gravidadeCentral, ritmoDoTempo } from '@shared/physics/gravity';
import { linhaHud, medidorHud, tituloHud } from '@shared/ui/hud';
import { COR } from '@shared/draw/helpers';
import type { Fase } from '../types';
import { scene } from '../core/engine';
import { nave, posicionaNave } from '../core/estado';
import { iniciaCamera } from '../core/camera';
import { controlaNave, limitaVelocidade, moveNave, registraTrilha } from '../core/ship';
import { acao, cards, info, missoes, painel, teclasDaFase, toast } from '../core/ui';
import { desenhaAlvo, escurece, rotulo3D, vinheta } from '../core/overlay';
import { fluxo } from '../core/flow';
import { brilho } from '../scene/sprites';
import { criaBuracoNegro, type ModeloBuracoNegro } from '../scene/blackHoleModel';
import * as T from '../content/buracoNegro';

/** Raio do horizonte no jogo, "velocidade da luz" do jogo e GM coerente: Rs = 2GM/c². */
const RS = 60;
const C_JOGO = 400;
const GM = (RS * C_JOGO * C_JOGO) / 2;

interface EstrelaS {
  a: number;
  e: number;
  M0: number;
  T: number;
  q: THREE.Quaternion;
  sprite: THREE.Sprite;
}

export class FaseBuracoNegro implements Fase {
  readonly id = 5;
  readonly nome = T.NOME_FASE;
  readonly dMin = 30;
  readonly dMax = 12000;
  readonly escalaNave = 3;
  /** A nave voa um pouco acima do disco de acreção. */
  readonly alturaVoo = 45;
  readonly corTrilha = COR.orbita;
  grupo: THREE.Group | null = null;

  private t = 0;
  private fim = false;
  private tFim = 0;
  private cardsFinais = false;
  private avisoSemVolta = false;
  private relNave = 0;
  private relLonge = 0;
  private buraco!: ModeloBuracoNegro;
  private estrelas: EstrelaS[] = [];

  private constroi(): void {
    const g = new THREE.Group();
    g.add(new THREE.AmbientLight(0xa0a8d0, 0.5 * LUZ), new THREE.PointLight(0xffb070, 1.4 * LUZ, 0, 0));
    this.buraco = criaBuracoNegro(RS);
    g.add(this.buraco);
    this.estrelas = [];
    const orbitas: [number, number, number, number, number][] = [
      [900, 0.88, 0, 0, 0.9],
      [650, 0.6, 1.1, 0.6, 0.4],
      [1200, 0.7, 2.2, -0.5, 0.8],
      [500, 0.4, 3.6, 0.3, -0.7],
      [1050, 0.8, 4.8, 1.0, 0.25],
    ];
    for (const [a, e, M0, eixo, ang] of orbitas) {
      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(Math.cos(eixo), 0, Math.sin(eixo)),
        ang,
      );
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 200; i++) {
        const E = (i / 200) * TAU;
        pts.push(
          new THREE.Vector3(a * (Math.cos(E) - e), 0, a * Math.sqrt(1 - e * e) * Math.sin(E)).applyQuaternion(
            q,
          ),
        );
      }
      g.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: 0x73d2ff, transparent: true, opacity: 0.22 }),
        ),
      );
      const sprite = brilho(0xdfe8ff, 70, 1);
      g.add(sprite);
      this.estrelas.push({ a, e, M0, T: 30 * Math.pow(a / 900, 1.5), q, sprite });
    }
    scene.add(g);
    this.grupo = g;
  }

  init(): void {
    Object.assign(this, {
      t: 0,
      fim: false,
      tFim: 0,
      cardsFinais: false,
      avisoSemVolta: false,
      relNave: 0,
      relLonge: 0,
    });
    this.constroi();
    posicionaNave({ x: 0, y: 3400, ang: -Math.PI / 2 });
    iniciaCamera(3200);
    const centro = (nome: string) => () => ({ x: 0, y: 0, nome });
    missoes.define(this.nome, [
      { id: 'estrelas', texto: T.MISSOES.estrelas, alvo: centro('Sagitário A*') },
      { id: 'disco', texto: T.MISSOES.disco, alvo: centro('Disco') },
      { id: 'perto', texto: T.MISSOES.perto, alvo: centro('Horizonte') },
      { id: 'horizonte', texto: T.MISSOES.horizonte, alvo: centro('Horizonte') },
    ]);
    teclasDaFase(T.TECLAS);
    cards.enfileira(T.intro);
  }

  private ritmo(r: number): number {
    return ritmoDoTempo(RS, r);
  }

  /** A nave estica perto do horizonte (espaguetificação, exagerada). */
  esticamento(): number {
    const r = Math.hypot(nave.x, nave.y);
    return 1 + 2.5 * Math.min(1, Math.pow((2 * RS) / Math.max(r, RS), 3));
  }

  update(dt: number): void {
    this.t += dt;
    if (this.fim) {
      this.tFim += dt;
      nave.motor = false;
      if (this.tFim > 2.6 && !this.cardsFinais) {
        this.cardsFinais = true;
        cards.enfileira({
          ...T.horizonte,
          aoFechar: () => cards.enfileira({ ...T.resumo, aoFechar: () => fluxo.vaiMenu() }),
        });
      }
      return;
    }
    controlaNave(dt, 110, 360, 110);
    moveNave(dt, (x, y) => gravidadeCentral(GM, x, y));
    limitaVelocidade(C_JOGO * 0.98);
    registraTrilha();
    const r = Math.hypot(nave.x, nave.y);
    this.relNave += dt * this.ritmo(r);
    this.relLonge += dt;
    const m = missoes.atual();
    if (m?.id === 'estrelas' && r < 1400 && missoes.conclui('estrelas')) cards.enfileira(T.estrelas);
    else if (m?.id === 'disco' && r < 700 && missoes.conclui('disco'))
      cards.enfileira({ ...T.disco, aoFechar: () => this.mostraDesafio() });
    else if (m?.id === 'perto' && r < 2 * RS && missoes.conclui('perto')) cards.enfileira(T.perto);
    if (r < 1.3 * RS && !this.avisoSemVolta) {
      this.avisoSemVolta = true;
      toast.mostra(T.AVISOS.semVolta);
    }
    if (r <= RS) {
      this.fim = true;
      missoes.concluiTodas();
      acao.esconde();
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
    });
  }

  sync(dt: number): void {
    this.buraco.atualiza(dt);
    for (const s of this.estrelas) {
      const E = anomaliaExcentrica(s.M0 + (TAU * this.t) / s.T, s.e);
      s.sprite.position
        .set(s.a * (Math.cos(E) - s.e), 0, s.a * Math.sqrt(1 - s.e * s.e) * Math.sin(E))
        .applyQuaternion(s.q);
    }
  }

  overlay(): void {
    rotulo3D(T.ROTULOS.buraco, 0, 0, COR.ink, -10, 13, 5 * RS);
    const s2 = this.estrelas[0].sprite.position;
    rotulo3D(T.ROTULOS.s2, s2.x, s2.z, COR.sol, -10, 12, s2.y + 20);
    const r = Math.hypot(nave.x, nave.y);
    vinheta('120,10,0', 0.55 * Math.min(1, Math.pow((2 * RS) / Math.max(r, RS), 2)));
    if (this.fim) escurece(this.tFim / 2);
    else desenhaAlvo(missoes.alvoAtual());
  }

  hud(): void {
    const r = Math.hypot(nave.x, nave.y),
      f = this.ritmo(r);
    const escape = Math.min(1, Math.sqrt((2 * GM) / Math.max(r, RS)) / C_JOGO);
    painel(
      tituloHud('Painel da nave') +
        linhaHud('Distância ao centro', `${fmt(r / RS, 1)} raios do horizonte`) +
        linhaHud('Sua velocidade', `${fmt((Math.hypot(nave.vx, nave.vy) / C_JOGO) * 100, 0)}% da luz`) +
        linhaHud('Escape aqui exige', `${fmt(escape * 100, 0)}% da luz`) +
        medidorHud(escape, 'var(--alerta)') +
        tituloHud('Tempo', true) +
        linhaHud('Ritmo do tempo aqui', `${fmt(f * 100, 0)}%`) +
        linhaHud('1 segundo seu vale', f > 0.01 ? `${fmt(1 / f, 1)} s lá fora` : '∞') +
        linhaHud('Relógio da nave', `${fmt(this.relNave, 1)} s`) +
        linhaHud('Relógio de longe', `${fmt(this.relLonge, 1)} s`),
    );
    info(null);
  }
}
