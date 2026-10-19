/**
 * Ilustrações animadas dos cards: pequenas cenas em Canvas 2D desenhadas a cada quadro.
 * `t` é o tempo em segundos desde que o card abriu.
 */
export interface Ilustracao {
  /** Legenda curta exibida embaixo da animação. */
  leg: string;
  draw(c: CanvasRenderingContext2D, w: number, h: number, t: number): void;
}

export type CatalogoIlustracoes = Record<string, Ilustracao>;

/** Roda uma ilustração num canvas enquanto `ativo()` for verdadeiro. */
export function rodaIlustracao(canvas: HTMLCanvasElement, il: Ilustracao, ativo: () => boolean): () => void {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  let raf = 0;
  const passo = (): void => {
    if (!ativo() || !canvas.isConnected) return;
    const w = canvas.clientWidth || 300;
    const h = Math.round(w * 0.85);
    const d = Math.min(2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * d)) {
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      canvas.style.height = `${h}px`;
    }
    const c = canvas.getContext('2d');
    if (!c) return;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    c.save();
    il.draw(c, w, h, reduz ? 3 : (performance.now() - t0) / 1000);
    c.restore();
    if (!reduz) raf = requestAnimationFrame(passo);
  };
  passo();
  return () => cancelAnimationFrame(raf);
}
