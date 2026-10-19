/** Aviso curto no topo da tela, que some sozinho. Chame `tick(dt)` a cada quadro. */
export class Toast {
  private restante = 0;

  constructor(private el: HTMLElement) {}

  mostra(msg: string, segundos = 3): void {
    this.el.textContent = msg;
    this.el.hidden = false;
    this.el.style.opacity = '1';
    this.restante = segundos;
  }

  tick(dt: number): void {
    if (this.restante <= 0) return;
    this.restante -= dt;
    if (this.restante <= 0) {
      this.el.style.opacity = '0';
      setTimeout(() => {
        if (this.restante <= 0) this.el.hidden = true;
      }, 300);
    }
  }
}
