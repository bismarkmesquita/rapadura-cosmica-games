/**
 * Cena da fase 2: chão, céu girando em volta do polo celeste, Saturno e os dois telescópios (altazimutal e
 * equatorial). Eixos do mundo: x = leste, y = zênite, z = sul (o norte fica em −z).
 */
import * as THREE from 'three';
import { direcaoLocal } from '@shared/physics/ceu';
import { LUZ } from '../core/tres';

const RAD = Math.PI / 180;
const RAIO_CEU = 150;

/** [leste, norte, zênite] para o vetor do mundo. */
export const enuParaMundo = ([e, n, u]: [number, number, number]): THREE.Vector3 =>
  new THREE.Vector3(e, u, -n);

/** Direção, no mundo, de um ponto do céu com ângulo horário H e declinação δ, na latitude φ. */
export const direcaoNoMundo = (H: number, dec: number, lat: number): THREE.Vector3 =>
  enuParaMundo(direcaoLocal(H, dec, lat));

/**
 * Base equatorial da latitude φ: x = equador no meridiano (H = 0), y = polo celeste norte, z = oeste.
 * Uma montagem equatorial alinhada usa a base da latitude do lugar; desalinhada, a de outra latitude.
 */
export function baseEquatorial(lat: number): THREE.Matrix4 {
  return new THREE.Matrix4().makeBasis(
    direcaoNoMundo(0, 0, lat),
    direcaoNoMundo(0, 90, lat),
    direcaoNoMundo(90, 0, lat),
  );
}

const materiais = {
  madeira: new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.8 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x9aa3cf, metalness: 0.6, roughness: 0.35 }),
  escuro: new THREE.MeshStandardMaterial({ color: 0x23202f, roughness: 0.5 }),
  tubo: new THREE.MeshStandardMaterial({ color: 0xedebf5, roughness: 0.45 }),
};

function tuboAoLongo(eixo: 'x' | 'z', comprimento: number, raio: number, centro: number): THREE.Mesh {
  const g = new THREE.CylinderGeometry(raio, raio, comprimento, 32);
  if (eixo === 'x') g.rotateZ(Math.PI / 2);
  else g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, materiais.tubo);
  m.position[eixo] = centro;
  return m;
}

export interface Altaz {
  grupo: THREE.Group;
  giro: THREE.Group;
  inclinacao: THREE.Group;
}

/** Altazimutal tipo dobsoniana: a caixa gira para os lados (azimute) e o tubo sobe e desce (altura). */
function montaAltaz(): Altaz {
  const grupo = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 40), materiais.madeira);
  base.position.y = 0.08;
  const giro = new THREE.Group();
  giro.position.y = 0.16;
  for (const lado of [-1, 1]) {
    const tabua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.9), materiais.madeira);
    tabua.position.set(lado * 0.52, 0.65, 0);
    giro.add(tabua);
  }
  const inclinacao = new THREE.Group();
  inclinacao.position.y = 1.15;
  // O tubo aponta para −z na inclinação zero (o norte, no horizonte).
  inclinacao.add(tuboAoLongo('z', 3, 0.34, -0.55));
  giro.add(inclinacao);
  grupo.add(base, giro);
  return { grupo, giro, inclinacao };
}

export interface Equatorial {
  grupo: THREE.Group;
  /** Gira a base equatorial inteira: a inclinação do eixo polar vem daqui. */
  polar: THREE.Group;
  hora: THREE.Group;
  declinacao: THREE.Group;
}

/** Equatorial alemã: eixo polar (y local), eixo de declinação (z local) e o tubo (x local). */
function montaEquatorial(): Equatorial {
  const grupo = new THREE.Group();
  const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.4, 24), materiais.escuro);
  coluna.position.y = 0.7;
  const polar = new THREE.Group();
  polar.position.y = 1.5;
  const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 20), materiais.metal);
  const hora = new THREE.Group();
  const eixoDec = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16), materiais.metal);
  eixoDec.rotation.x = Math.PI / 2;
  const contrapeso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 24), materiais.escuro);
  contrapeso.rotation.x = Math.PI / 2;
  contrapeso.position.z = -0.75;
  const declinacao = new THREE.Group();
  declinacao.position.z = 0.55;
  declinacao.add(tuboAoLongo('x', 3, 0.3, 0.45));
  hora.add(eixoDec, contrapeso, declinacao);
  polar.add(eixo, hora);
  grupo.add(coluna, polar);
  return { grupo, polar, hora, declinacao };
}

export interface CenaMontagens {
  scene: THREE.Scene;
  ceu: THREE.Group;
  saturno: THREE.Group;
  altaz: Altaz;
  equatorial: Equatorial;
  /** Linha do eixo polar, prolongada até o polo celeste visível. */
  linhaPolar: THREE.Line;
}

/** Estrelas fixas no céu, em coordenadas equatoriais (o grupo do céu gira em volta do polo). */
function estrelasDoCeu(): THREE.Points {
  const pos: number[] = [];
  for (let i = 0; i < 1400; i++) {
    const h = Math.random() * 2 * Math.PI;
    const d = Math.asin(Math.random() * 2 - 1);
    pos.push(
      Math.cos(d) * Math.cos(h) * RAIO_CEU,
      Math.sin(d) * RAIO_CEU,
      Math.cos(d) * Math.sin(h) * RAIO_CEU,
    );
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe5ff, size: 0.9, sizeAttenuation: true }));
}

export function montaCena(): CenaMontagens {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0a18);
  const luz = new THREE.DirectionalLight(0xffffff, 1.0 * LUZ);
  luz.position.set(-4, 9, 7);
  scene.add(new THREE.AmbientLight(0xbfc6ff, 0.5 * LUZ), luz);

  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(80, 64),
    new THREE.MeshStandardMaterial({ color: 0x17221c, roughness: 1 }),
  );
  chao.rotation.x = -Math.PI / 2;
  scene.add(chao);

  const ceu = new THREE.Group();
  ceu.add(estrelasDoCeu());
  scene.add(ceu);

  const saturno = new THREE.Group();
  saturno.add(
    new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe3b35c })),
  );
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.8, 48),
    new THREE.MeshBasicMaterial({ color: 0xf2d39a, side: THREE.DoubleSide }),
  );
  anel.rotation.x = 1.2;
  saturno.add(anel);
  scene.add(saturno);

  const altaz = montaAltaz();
  altaz.grupo.position.x = -2.4;
  const equatorial = montaEquatorial();
  equatorial.grupo.position.x = 2.4;
  const linhaPolar = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 7, 0)]),
    new THREE.LineDashedMaterial({ color: 0xf2a93b, dashSize: 0.25, gapSize: 0.2 }),
  );
  linhaPolar.computeLineDistances();
  equatorial.polar.add(linhaPolar);
  scene.add(altaz.grupo, equatorial.grupo);
  return { scene, ceu, saturno, altaz, equatorial, linhaPolar };
}

/** Orienta o céu: base equatorial do lugar, girada pelo tempo (ângulo horário do ponto de referência). */
export function giraCeu(c: CenaMontagens, lat: number, H: number): void {
  c.ceu.matrixAutoUpdate = false;
  c.ceu.matrix.copy(baseEquatorial(lat)).multiply(new THREE.Matrix4().makeRotationY(-H * RAD));
}

export function poeSaturno(c: CenaMontagens, H: number, dec: number, lat: number): void {
  c.saturno.position.copy(direcaoNoMundo(H, dec, lat).multiplyScalar(RAIO_CEU * 0.9));
  c.saturno.lookAt(0, 0, 0);
}

/** Aponta a altazimutal para altura e azimute (graus). */
export function apontaAltaz(a: Altaz, alt: number, az: number): void {
  a.giro.rotation.y = -az * RAD;
  a.inclinacao.rotation.x = alt * RAD;
}

/**
 * Aponta a equatorial: `latEixo` é a latitude para a qual o eixo polar está inclinado (igual à do lugar se
 * estiver alinhada); H e dec são os ângulos dos dois eixos da montagem.
 */
export function apontaEquatorial(e: Equatorial, latEixo: number, H: number, dec: number): void {
  e.polar.matrixAutoUpdate = false;
  e.polar.matrix.copy(baseEquatorial(latEixo)).setPosition(0, 1.5, 0);
  e.hora.rotation.y = -H * RAD;
  e.declinacao.rotation.z = dec * RAD;
}

/** Para onde aponta a equatorial, no mundo (a mesma conta dos eixos acima). */
export function direcaoEquatorial(latEixo: number, H: number, dec: number): THREE.Vector3 {
  const [h, d] = [H * RAD, dec * RAD];
  return new THREE.Vector3(Math.cos(d) * Math.cos(h), Math.sin(d), Math.cos(d) * Math.sin(h)).applyMatrix4(
    baseEquatorial(latEixo),
  );
}

/** Para onde aponta a altazimutal, no mundo. */
export function direcaoAltaz(alt: number, az: number): THREE.Vector3 {
  const [a, z] = [alt * RAD, az * RAD];
  return new THREE.Vector3(Math.cos(a) * Math.sin(z), Math.sin(a), -Math.cos(a) * Math.cos(z));
}
