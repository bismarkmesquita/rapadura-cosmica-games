/**
 * Camada 3D (Three.js) atrás do canvas 2D, só para as fases da Oficina. O WebGL nasce na primeira vez que
 * uma fase 3D aparece; se o navegador não liberar, `renderer()` devolve null e a fase avisa.
 */
import * as THREE from 'three';
import { $ } from '@shared/ui/dom';

const canvas3d = $<HTMLCanvasElement>('c3d');

/**
 * Fator das luzes. Desde a versão 155, o Three.js usa unidades físicas de iluminação;
 * multiplicar por π mantém o brilho do modo antigo (mesma regra do outro jogo).
 */
export const LUZ = Math.PI;

let renderer: THREE.WebGLRenderer | null = null;
let falhou = false;

export function renderer3d(): THREE.WebGLRenderer | null {
  if (renderer || falhou) return renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch {
    falhou = true;
  }
  return renderer;
}

export interface Cena3D {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

/** Desenha a cena 3D da fase, ou esconde o canvas 3D quando a fase não tem cena. */
export function desenha3d(cena: Cena3D | null): void {
  canvas3d.hidden = !cena;
  const r = cena && renderer3d();
  if (!cena || !r) return;
  const { innerWidth: w, innerHeight: h } = window;
  const tamanho = r.getSize(new THREE.Vector2());
  if (tamanho.x !== w || tamanho.y !== h) r.setSize(w, h);
  if (cena.camera.aspect !== w / h) {
    cena.camera.aspect = w / h;
    cena.camera.updateProjectionMatrix();
  }
  r.render(cena.scene, cena.camera);
}

/** Libera geometrias e materiais de uma cena que saiu de uso. */
export function descarta(obj: THREE.Object3D): void {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) mat.dispose();
  });
}
