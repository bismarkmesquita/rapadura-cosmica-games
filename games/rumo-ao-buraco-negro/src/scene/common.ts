import * as THREE from 'three';
import { TAU } from '@shared/math/format';
import { camera, scene } from '../core/engine';

/** Remove um grupo da cena e libera memória da placa de vídeo. */
export function descartaGrupo(g: THREE.Group | null): void {
  if (!g) return;
  scene.remove(g);
  g.traverse((o: THREE.Object3D) => {
    const obj = o as THREE.Mesh;
    if (!(o as THREE.Sprite).isSprite) obj.geometry?.dispose();
    const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
    for (const m of mats) {
      const map = (m as THREE.MeshBasicMaterial).map;
      if (map && !o.userData.texturaCompartilhada) map.dispose();
      m.dispose();
    }
  });
}

/** Círculo no plano de voo, contínuo ou tracejado. */
export function linhaCirculo(r: number, cor: number, opacidade: number, tracejada = false): THREE.Line {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * TAU;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const m = tracejada
    ? new THREE.LineDashedMaterial({
        color: cor,
        transparent: true,
        opacity: opacidade,
        dashSize: r * 0.03,
        gapSize: r * 0.03,
      })
    : new THREE.LineBasicMaterial({ color: cor, transparent: true, opacity: opacidade });
  const l = new THREE.Line(g, m);
  if (tracejada) l.computeLineDistances();
  return l;
}

/** Linha de N pontos, atualizável a cada quadro (rastros de sondas e balas). */
export function linhaDinamica(maxPontos: number, cor: number, opacidade = 0.85): THREE.Line {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxPontos * 3), 3));
  g.setDrawRange(0, 0);
  const l = new THREE.Line(
    g,
    new THREE.LineBasicMaterial({ color: cor, transparent: true, opacity: opacidade }),
  );
  l.frustumCulled = false;
  return l;
}

export function atualizaLinha(
  l: THREE.Line,
  pontos: [number, number][],
  altura: (x: number, y: number) => number = () => 0,
): void {
  const a = l.geometry.attributes.position as THREE.BufferAttribute;
  pontos.forEach(([x, y], i) => a.setXYZ(i, x, altura(x, y), y));
  a.needsUpdate = true;
  l.geometry.setDrawRange(0, pontos.length);
}

/** Faz um objeto plano sempre olhar para a câmera. */
export function olhaParaCamera(o: THREE.Object3D): void {
  o.quaternion.copy(camera.quaternion);
}
