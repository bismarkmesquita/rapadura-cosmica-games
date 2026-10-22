import * as THREE from 'three';
import { difAngulo, limita } from '@shared/math/format';
import { camera, tela } from './engine';
import { estado, nave } from './estado';
import { mouse } from './input';

/**
 * Três modos de câmera:
 * - terceira: atrás da nave, como nos jogos 3D (padrão);
 * - primeira: na cabine;
 * - mapa: vista de cima, girando em volta de um alvo (usado no menu, na fase de Newton e na tecla M).
 */
export type ModoCamera = 'terceira' | 'primeira' | 'mapa';

export const rig = {
  modo: 'terceira' as ModoCamera,
  // modo mapa
  az: Math.PI / 2,
  el: 0.8,
  dist: 300,
  distAlvo: 300,
  distMapa: 900,
  alvo: new THREE.Vector3(),
  // terceira e primeira pessoa
  camAng: 0,
  offAz: 0,
  dist3: 12,
  dist3Alvo: 12,
  el3: 0.22,
  pular: true,
};

const posAlvo = new THREE.Vector3();
const olhar = new THREE.Vector3();
/** Posição da câmera em relação à nave, na terceira pessoa (suavizada). */
const deslocamento = new THREE.Vector3();

/** Altura do plano de voo da fase atual. */
export const Y0 = (): number => estado.fase?.alturaVoo ?? 0;

export function iniciaCamera(distMapa: number): void {
  Object.assign(rig, {
    modo: 'terceira',
    camAng: nave.ang,
    offAz: 0,
    el3: 0.22,
    dist3: 12,
    dist3Alvo: 12,
    distMapa,
    pular: true,
  });
  rig.alvo.set(nave.x, Y0(), nave.y);
}

export function entraMapa(): void {
  const fixa = estado.fase?.camFixa;
  rig.modo = 'mapa';
  rig.alvo.set(nave.x, Y0(), nave.y);
  rig.az = fixa ? fixa.az : nave.ang + Math.PI;
  rig.el = fixa ? fixa.el : 1.15;
  rig.dist = rig.distAlvo = rig.distMapa;
  mouse.mirar = true;
}

export function saiMapa(): void {
  if (estado.fase?.camFixa) return;
  Object.assign(rig, { modo: 'terceira', camAng: nave.ang, offAz: 0, pular: true });
}

/** Mira de um ponto do mundo (usada nas cenas de corte, como o colapso da estrela). */
export function olhaDeLonge(alvo: THREE.Vector3, az: number, el: number, dist: number): void {
  rig.modo = 'mapa';
  rig.alvo.copy(alvo);
  rig.az = az;
  rig.el = el;
  rig.distAlvo = dist;
}

export function escalaNave(): number {
  const f = estado.fase;
  if (!f) return 1;
  return rig.modo === 'mapa' ? Math.max(f.escalaNave, rig.dist / 120) : f.escalaNave;
}

/** Quanto o mouse pede para virar (−1 a 1), pela distância ao centro da tela. */
export function giroMouse(): number {
  if (!mouse.dentro || mouse.dir) return 0;
  const off = (mouse.x - tela.W / 2) / (tela.W / 2);
  const zonaMorta = 0.06;
  if (Math.abs(off) < zonaMorta) return 0;
  return Math.sign(off) * Math.min(1, (Math.abs(off) - zonaMorta) / 0.6);
}

export function arrastaCamera(dx: number, dy: number): void {
  const f = estado.fase;
  if (f && rig.modo !== 'mapa') {
    rig.offAz = limita(rig.offAz + dx * 0.006, -Math.PI, Math.PI);
    rig.el3 = limita(rig.el3 + dy * 0.004, -0.15, 1.2);
  } else if (!f?.camFixa) {
    rig.az += dx * 0.006;
    rig.el = limita(rig.el + dy * 0.005, 0.06, 1.5);
  }
}

export function rolaCamera(deltaY: number): void {
  const f = estado.fase;
  if (!f) return;
  const fator = Math.exp(deltaY * 0.0012);
  if (rig.modo === 'mapa') rig.distAlvo = limita(rig.distAlvo * fator, f.dMin, f.dMax);
  else rig.dist3Alvo = limita(rig.dist3Alvo * fator, 5, 45);
}

export function atualizaCamera(dt: number, alvo: THREE.Vector3): void {
  const f = estado.fase;
  if (!f || rig.modo === 'mapa') {
    rig.alvo.lerp(alvo, Math.min(1, dt * 5));
    rig.dist += (rig.distAlvo - rig.dist) * Math.min(1, dt * 6);
    const ce = Math.cos(rig.el);
    const se = Math.sin(rig.el);
    camera.position.set(
      rig.alvo.x + rig.dist * ce * Math.cos(rig.az),
      rig.alvo.y + rig.dist * se,
      rig.alvo.z + rig.dist * ce * Math.sin(rig.az),
    );
    camera.lookAt(rig.alvo);
    return;
  }
  const s = f.escalaNave;
  rig.camAng += difAngulo(nave.ang, rig.camAng) * Math.min(1, dt * 4);
  if (!mouse.dir) rig.offAz *= Math.exp(-dt * 2.5);
  rig.dist3 += (rig.dist3Alvo - rig.dist3) * Math.min(1, dt * 6);
  if (rig.modo === 'terceira') {
    const a = rig.camAng + rig.offAz;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const D = rig.dist3 * s;
    // Suaviza só o deslocamento em relação à nave, não a posição: perseguir a posição deixava a câmera
    // para trás proporcionalmente à velocidade, e esse atraso mudava a cada quadro mais longo (tela tremendo).
    posAlvo.set(-cx * D * Math.cos(rig.el3), D * Math.sin(rig.el3), -cz * D * Math.cos(rig.el3));
    if (rig.pular) {
      deslocamento.copy(posAlvo);
      rig.pular = false;
    } else deslocamento.lerp(posAlvo, 1 - Math.exp(-dt * 12));
    camera.position.set(nave.x + deslocamento.x, Y0() + deslocamento.y, nave.y + deslocamento.z);
    olhar.set(nave.x + cx * D * 0.5, D * 0.04 + Y0(), nave.y + cz * D * 0.5);
  } else {
    const a = nave.ang + rig.offAz;
    const inclinacao = -(rig.el3 - 0.22);
    camera.position.set(
      nave.x + Math.cos(nave.ang) * 2.6 * s,
      0.75 * s + Y0(),
      nave.y + Math.sin(nave.ang) * 2.6 * s,
    );
    olhar.set(
      camera.position.x + Math.cos(a) * Math.cos(inclinacao) * 100,
      camera.position.y + Math.sin(inclinacao) * 100,
      camera.position.z + Math.sin(a) * Math.cos(inclinacao) * 100,
    );
    rig.pular = true;
  }
  camera.lookAt(olhar);
}

const raio = new THREE.Raycaster();
const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const vtmp = new THREE.Vector3();

/** Ponto do plano de voo sob o cursor, em coordenadas do jogo [x, y]. */
export function pontoSobCursor(sx: number, sy: number): [number, number] | null {
  plano.constant = -Y0();
  ndc.set((sx / tela.W) * 2 - 1, -(sy / tela.H) * 2 + 1);
  raio.setFromCamera(ndc, camera);
  const hit = raio.ray.intersectPlane(plano, vtmp);
  return hit ? [hit.x, hit.z] : null;
}

/** Projeta um ponto do jogo (x, y, altura) na tela. Devolve [sx, sy, atrásDaCâmera]. */
export function projeta(x: number, y: number, h = 0): [number, number, boolean] {
  vtmp.set(x, h, y).project(camera);
  return [((vtmp.x + 1) / 2) * tela.W, ((1 - vtmp.y) / 2) * tela.H, vtmp.z > 1];
}
