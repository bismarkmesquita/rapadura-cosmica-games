/**
 * Caminho da luz dentro de cada arranjo óptico, num corte do tubo (plano xy). Óptica idealizada: a objetiva
 * manda todo raio paralelo para o foco, e o espelho secundário segue a equação dos espelhos. Unidades da cena:
 * o tubo tem raio 1 e eixo em x; a luz das estrelas entra pela frente (x grande) andando para −x.
 */
export type P2 = [number, number];

export interface Raio {
  pontos: P2[];
  cor: string;
}

export interface Tracado {
  raios: Raio[];
  /** A luz chega focada na ocular. */
  chegou: boolean;
  /** 0 = imagem nítida na ocular; 1 = nada aproveitável. */
  desfoque: number;
}

export type TipoEspelho = 'plano' | 'convexo' | 'concavo';

export const COR_LUZ = '#ffd27a';
/** Luz branca no refrator: o vidro desvia mais o azul, então ele foca antes do vermelho. */
export const CORES_BRANCA: [string, number][] = [
  ['#6ea8ff', 0.96],
  ['#7fe0a6', 1],
  ['#ff7f6e', 1.04],
];

/** Medidas de cada arranjo na cena. */
export const GEOMETRIA = {
  refrator: { tubo: 8, focal: 7.2, ocular: 0.3 },
  newtoniano: { tubo: 9, focal: 7.6, secundario: 6.6, metadeSecundario: 0.45, ocular: 1.5 },
  cassegrain: {
    tubo: 5,
    focal: 4.2,
    furo: 0.25,
    metadeSecundario: 0.35,
    /** Onde a ocular foca, atrás do furo do primário. */
    ocular: -0.8,
    /** |distância focal| do secundário: com ele na posição ideal, o foco cai na ocular. */
    focalSecundario: 2.29,
    posicaoIdeal: 2.8,
    posicaoMin: 2,
    posicaoMax: 3.8,
  },
} as const;

/** Alturas em que os raios entram no tubo: longe do centro, que o secundário tapa. */
const ALTURAS = [-0.85, -0.55, 0.55, 0.85];
/** Onde os raios começam, antes de entrar no tubo, e até onde seguem depois da ocular. */
const ANTES = 3;
const DEPOIS = 1.8;

const normaliza = ([x, y]: P2): P2 => {
  const n = Math.hypot(x, y) || 1;
  return [x / n, y / n];
};

export function tracaRefrator(luzBranca: boolean): Tracado {
  const { tubo, focal, ocular } = GEOMETRIA.refrator;
  const cores: [string, number][] = luzBranca ? CORES_BRANCA : [[COR_LUZ, 1]];
  const raios = cores.flatMap(([cor, k]) =>
    ALTURAS.map((y): Raio => {
      const xf = tubo - focal * k;
      // Depois do foco o raio segue reto até a lente da ocular, que o devolve paralelo ao eixo.
      const yOc = (-y * (xf - ocular)) / (focal * k);
      return {
        cor,
        pontos: [
          [tubo + ANTES, y],
          [tubo, y],
          [xf, 0],
          [ocular, yOc],
          [ocular - DEPOIS, yOc],
        ],
      };
    }),
  );
  return { raios, chegou: true, desfoque: 0 };
}

export function tracaNewtoniano(anguloGraus: number): Tracado {
  const { tubo, focal, secundario, metadeSecundario, ocular } = GEOMETRIA.newtoniano;
  const a = (anguloGraus * Math.PI) / 180;
  const m: P2 = [Math.cos(a), Math.sin(a)];
  let chegaram = 0;
  const raios = ALTURAS.map((y): Raio => {
    const pontos: P2[] = [
      [tubo + ANTES, y],
      [0, y],
    ];
    const d = normaliza([focal, -y]);
    // Encontro com a reta do espelho secundário: (0, y) + s·d = (secundario, 0) + t·m.
    const det = d[0] * -m[1] - d[1] * -m[0];
    const s = (secundario * -m[1] - -y * -m[0]) / det;
    const t = (d[0] * -y - d[1] * secundario) / det;
    if (Math.abs(det) < 1e-9 || s <= 0 || Math.abs(t) > metadeSecundario) {
      // Não bate no secundário: passa pelo foco e sai pela frente do tubo.
      pontos.push([focal, 0], [tubo + 0.5, (y * (tubo + 0.5 - focal)) / focal]);
      return { cor: COR_LUZ, pontos };
    }
    const hit: P2 = [secundario + t * m[0], t * m[1]];
    pontos.push(hit);
    const dot = d[0] * m[0] + d[1] * m[1];
    const r: P2 = [2 * dot * m[0] - d[0], 2 * dot * m[1] - d[1]];
    // Segue até a altura da ocular, até a parede do tubo ou até sair por uma das pontas.
    const passos = [
      r[1] > 0 ? (ocular + 0.6 - hit[1]) / r[1] : Infinity,
      r[1] < 0 ? (-1 - hit[1]) / r[1] : Infinity,
      r[0] > 0 ? (tubo + 0.5 - hit[0]) / r[0] : Infinity,
      r[0] < 0 ? (0 - hit[0]) / r[0] : Infinity,
    ];
    const k = Math.min(...passos);
    const fim: P2 = [hit[0] + k * r[0], hit[1] + k * r[1]];
    pontos.push(fim);
    if (
      r[1] > 0 &&
      k === passos[0] &&
      Math.abs(hit[0] + ((ocular - hit[1]) / r[1]) * r[0] - secundario) < 0.3
    )
      chegaram++;
    return { cor: COR_LUZ, pontos };
  });
  const chegou = chegaram === ALTURAS.length;
  return { raios, chegou, desfoque: chegou ? 0 : 1 };
}

/** Onde o secundário forma a imagem (x), pela equação dos espelhos; null se os raios saem paralelos. */
export function focoCassegrain(tipo: TipoEspelho, xs: number): number | null {
  const { focal, focalSecundario } = GEOMETRIA.cassegrain;
  // Objeto virtual: o foco do primário fica atrás do secundário (distância negativa).
  const p = -(focal - xs);
  const f = tipo === 'plano' ? Infinity : tipo === 'convexo' ? -focalSecundario : focalSecundario;
  const inv = 1 / f - 1 / p;
  if (Math.abs(inv) < 1e-9) return null;
  return xs - 1 / inv;
}

export function tracaCassegrain(tipo: TipoEspelho, xs: number): Tracado {
  const { tubo, focal, furo, metadeSecundario, ocular } = GEOMETRIA.cassegrain;
  const xi = focoCassegrain(tipo, xs);
  let passaram = 0;
  const raios = ALTURAS.map((y): Raio => {
    const pontos: P2[] = [
      [tubo + ANTES, y],
      [0, y],
    ];
    const hit: P2 = [xs, (y * (focal - xs)) / focal];
    if (Math.abs(hit[1]) > metadeSecundario) {
      pontos.push([focal, 0], [tubo + 0.5, (y * (tubo + 0.5 - focal)) / focal]);
      return { cor: COR_LUZ, pontos };
    }
    pontos.push(hit);
    // Depois do secundário, o raio vai para a imagem (xi < xs) ou parece sair dela (imagem virtual, xi > xs).
    const r: P2 =
      xi === null ? [-1, 0] : xi < xs ? normaliza([xi - xs, -hit[1]]) : normaliza([xs - xi, hit[1]]);
    const kPrimario = (0 - hit[0]) / r[0];
    const noPrimario: P2 = [0, hit[1] + kPrimario * r[1]];
    if (r[0] >= 0 || Math.abs(noPrimario[1]) > furo) {
      // Bate no espelho grande, fora do furo.
      pontos.push(r[0] >= 0 ? [tubo + 0.5, hit[1]] : noPrimario);
      return { cor: COR_LUZ, pontos };
    }
    passaram++;
    const kFim = (ocular - DEPOIS - hit[0]) / r[0];
    pontos.push([hit[0] + kFim * r[0], hit[1] + kFim * r[1]]);
    return { cor: COR_LUZ, pontos };
  });
  const erro = xi === null ? Infinity : Math.abs(xi - ocular);
  const chegou = passaram === ALTURAS.length && xi !== null && xi < 0 && erro < 0.6;
  return { raios, chegou, desfoque: passaram === 0 ? 1 : Math.min(1, erro / 1.5) };
}
