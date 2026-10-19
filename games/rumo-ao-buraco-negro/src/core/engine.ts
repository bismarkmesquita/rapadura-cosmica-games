import * as THREE from 'three';
import { $ } from '@shared/ui/dom';

/** Canvas do WebGL (cena 3D) e canvas 2D por cima, para rótulos e setas. */
export const canvas = $<HTMLCanvasElement>('c');
const canvasOverlay = $<HTMLCanvasElement>('ov');
export const oc = canvasOverlay.getContext('2d') as CanvasRenderingContext2D;

export const tela = { W: innerWidth, H: innerHeight, DPR: Math.min(2, devicePixelRatio || 1) };

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040b);
export const camera = new THREE.PerspectiveCamera(55, tela.W / tela.H, 0.5, 80000);

/**
 * Fator das luzes. Desde a versão 155, o Three.js usa unidades físicas de iluminação;
 * multiplicar por π mantém o mesmo brilho que as cenas tinham no modo antigo.
 */
export const LUZ = Math.PI;

let renderer: THREE.WebGLRenderer | null = null;

/** Cria o WebGL. Devolve false se o navegador não liberar 3D. */
export function iniciaRenderer(): boolean {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch {
    return false;
  }
  renderer.setPixelRatio(tela.DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  redimensiona();
  addEventListener('resize', redimensiona);
  return true;
}

function redimensiona(): void {
  tela.W = innerWidth;
  tela.H = innerHeight;
  renderer?.setSize(tela.W, tela.H);
  camera.aspect = tela.W / tela.H;
  camera.updateProjectionMatrix();
  canvasOverlay.width = tela.W * tela.DPR;
  canvasOverlay.height = tela.H * tela.DPR;
  canvasOverlay.style.width = `${tela.W}px`;
  canvasOverlay.style.height = `${tela.H}px`;
}

export function renderiza(): void {
  renderer?.render(scene, camera);
}

export function limpaOverlay(): void {
  oc.setTransform(tela.DPR, 0, 0, tela.DPR, 0, 0);
  oc.clearRect(0, 0, tela.W, tela.H);
}
