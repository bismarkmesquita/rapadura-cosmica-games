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

/** Quanto a pinça de dois dedos vale em "giros da roda do mouse" (rolaCamera). */
const PINCA_PARA_RODA = 3;

/**
 * Gestos na cena em telas de toque: um dedo olha em volta (ou, no mapa, aponta para onde a nave vai, como o
 * mouse) e dois dedos aproximam e afastam a câmera.
 */
export function iniciaGestos(
  alvo: HTMLElement,
  m: Omit<Manipuladores, 'aoTeclar'> & { aponta(): boolean },
): void {
  const dedos = new Map<number, [number, number]>();
  let distancia = 0;
  const distDedos = (): number => {
    const [a, b] = [...dedos.values()];
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  };
  const mira = (e: PointerEvent): void => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.mirar = true;
  };
  const solta = (e: PointerEvent): void => {
    dedos.delete(e.pointerId);
    if (!dedos.size) mouse.dir = false;
  };

  alvo.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    // Sem isto o navegador também gera eventos de mouse, e o toque viraria "acelerar" e "virar para o dedo".
    e.preventDefault();
    alvo.setPointerCapture(e.pointerId);
    dedos.set(e.pointerId, [e.clientX, e.clientY]);
    if (dedos.size === 2) distancia = distDedos();
    else if (m.aponta()) mira(e);
  });
  alvo.addEventListener('pointermove', (e) => {
    const antes = dedos.get(e.pointerId);
    if (!antes) return;
    dedos.set(e.pointerId, [e.clientX, e.clientY]);
    if (dedos.size === 2) {
      const d = distDedos();
      m.aoRolar((distancia - d) * PINCA_PARA_RODA);
      distancia = d;
    } else if (m.aponta()) mira(e);
    else {
      mouse.dir = true;
      m.aoArrastar(e.clientX - antes[0], e.clientY - antes[1]);
    }
  });
  alvo.addEventListener('pointerup', solta);
  alvo.addEventListener('pointercancel', solta);
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
