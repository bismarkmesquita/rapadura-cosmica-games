import * as THREE from 'three';

/** Uma massa que afunda a grade do espaço-tempo. A = profundidade, s = suavidade (tamanho do objeto). */
export interface MassaGrade {
  x: number;
  z: number;
  A: number;
  s: number;
}

const BORDA2 = 2200 * 2200;

/** Altura da grade num ponto: soma dos poços de cada massa, com o fundo limitado. */
export function alturaPoco(massas: MassaGrade[], x: number, z: number): number {
  let y = 0;
  for (const m of massas) {
    const dx = x - m.x;
    const dz = z - m.z;
    y -= m.A * (1 / Math.sqrt(dx * dx + dz * dz + m.s * m.s) - 1 / Math.sqrt(BORDA2 + m.s * m.s));
  }
  return Math.max(-2600, y);
}

export type Grade = THREE.LineSegments & { atualiza(altura: (x: number, z: number) => number): void };

/** Grade do espaço-tempo: linhas que afundam e mudam de cor com a profundidade. */
export function criaGrade(tamanho: number, nLinhas: number, pontosPorLinha: number): Grade {
  const v: number[] = [];
  const passo = tamanho / (pontosPorLinha - 1);
  for (let i = 0; i < nLinhas; i++) {
    const u = -tamanho / 2 + (i * tamanho) / (nLinhas - 1);
    for (let j = 0; j < pontosPorLinha - 1; j++) {
      const a = -tamanho / 2 + j * passo;
      const b = a + passo;
      v.push(u, a, u, b, a, u, b, u);
    }
  }
  const N = v.length / 2;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const metade2 = (tamanho / 2) ** 2;
  for (let i = 0; i < N; i++) {
    pos[i * 3] = v[i * 2];
    pos[i * 3 + 2] = v[i * 2 + 1];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const linhas = new THREE.LineSegments(
    g,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 }),
  ) as unknown as Grade;
  linhas.frustumCulled = false;
  linhas.atualiza = (altura: (x: number, z: number) => number) => {
    for (let i = 0; i < N; i++) {
      const x = pos[i * 3];
      const z = pos[i * 3 + 2];
      const y = altura(x, z);
      pos[i * 3 + 1] = y;
      const fundo = Math.min(1, -y / 400);
      const borda = Math.max(0, 1 - (x * x + z * z) / metade2);
      col[i * 3] = (0.16 + 0.84 * fundo) * borda;
      col[i * 3 + 1] = (0.38 + 0.32 * fundo) * borda;
      col[i * 3 + 2] = (0.72 - 0.45 * fundo) * borda;
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  };
  return linhas;
}
