/**
 * Cena da fase 2: chão com os pontos cardeais, céu girando em volta do polo celeste, Saturno e os dois telescópios
 * (altazimutal e equatorial). Eixos do mundo: x = leste, y = zênite, z = sul (o norte fica em −z).
 */
import * as THREE from 'three';
import { COR } from '@shared/draw/helpers';
import { direcaoLocal } from '@shared/physics/ceu';
import { LUZ } from '../core/tres';

const RAD = Math.PI / 180;
const RAIO_CEU = 150;
/** Distância da marca do polo e de Saturno: um pouco à frente das estrelas. */
const RAIO_MARCAS = RAIO_CEU * 0.9;

export const POS_ALTAZ = -2.8;
export const POS_EQUATORIAL = 2.8;

/**
 * Medidas da equatorial. O tubo gira afastado do pilar: `polar` o sobe ao longo do eixo polar e `dec` o tira para o
 * lado. Com estas medidas ele não toca o pilar, a cabeça nem o chão em nenhuma posição acima do horizonte, nas
 * três cidades e com o eixo desalinhado (só no Polo Norte a inclinação precisa de um mínimo; veja a fase).
 */
const EQ = { pilar: 1.6, polar: 1, dec: 0.7, contrapeso: 0.9, frente: 1.9, tras: 0.75, raio: 0.25 };

/** Cor de cada eixo, no modelo e no rótulo. */
export const COR_EIXO = { ar: COR.sol, dec: COR.orbita, az: COR.ok, alt: '#ff9ec4' };

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
  escuro: new THREE.MeshStandardMaterial({ color: 0x3a3650, roughness: 0.5 }),
  pilar: new THREE.MeshStandardMaterial({ color: 0x6f7184, roughness: 0.85 }),
  tubo: new THREE.MeshStandardMaterial({ color: 0xedebf5, roughness: 0.45 }),
};

/** Cilindro ao longo de um eixo do grupo, de `de` até `ate`. */
function barra(
  eixo: 'x' | 'y' | 'z',
  de: number,
  ate: number,
  raio: number,
  mat: THREE.Material,
): THREE.Mesh {
  const g = new THREE.CylinderGeometry(raio, raio, Math.abs(ate - de), 28);
  if (eixo === 'x') g.rotateZ(Math.PI / 2);
  else if (eixo === 'z') g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position[eixo] = (de + ate) / 2;
  return m;
}

/** Linha fina e colorida que mostra um eixo de giro. */
const eixoVisivel = (eixo: 'x' | 'y' | 'z', de: number, ate: number, cor: string): THREE.Mesh =>
  barra(eixo, de, ate, 0.018, new THREE.MeshBasicMaterial({ color: cor }));

export interface Altaz {
  grupo: THREE.Group;
  giro: THREE.Group;
  inclinacao: THREE.Group;
  rotuloAz: THREE.Object3D;
  rotuloAlt: THREE.Object3D;
}

/** Altazimutal tipo dobsoniana: a caixa gira para os lados (azimute) e o tubo sobe e desce (altura). */
function montaAltaz(): Altaz {
  const PIVO = 1.15;
  const grupo = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 40), materiais.madeira);
  base.position.y = 0.08;
  const giro = new THREE.Group();
  giro.position.y = 0.16;
  const piso = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.06, 0.9), materiais.madeira);
  piso.position.y = 0.03;
  giro.add(piso);
  for (const lado of [-1, 1]) {
    const tabua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.9), materiais.madeira);
    tabua.position.set(lado * 0.52, 0.65, 0);
    const mancal = barra('x', lado * 0.34, lado * 0.5, 0.17, materiais.metal);
    mancal.position.y = PIVO;
    giro.add(tabua, mancal);
  }
  const inclinacao = new THREE.Group();
  inclinacao.position.y = PIVO;
  // O tubo aponta para −z na inclinação zero (o norte, no horizonte).
  const focalizador = barra('y', 0.34, 0.5, 0.07, materiais.escuro);
  focalizador.position.z = -1.7;
  inclinacao.add(
    barra('z', 0.95, -2.05, 0.34, materiais.tubo),
    barra('z', -2.05, -2.17, 0.36, materiais.escuro),
    barra('z', 0.95, 1.02, 0.36, materiais.escuro),
    focalizador,
  );
  const eixoAlt = eixoVisivel('x', -0.95, 0.95, COR_EIXO.alt);
  eixoAlt.position.y = PIVO;
  const rotuloAlt = new THREE.Object3D();
  rotuloAlt.position.set(1.15, PIVO, 0);
  giro.add(inclinacao, eixoAlt, rotuloAlt);
  const rotuloAz = new THREE.Object3D();
  rotuloAz.position.y = 3;
  grupo.add(base, giro, eixoVisivel('y', 0, 2.9, COR_EIXO.az), rotuloAz);
  return { grupo, giro, inclinacao, rotuloAz, rotuloAlt };
}

const PONTOS_ARCO = 33;

export interface Equatorial {
  grupo: THREE.Group;
  /** Gira a base equatorial inteira: a inclinação do eixo polar vem daqui. */
  polar: THREE.Group;
  /** Corpo do eixo polar: cresce para o polo visível (o sul, no hemisfério sul). */
  corpo: THREE.Group;
  hora: THREE.Group;
  declinacao: THREE.Group;
  /** Plano vertical do ângulo de inclinação, com o horizonte de um lado e o eixo polar do outro. */
  angulo: THREE.Group;
  arco: THREE.Line;
  rotuloAr: THREE.Object3D;
  rotuloDec: THREE.Object3D;
  rotuloAngulo: THREE.Object3D;
}

/**
 * Equatorial alemã num pilar: eixo polar, ou de ascensão reta (y local), eixo de declinação (z local) com o
 * contrapeso numa ponta e o tubo (x local) na outra.
 */
function montaEquatorial(): Equatorial {
  const grupo = new THREE.Group();
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32), materiais.pilar);
  flange.position.y = 0.04;
  const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, EQ.pilar, 24), materiais.pilar);
  coluna.position.y = EQ.pilar / 2;
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), materiais.escuro);
  cabeca.position.y = EQ.pilar;

  const corpo = new THREE.Group();
  const circulo = barra('y', 0.42, 0.48, 0.2, materiais.escuro);
  const rotuloAr = new THREE.Object3D();
  rotuloAr.position.y = EQ.polar + 1.65;
  const pontaPolo = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, RAIO_MARCAS, 0)]),
    new THREE.LineBasicMaterial({ color: COR_EIXO.ar }),
  );
  corpo.add(
    barra('y', 0, EQ.polar + 0.12, 0.12, materiais.metal),
    circulo,
    eixoVisivel('y', -0.3, EQ.polar + 1.6, COR_EIXO.ar),
    pontaPolo,
    rotuloAr,
  );

  const hora = new THREE.Group();
  const declinacao = new THREE.Group();
  declinacao.position.z = EQ.dec;
  const sela = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.09, 0.05), materiais.escuro);
  sela.position.z = -EQ.raio - 0.02;
  declinacao.add(
    barra('x', -EQ.tras, EQ.frente, EQ.raio, materiais.tubo),
    barra('x', EQ.frente, EQ.frente + 0.1, EQ.raio + 0.02, materiais.escuro),
    barra('x', -EQ.tras - 0.05, -EQ.tras, EQ.raio + 0.02, materiais.escuro),
    barra('x', -EQ.tras - 0.2, -EQ.tras - 0.05, 0.07, materiais.escuro),
    sela,
  );
  const rotuloDec = new THREE.Object3D();
  rotuloDec.position.z = -EQ.contrapeso - 0.75;
  hora.add(
    barra('z', -0.3, 0.3, 0.1, materiais.metal),
    barra('z', -EQ.contrapeso - 0.2, EQ.dec - EQ.raio, 0.045, materiais.metal),
    barra('z', -EQ.contrapeso - 0.12, -EQ.contrapeso + 0.12, 0.2, materiais.escuro),
    eixoVisivel('z', -EQ.contrapeso - 0.7, EQ.dec + EQ.raio + 0.5, COR_EIXO.dec),
    declinacao,
    rotuloDec,
  );

  const polar = new THREE.Group();
  polar.matrixAutoUpdate = false;
  polar.add(corpo, hora);

  const angulo = new THREE.Group();
  angulo.position.y = EQ.pilar;
  const horizonte = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1.5)]),
    new THREE.LineBasicMaterial({ color: COR.ink }),
  );
  const geoArco = new THREE.BufferGeometry();
  geoArco.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PONTOS_ARCO * 3), 3));
  const arco = new THREE.Line(geoArco, new THREE.LineBasicMaterial({ color: COR_EIXO.ar }));
  arco.frustumCulled = false;
  const rotuloAngulo = new THREE.Object3D();
  angulo.add(horizonte, arco, rotuloAngulo);

  grupo.add(flange, coluna, cabeca, polar, angulo);
  return { grupo, polar, corpo, hora, declinacao, angulo, arco, rotuloAr, rotuloDec, rotuloAngulo };
}

export interface CenaMontagens {
  scene: THREE.Scene;
  ceu: THREE.Group;
  saturno: THREE.Group;
  marcaPolo: THREE.Group;
  altaz: Altaz;
  equatorial: Equatorial;
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

/** Linhas norte–sul e leste–oeste no chão, até o horizonte, e um círculo em volta dos telescópios. */
function rosaNoChao(): THREE.Group {
  const rosa = new THREE.Group();
  const faixa = (largura: number, comprimento: number, cor: number): THREE.Mesh => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(largura, comprimento),
      new THREE.MeshBasicMaterial({ color: cor }),
    );
    m.rotation.x = -Math.PI / 2;
    return m;
  };
  const leste = faixa(0.1, 156, 0x4a5378);
  leste.rotation.z = Math.PI / 2;
  const anel = new THREE.Mesh(
    new THREE.RingGeometry(8.9, 9, 96),
    new THREE.MeshBasicMaterial({ color: 0x4a5378 }),
  );
  anel.rotation.x = -Math.PI / 2;
  rosa.add(faixa(0.14, 156, 0x8a6a2a), leste, anel);
  rosa.position.y = 0.02;
  return rosa;
}

/** A marca do polo na esfera celeste: alvo com cruz e dois círculos que as estrelas percorrem em volta dele. */
function marcaDoPolo(): THREE.Group {
  const marca = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: COR_EIXO.ar, side: THREE.DoubleSide });
  const fraco = new THREE.MeshBasicMaterial({
    color: COR_EIXO.ar,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.25,
  });
  const graus = (g: number): number => RAIO_MARCAS * Math.tan(g * RAD);
  marca.add(
    new THREE.Mesh(new THREE.RingGeometry(graus(2.2), graus(2.5), 48), mat),
    new THREE.Mesh(new THREE.PlaneGeometry(graus(1.2), 0.3), mat),
    new THREE.Mesh(new THREE.PlaneGeometry(0.3, graus(1.2)), mat),
    new THREE.Mesh(new THREE.RingGeometry(graus(15), graus(15) + 0.25, 96), fraco),
    new THREE.Mesh(new THREE.RingGeometry(graus(30), graus(30) + 0.25, 96), fraco),
  );
  return marca;
}

export function montaCena(): CenaMontagens {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0a18);
  const luz = new THREE.DirectionalLight(0xffffff, 1.0 * LUZ);
  luz.position.set(-4, 9, 7);
  scene.add(new THREE.AmbientLight(0xbfc6ff, 0.5 * LUZ), luz);

  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(80, 64),
    new THREE.MeshStandardMaterial({
      color: 0x17221c,
      roughness: 1,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  );
  chao.rotation.x = -Math.PI / 2;
  scene.add(chao, rosaNoChao());

  const ceu = new THREE.Group();
  ceu.matrixAutoUpdate = false;
  ceu.add(estrelasDoCeu());
  scene.add(ceu);

  const marcaPolo = marcaDoPolo();
  scene.add(marcaPolo);

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
  altaz.grupo.position.x = POS_ALTAZ;
  const equatorial = montaEquatorial();
  equatorial.grupo.position.x = POS_EQUATORIAL;
  scene.add(altaz.grupo, equatorial.grupo);
  return { scene, ceu, saturno, marcaPolo, altaz, equatorial };
}

/** Orienta o céu: base equatorial do lugar, girada pelo tempo (ângulo horário do ponto de referência). */
export function giraCeu(c: CenaMontagens, lat: number, H: number): void {
  c.ceu.matrix.copy(baseEquatorial(lat)).multiply(new THREE.Matrix4().makeRotationY(-H * RAD));
  c.ceu.matrixWorldNeedsUpdate = true;
}

export function poeSaturno(c: CenaMontagens, H: number, dec: number, lat: number): void {
  c.saturno.position.copy(direcaoNoMundo(H, dec, lat).multiplyScalar(RAIO_MARCAS));
  c.saturno.lookAt(0, 0, 0);
}

/** Põe a marca do polo celeste visível nesta latitude. */
export function poePolo(c: CenaMontagens, lat: number): void {
  c.marcaPolo.position.copy(direcaoNoMundo(0, lat < 0 ? -90 : 90, lat).multiplyScalar(RAIO_MARCAS));
  c.marcaPolo.lookAt(0, 0, 0);
}

/** Aponta a altazimutal para altura e azimute (graus). */
export function apontaAltaz(a: Altaz, alt: number, az: number): void {
  a.giro.rotation.y = -az * RAD;
  a.inclinacao.rotation.x = alt * RAD;
}

/**
 * Aponta a equatorial: `latEixo` é a latitude para a qual o eixo polar está inclinado (igual à do lugar se
 * estiver alinhada); `sul` diz para que polo ele aponta; H e dec são os ângulos dos dois eixos da montagem.
 */
export function apontaEquatorial(e: Equatorial, latEixo: number, sul: boolean, H: number, dec: number): void {
  const sinal = sul ? -1 : 1;
  e.polar.matrix.copy(baseEquatorial(latEixo)).setPosition(0, EQ.pilar, 0);
  e.polar.matrixWorldNeedsUpdate = true;
  e.corpo.scale.y = sinal;
  e.hora.position.y = sinal * EQ.polar;
  e.hora.rotation.y = -H * RAD;
  e.declinacao.rotation.z = dec * RAD;
  desenhaAngulo(e, Math.abs(latEixo), sul);
}

/** O arco da inclinação, do horizonte (do lado do polo) até o eixo polar. */
function desenhaAngulo(e: Equatorial, graus: number, sul: boolean): void {
  e.angulo.scale.z = sul ? 1 : -1;
  const pos = e.arco.geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < PONTOS_ARCO; i++) {
    const a = (graus * RAD * i) / (PONTOS_ARCO - 1);
    pos.setXYZ(i, 0, Math.sin(a), Math.cos(a));
  }
  pos.needsUpdate = true;
  const meio = (graus * RAD) / 2;
  e.rotuloAngulo.position.set(0, 1.3 * Math.sin(meio), 1.3 * Math.cos(meio));
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
