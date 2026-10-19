/**
 * Construtor de fórmulas em MathML, que o navegador desenha sem bibliotecas.
 *
 * Exemplo, v = √(GM/R):
 *   M.bloco(M.v('v') + M.o('=') + M.raiz(M.fr(M.v('G') + M.v('M'), M.v('R'))))
 */
export const M = {
  /** Fórmula em destaque, numa linha só. */
  bloco: (s: string): string => `<math display="block">${s}</math>`,
  /** Fórmula no meio do texto. */
  linha: (s: string): string => `<math>${s}</math>`,
  fr: (num: string, den: string): string => `<mfrac><mrow>${num}</mrow><mrow>${den}</mrow></mfrac>`,
  raiz: (s: string): string => `<msqrt>${s}</msqrt>`,
  pot: (base: string, exp: string): string => `<msup><mrow>${base}</mrow><mrow>${exp}</mrow></msup>`,
  ind: (base: string, ind: string): string => `<msub><mrow>${base}</mrow><mrow>${ind}</mrow></msub>`,
  /** Variável (itálico). */
  v: (x: string): string => `<mi>${x}</mi>`,
  /** Número. */
  n: (x: string | number): string => `<mn>${x}</mn>`,
  /** Operador ou parêntese. */
  o: (x: string): string => `<mo>${x}</mo>`,
  /** Texto comum dentro da fórmula. */
  t: (x: string): string => `<mtext>${x}</mtext>`,
  /** Espaço largo. */
  esp: (): string => `<mtext> </mtext>`,
};
