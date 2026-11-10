/** Gráfico do espectro de corpos negros, com as faixas do ultravioleta, do visível e do infravermelho. */
import { COR, rotulo } from '@shared/draw/helpers';
import { FAIXAS_NM, formaPlanck } from '@shared/physics/distancias';

/** Eixo em log10 do comprimento de onda: de 100 nm a 10 000 nm. */
const LOG_MIN = 2;
const LOG_MAX = 4;
/** λ·T do pico de λ·B(λ), em nm·K: com ele, toda curva tem a mesma altura máxima. */
const LAMBDA_T_PICO = 3_669_700;

export type Faixa = 'uv' | 'visivel' | 'iv' | 'tudo';

export interface Curva {
  T: number;
  cor: string;
  nome?: string;
  /** Altura do pico, de 0 a 1: a luminosidade da estrela em relação à mais luminosa do gráfico. */
  escala?: number;
}

export interface RotulosEspectro {
  uv: string;
  visivel: string;
  iv: string;
  nm: (l: number) => string;
}

/**
 * Desenha λ·B(λ) de cada curva. Em eixo logarítmico a área sob a curva é a energia: com `escala` igual à
 * luminosidade relativa, a área de cada faixa mostra quanta luz a estrela emite nela. `destaque` acende uma faixa.
 */
export function graficoEspectro(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  curvas: Curva[],
  rotulos: RotulosEspectro,
  destaque: Faixa = 'tudo',
): void {
  const xDe = (lambda: number): number => x + ((Math.log10(lambda) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * w;
  const xv0 = xDe(FAIXAS_NM.visivelMin);
  const xv1 = xDe(FAIXAS_NM.visivelMax);
  const acesa = (f: Faixa): number => (destaque === 'tudo' || destaque === f ? 1 : 0.35);

  c.globalAlpha = acesa('uv');
  c.fillStyle = 'rgba(150,110,255,.16)';
  c.fillRect(x, y, xv0 - x, h);
  c.globalAlpha = acesa('visivel');
  const arco = c.createLinearGradient(xv0, 0, xv1, 0);
  ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'].forEach((cor, i, l) =>
    arco.addColorStop(i / (l.length - 1), cor),
  );
  c.fillStyle = arco;
  c.globalAlpha *= 0.35;
  c.fillRect(xv0, y, xv1 - xv0, h);
  c.globalAlpha = acesa('iv');
  c.fillStyle = 'rgba(255,90,60,.12)';
  c.fillRect(xv1, y, x + w - xv1, h);
  c.globalAlpha = 1;
  if (destaque !== 'tudo') {
    const [a, b] = destaque === 'uv' ? [x, xv0] : destaque === 'visivel' ? [xv0, xv1] : [xv1, x + w];
    c.strokeStyle = COR.sol;
    c.lineWidth = 2;
    c.strokeRect(a, y, b - a, h);
  }
  rotulo(c, rotulos.uv, (x + xv0) / 2, y + 16, COR.muted, 'center', 11);
  rotulo(c, rotulos.visivel, (xv0 + xv1) / 2, y + 16, COR.ink, 'center', 11);
  rotulo(c, rotulos.iv, (xv1 + x + w) / 2, y + 16, COR.muted, 'center', 11);
  // Num gráfico estreito a faixa do visível fica fina e os dois rótulos se encostariam.
  if (xv1 - xv0 > 56) {
    rotulo(c, rotulos.nm(FAIXAS_NM.visivelMin), xv0, y + h + 14, COR.muted, 'center', 10);
    rotulo(c, rotulos.nm(FAIXAS_NM.visivelMax), xv1, y + h + 14, COR.muted, 'center', 10);
  }

  curvas.forEach((curva) => {
    const pico = LAMBDA_T_PICO / curva.T;
    const escala = curva.escala ?? 1;
    const max = pico * formaPlanck(pico, curva.T);
    c.strokeStyle = curva.cor;
    c.lineWidth = 2.5;
    c.beginPath();
    for (let k = 0; k <= 160; k++) {
      const lambda = 10 ** (LOG_MIN + (k / 160) * (LOG_MAX - LOG_MIN));
      const v = ((lambda * formaPlanck(lambda, curva.T)) / max) * escala;
      const py = y + h - v * (h - 28);
      if (k) c.lineTo(xDe(lambda), py);
      else c.moveTo(xDe(lambda), py);
    }
    c.stroke();
    // Logo acima do pico, mas abaixo da linha com os nomes das faixas.
    const yNome = Math.max(y + 34, y + h - escala * (h - 28) - 8);
    if (curva.nome) rotulo(c, curva.nome, xDe(pico), yNome, curva.cor, 'center', 12);
  });
  c.strokeStyle = COR.muted;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(x, y + h);
  c.lineTo(x + w, y + h);
  c.stroke();
}
