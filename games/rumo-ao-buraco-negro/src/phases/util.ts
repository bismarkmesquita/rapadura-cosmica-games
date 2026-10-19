import { nave } from '../core/estado';
import { toast } from '../core/ui';

/** Agenda ações para daqui a alguns segundos de jogo (pausa junto com o jogo). */
export class Temporizador {
  private fila: { t: number; f: () => void }[] = [];

  depois(segundos: number, f: () => void): void {
    this.fila.push({ t: segundos, f });
  }

  tick(dt: number): void {
    for (const e of this.fila) e.t -= dt;
    const prontas = this.fila.filter((e) => e.t <= 0);
    this.fila = this.fila.filter((e) => e.t > 0);
    prontas.forEach((e) => e.f());
  }
}

/** Impede a nave de entrar num raio em volta da origem, quicando para fora. */
export function rebate(raio: number, aviso: string): void {
  const r = Math.hypot(nave.x, nave.y);
  if (r >= raio || r === 0) return;
  const ux = nave.x / r,
    uy = nave.y / r;
  nave.x = ux * raio;
  nave.y = uy * raio;
  const vr = nave.vx * ux + nave.vy * uy;
  if (vr < 0) {
    nave.vx -= 1.6 * vr * ux;
    nave.vy -= 1.6 * vr * uy;
  }
  toast.mostra(aviso);
}
