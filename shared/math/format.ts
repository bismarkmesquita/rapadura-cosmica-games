export const TAU = Math.PI * 2;

/** Número no formato brasileiro, com casas decimais fixas: fmt(1234.5, 1) → "1.234,5". */
export function fmt(n: number, casas = 1): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Converte texto digitado ("7,9" ou "7.9") em número; devolve NaN se não for número. */
export function lerNumero(texto: string): number {
  return parseFloat(texto.replace(',', '.'));
}

/** Diferença angular em (-π, π]. */
export function difAngulo(a: number, b: number): number {
  return ((((a - b + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

export const limita = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
