/**
 * Modelo 3D de cada arranjo óptico, com o caminho da luz. O eixo do tubo fica em x (a luz entra pelo lado
 * de x grande) e o corte com os raios, no plano z = 0. Cada peça leva `userData.peca` para o clique.
 */
import * as THREE from 'three';
import { focoCassegrain, GEOMETRIA, type P2, type TipoEspelho, type Tracado } from '@shared/physics/optica';
import type { Arranjo } from '../core/telescopio';

export interface Modelo {
  grupo: THREE.Group;
  tubo: THREE.Mesh;
  /** Centro do telescópio, para a câmera girar em volta. */
  centro: THREE.Vector3;
  /** Onde a luz forma a imagem (plano focal), para o rótulo do Avançado. */
  foco: THREE.Vector3 | null;
  /** Fótons andando pelos raios: cada um com o caminho e a fração já andada. */
  fotons: { mesh: THREE.Mesh; caminho: P2[]; f: number }[];
}

export interface Ajustes {
  angulo: number;
  tipo: TipoEspelho;
  posicao: number;
}

const RAIO_LUZ = 0.03;
/** Fótons por raio: o bastante para ver a luz correndo, sem poluir. */
const FOTONS_POR_RAIO = 3;

const material = {
  tubo: (): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: 0x3b3f63, roughness: 0.6, side: THREE.DoubleSide }),
  espelho: (): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({
      color: 0xd9e2f2,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
    }),
  vidro: (): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.45, roughness: 0.1 }),
  peca: (): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color: 0x23202f, roughness: 0.5 }),
};

function peca(geo: THREE.BufferGeometry, mat: THREE.Material, id: string): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.userData.peca = id;
  return m;
}

/** Cilindro com o eixo em x, de x0 a x1. */
function cilindroX(
  raio: number,
  x0: number,
  x1: number,
  mat: THREE.Material,
  id: string,
  aberto = false,
): THREE.Mesh {
  const g = new THREE.CylinderGeometry(raio, raio, Math.abs(x1 - x0), 48, 1, aberto);
  g.rotateZ(Math.PI / 2);
  const m = peca(g, mat, id);
  m.position.x = (x0 + x1) / 2;
  return m;
}

/** Cilindro em pé (eixo y), de y0 a y1, na posição x. */
function cilindroY(
  raio: number,
  x: number,
  y0: number,
  y1: number,
  mat: THREE.Material,
  id: string,
): THREE.Mesh {
  const m = peca(new THREE.CylinderGeometry(raio, raio, Math.abs(y1 - y0), 32), mat, id);
  m.position.set(x, (y0 + y1) / 2, 0);
  return m;
}

function raios(tracado: Tracado, grupo: THREE.Group): Modelo['fotons'] {
  const fotons: Modelo['fotons'] = [];
  for (const r of tracado.raios) {
    const caminho = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < r.pontos.length; i++) {
      const [a, b] = [r.pontos[i - 1], r.pontos[i]];
      caminho.add(new THREE.LineCurve3(new THREE.Vector3(a[0], a[1], 0), new THREE.Vector3(b[0], b[1], 0)));
    }
    const mat = new THREE.MeshBasicMaterial({ color: r.cor, transparent: true, opacity: 0.85 });
    grupo.add(new THREE.Mesh(new THREE.TubeGeometry(caminho, 24 * (r.pontos.length - 1), RAIO_LUZ, 6), mat));
    for (let k = 0; k < FOTONS_POR_RAIO; k++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      grupo.add(mesh);
      fotons.push({ mesh, caminho: r.pontos, f: k / FOTONS_POR_RAIO });
    }
  }
  return fotons;
}

/** Ponto a uma fração `f` (0 a 1) do comprimento do caminho. */
export function pontoNoCaminho(caminho: P2[], f: number): P2 {
  const trechos = caminho.slice(1).map((p, i) => Math.hypot(p[0] - caminho[i][0], p[1] - caminho[i][1]));
  let resta = f * trechos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < trechos.length; i++) {
    if (resta <= trechos[i]) {
      const k = trechos[i] ? resta / trechos[i] : 0;
      const [a, b] = [caminho[i], caminho[i + 1]];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
    resta -= trechos[i];
  }
  return caminho[caminho.length - 1];
}

export function montaModelo(arranjo: Arranjo, tracado: Tracado, a: Ajustes): Modelo {
  const g = new THREE.Group();
  let tuboLen: number;
  let foco: THREE.Vector3 | null = null;

  if (arranjo === 'refrator') {
    const { tubo, focal, ocular } = GEOMETRIA.refrator;
    tuboLen = tubo;
    const lente = peca(new THREE.SphereGeometry(0.95, 48, 24), material.vidro(), 'objetiva');
    lente.scale.set(0.12, 1, 1);
    lente.position.x = tubo;
    g.add(lente, cilindroX(0.28, -0.2, ocular + 0.25, material.peca(), 'ocular'));
    foco = new THREE.Vector3(tubo - focal, 0, 0);
  } else if (arranjo === 'newtoniano') {
    const { tubo, secundario, metadeSecundario, ocular } = GEOMETRIA.newtoniano;
    tuboLen = tubo;
    const sec = peca(
      new THREE.BoxGeometry(metadeSecundario * 2, 0.04, 0.5),
      material.espelho(),
      'secundario',
    );
    sec.position.x = secundario;
    sec.rotation.z = (a.angulo * Math.PI) / 180;
    g.add(
      cilindroX(0.95, -0.15, 0.05, material.espelho(), 'primario'),
      sec,
      cilindroY(0.26, secundario, 0.95, ocular - 0.1, material.peca(), 'focalizador'),
      cilindroY(0.18, secundario, ocular - 0.1, ocular + 0.4, material.peca(), 'ocular'),
    );
    foco = new THREE.Vector3(secundario, ocular - 0.5, 0);
  } else {
    const { tubo, furo, metadeSecundario, ocular, posicaoIdeal } = GEOMETRIA.cassegrain;
    tuboLen = tubo;
    const xs = arranjo === 'sct' ? posicaoIdeal : a.posicao;
    const tipo: TipoEspelho = arranjo === 'sct' ? 'convexo' : a.tipo;
    const prim = peca(new THREE.RingGeometry(furo, 0.95, 48), material.espelho(), 'primario');
    prim.rotation.y = Math.PI / 2;
    g.add(
      prim,
      cilindroX(metadeSecundario, xs, xs + 0.08, material.espelho(), 'secundario'),
      cilindroX(0.22, -0.05, ocular + 0.25, material.peca(), 'focalizador'),
      cilindroX(0.16, ocular + 0.25, ocular - 0.35, material.peca(), 'ocular'),
    );
    if (arranjo === 'sct') g.add(cilindroX(0.96, tubo - 0.03, tubo + 0.03, material.vidro(), 'corretora'));
    const xi = focoCassegrain(tipo, xs);
    foco = xi === null ? null : new THREE.Vector3(xi, 0, 0);
  }

  const tubo = cilindroX(1, 0, tuboLen, material.tubo(), 'tubo', true);
  g.add(tubo);
  const fotons = raios(tracado, g);
  return { grupo: g, tubo, centro: new THREE.Vector3(tuboLen / 2, 0.2, 0), foco, fotons };
}

/** Tubo transparente mostra a luz por dentro; opaco mostra o telescópio como ele é. */
export function tuboTransparente(m: Modelo, sim: boolean): void {
  const mat = m.tubo.material as THREE.MeshStandardMaterial;
  mat.transparent = sim;
  mat.opacity = sim ? 0.16 : 1;
  mat.depthWrite = !sim;
  mat.needsUpdate = true;
}

/** Faz os fótons andarem: `passo` em fração do caminho. */
export function andaFotons(m: Modelo, passo: number): void {
  for (const fo of m.fotons) {
    fo.f = (fo.f + passo) % 1;
    const [x, y] = pontoNoCaminho(fo.caminho, fo.f);
    fo.mesh.position.set(x, y, 0);
  }
}
