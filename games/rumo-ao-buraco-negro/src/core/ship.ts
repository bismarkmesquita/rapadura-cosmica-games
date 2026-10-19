import * as THREE from 'three';
import { avanca } from '@shared/physics/gravity';
import { difAngulo } from '@shared/math/format';
import { scene } from './engine';
import { estado, nave } from './estado';
import { escalaNave, giroMouse, pontoSobCursor, rig, Y0 } from './camera';
import { mouse, pressionada } from './input';
import { brilho } from '../scene/sprites';

const TAM_TRILHA = 180;

const modelo = {
  grupo: new THREE.Group(),
  chama: null as THREE.Mesh | null,
  brilhoChama: null as THREE.Sprite | null,
  trilha: null as THREE.Line | null,
};

/** Monta a nave 3D (uma vez, ao iniciar o jogo). */
export function criaModeloNave(): void {
  const g = modelo.grupo;
  const metal = new THREE.MeshStandardMaterial({ color: 0xdfe5ff, metalness: 0.55, roughness: 0.35 });
  const escuro = new THREE.MeshStandardMaterial({ color: 0x4a5490, metalness: 0.4, roughness: 0.5 });
  const corpo = new THREE.Mesh(new THREE.ConeGeometry(1, 4.2, 16), metal);
  corpo.rotation.z = -Math.PI / 2;
  const asa = new THREE.Mesh(new THREE.BoxGeometry(2, 0.16, 4.6), escuro);
  asa.position.x = -0.9;
  const leme = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 0.14), escuro);
  leme.position.set(-1.3, 0.65, 0);
  const cabine = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x73d2ff, emissive: 0x2a7aa0, roughness: 0.2 }),
  );
  cabine.position.set(0.35, 0.45, 0);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.7, 16), escuro);
  motor.rotation.z = Math.PI / 2;
  motor.position.x = -2.2;
  const chama = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 2.6, 12),
    new THREE.MeshBasicMaterial({
      color: 0xffb547,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  chama.rotation.z = Math.PI / 2;
  chama.position.x = -3.8;
  const brilhoChama = brilho(0xffa040, 4, 0.9);
  brilhoChama.position.x = -2.8;
  g.add(corpo, asa, leme, cabine, motor, chama, brilhoChama);
  g.rotation.order = 'YXZ';
  scene.add(g);
  modelo.chama = chama;
  modelo.brilhoChama = brilhoChama;

  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TAM_TRILHA * 3), 3));
  const trilha = new THREE.Line(
    tg,
    new THREE.LineBasicMaterial({ color: 0x73d2ff, transparent: true, opacity: 0.55 }),
  );
  trilha.frustumCulled = false;
  scene.add(trilha);
  modelo.trilha = trilha;
}

/**
 * Lê o teclado e o mouse e aplica giro, motor e freio.
 * Na terceira/primeira pessoa, o mouse para os lados vira a nave; no mapa, a nave aponta para o cursor.
 */
export function controlaNave(dt: number, acel: number, maxV: number | null, freio: number): void {
  const giro = pressionada('a', 'arrowleft') ? -1 : pressionada('d', 'arrowright') ? 1 : 0;
  const antes = nave.ang;
  if (rig.modo !== 'mapa') nave.ang += (giro || giroMouse()) * 2.2 * dt;
  else if (giro) nave.ang += giro * 2.6 * dt;
  else if (mouse.mirar && !mouse.dir) {
    const p = pontoSobCursor(mouse.x, mouse.y);
    if (p && Math.hypot(p[0] - nave.x, p[1] - nave.y) > 8) {
      const d = difAngulo(Math.atan2(p[1] - nave.y, p[0] - nave.x), nave.ang);
      nave.ang += Math.max(-6 * dt, Math.min(6 * dt, d));
    }
  }
  nave.giro += ((nave.ang - antes) / Math.max(dt, 1e-4) - nave.giro) * Math.min(1, dt * 6);
  const turbo = pressionada('shift') ? 2.5 : 1;
  nave.motor = pressionada('w', 'arrowup') || mouse.down;
  if (nave.motor) {
    nave.vx += Math.cos(nave.ang) * acel * turbo * dt;
    nave.vy += Math.sin(nave.ang) * acel * turbo * dt;
  }
  if (pressionada('s', 'arrowdown')) {
    const v = Math.hypot(nave.vx, nave.vy);
    if (v > 0) {
      const dv = Math.min(v, freio * dt);
      nave.vx -= (nave.vx / v) * dv;
      nave.vy -= (nave.vy / v) * dv;
    }
  }
  if (maxV) limitaVelocidade(maxV * turbo);
}

export function limitaVelocidade(max: number): void {
  const v = Math.hypot(nave.vx, nave.vy);
  if (v > max) {
    nave.vx *= max / v;
    nave.vy *= max / v;
  }
}

/** Avança a nave sob uma aceleração (gravidade) qualquer. */
export function moveNave(dt: number, aceleracao: (x: number, y: number) => [number, number]): void {
  avanca(nave, dt, aceleracao, 4);
}

export function registraTrilha(): void {
  nave.trilha.push([nave.x, nave.y]);
  if (nave.trilha.length > TAM_TRILHA) nave.trilha.shift();
}

/** Atualiza o modelo 3D a partir do estado da nave. */
export function syncNave(): void {
  const f = estado.fase;
  const g = modelo.grupo;
  const trilha = modelo.trilha!;
  g.visible = !!f && rig.modo !== 'primeira';
  trilha.visible = false;
  if (!f || !g.visible) return;
  g.position.set(nave.x, Y0(), nave.y);
  g.rotation.y = -nave.ang;
  g.rotation.x = Math.max(-0.7, Math.min(0.7, nave.giro * 0.25));
  const s = escalaNave();
  g.scale.setScalar(s);
  if (f.esticamento) {
    const k = f.esticamento();
    g.scale.set(s * k, s / Math.sqrt(k), s / Math.sqrt(k));
  }
  const fogo = nave.motor && !nave.acoplada;
  modelo.chama!.visible = fogo;
  modelo.brilhoChama!.visible = fogo;
  if (fogo) modelo.chama!.scale.set(1, (0.8 + Math.random() * 0.5) * (pressionada('shift') ? 1.6 : 1), 1);
  const a = trilha.geometry.attributes.position as THREE.BufferAttribute;
  const y0 = Y0();
  nave.trilha.forEach(([x, y], i) => a.setXYZ(i, x, y0, y));
  a.needsUpdate = true;
  trilha.geometry.setDrawRange(0, nave.trilha.length);
  (trilha.material as THREE.LineBasicMaterial).color.set(f.corTrilha);
  trilha.visible = nave.trilha.length > 1;
}
