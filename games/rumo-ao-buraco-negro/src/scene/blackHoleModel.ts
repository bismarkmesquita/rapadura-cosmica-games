import * as THREE from 'three';
import { texDisco, texHalo } from './textures';
import { brilho } from './sprites';
import { olhaParaCamera } from './common';

export type ModeloBuracoNegro = THREE.Group & { atualiza(dt: number): void };

/**
 * Buraco negro estilizado: sombra (2,6 Rs), anel de fótons, halo de luz curvada e disco de acreção (3 a 11 Rs).
 * A sombra, o anel e o halo sempre olham para a câmera; o disco fica no plano das órbitas.
 */
export function criaBuracoNegro(rs: number): ModeloBuracoNegro {
  const g = new THREE.Group() as ModeloBuracoNegro;
  const aditivo = {
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  };
  const sombra = new THREE.Mesh(
    new THREE.CircleGeometry(2.6 * rs, 64),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(2.55 * rs, 2.8 * rs, 96),
    new THREE.MeshBasicMaterial({ color: 0xffe2b0, opacity: 0.95, ...aditivo }),
  );
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.8 * rs, 4.4 * rs, 96),
    new THREE.MeshBasicMaterial({ map: texHalo(), opacity: 0.75, ...aditivo }),
  );
  const disco = new THREE.Mesh(
    new THREE.RingGeometry(3 * rs, 11 * rs, 160, 6),
    new THREE.MeshBasicMaterial({ map: texDisco(), ...aditivo }),
  );
  disco.rotation.x = -Math.PI / 2;
  g.add(sombra, anel, halo, disco, brilho(0xff9a40, 26 * rs, 0.4));
  g.atualiza = (dt: number) => {
    for (const b of [sombra, anel, halo]) olhaParaCamera(b);
    disco.rotation.z += dt * 0.25;
  };
  return g;
}
