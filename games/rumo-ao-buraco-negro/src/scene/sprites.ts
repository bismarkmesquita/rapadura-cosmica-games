import * as THREE from 'three';
import { texBrilho } from './textures';

let texturaBrilho: THREE.Texture | null = null;

/** Mancha de luz que sempre olha para a câmera (brilho do Sol, das estrelas, da chama). */
export function brilho(cor: THREE.ColorRepresentation, tamanho: number, opacidade = 1): THREE.Sprite {
  texturaBrilho ??= texBrilho();
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texturaBrilho,
      color: cor,
      transparent: true,
      opacity: opacidade,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  s.scale.set(tamanho, tamanho, 1);
  s.userData.texturaCompartilhada = true;
  return s;
}
