import * as THREE from 'three';
import { TAU } from '@shared/math/format';
import { camera, scene } from '../core/engine';

let estrelas: THREE.Points | null = null;

/** Céu de fundo: 7.000 estrelas numa esfera enorme que acompanha a câmera. */
export function criaCeu(): void {
  const N = 7000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);
    const R = 30000;
    pos.set([R * s * Math.cos(th), R * u, R * s * Math.sin(th)], i * 3);
    const k = 0.5 + Math.random() * 0.5;
    const tom = Math.random();
    col.set(tom < 0.15 ? [k, k * 0.85, k * 0.7] : tom < 0.3 ? [k * 0.8, k * 0.9, k] : [k, k, k], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  estrelas = new THREE.Points(
    g,
    new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, depthWrite: false }),
  );
  scene.add(estrelas);
}

export function syncCeu(): void {
  estrelas?.position.copy(camera.position);
}
