/** Estado do teclado e do mouse. As decisões sobre cada tecla ficam em main.ts. */
export const teclado = new Set<string>();

export const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  /** Botão esquerdo pressionado (acelera). */
  down: false,
  /** Botão direito pressionado (olhar em volta). */
  dir: false,
  lx: 0,
  ly: 0,
  /** Mouse sobre a cena (fora dos painéis). */
  dentro: false,
  /** No mapa, a nave aponta para o mouse. A e D desligam isso até o mouse se mexer. */
  mirar: true,
};

export const pressionada = (...ks: string[]): boolean => ks.some((k) => teclado.has(k));

export function soltaTudo(): void {
  teclado.clear();
  mouse.down = false;
  mouse.dir = false;
}

interface Manipuladores {
  /** Chamado em cada tecla pressionada (fora de campos de texto), já em minúsculas. */
  aoTeclar(k: string, e: KeyboardEvent): void;
  aoArrastar(dx: number, dy: number): void;
  aoRolar(deltaY: number): void;
}

export function iniciaEntrada(alvo: HTMLElement, m: Manipuladores): void {
  addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    m.aoTeclar(e.key.toLowerCase(), e);
  });
  addEventListener('keyup', (e) => teclado.delete(e.key.toLowerCase()));
  addEventListener('blur', soltaTudo);
  alvo.addEventListener('mousemove', (e) => {
    const dx = e.clientX - mouse.lx;
    const dy = e.clientY - mouse.ly;
    mouse.lx = e.clientX;
    mouse.ly = e.clientY;
    mouse.dentro = true;
    if (mouse.dir) m.aoArrastar(dx, dy);
    else {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.mirar = true;
    }
  });
  alvo.addEventListener('mouseleave', () => (mouse.dentro = false));
  alvo.addEventListener('mousedown', (e) => {
    mouse.lx = e.clientX;
    mouse.ly = e.clientY;
    if (e.button === 0) mouse.down = true;
    if (e.button === 2) mouse.dir = true;
  });
  addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.dir = false;
  });
  alvo.addEventListener('contextmenu', (e) => e.preventDefault());
  alvo.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      m.aoRolar(e.deltaY);
    },
    { passive: false },
  );
}
