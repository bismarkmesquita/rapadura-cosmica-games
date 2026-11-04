/**
 * Posição dos astros no céu local: de coordenadas equatoriais (ângulo horário H e declinação δ) para altura e
 * azimute, vistos de uma latitude φ. Ângulos em graus; azimute contado a partir do norte, para leste.
 */
const RAD = Math.PI / 180;

/** Direção do astro como vetor unitário [leste, norte, zênite]. */
export function direcaoLocal(H: number, dec: number, lat: number): [number, number, number] {
  const [h, d, f] = [H * RAD, dec * RAD, lat * RAD];
  return [
    -Math.cos(d) * Math.sin(h),
    Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.cos(h) * Math.sin(f),
    Math.sin(d) * Math.sin(f) + Math.cos(d) * Math.cos(h) * Math.cos(f),
  ];
}

export function altAz(H: number, dec: number, lat: number): { alt: number; az: number } {
  const [e, n, u] = direcaoLocal(H, dec, lat);
  const az = Math.atan2(e, n) / RAD;
  return { alt: Math.asin(Math.max(-1, Math.min(1, u))) / RAD, az: (az + 360) % 360 };
}

/**
 * Ângulo horário (positivo, no oeste) em que o astro passa pela altura pedida; o mesmo valor com sinal trocado vale
 * para a subida, no leste. Devolve null se ele nunca passa por essa altura.
 */
export function anguloHorarioNaAltura(alt: number, dec: number, lat: number): number | null {
  const [a, d, f] = [alt * RAD, dec * RAD, lat * RAD];
  const denominador = Math.cos(d) * Math.cos(f);
  if (Math.abs(denominador) < 1e-9) return null;
  const cosH = (Math.sin(a) - Math.sin(d) * Math.sin(f)) / denominador;
  return Math.abs(cosH) > 1 ? null : Math.acos(cosH) / RAD;
}

/**
 * Ângulo paralático: quanto o norte celeste está girado em relação à direção do zênite, na imagem. É zero no
 * meridiano e muda enquanto o astro anda: numa montagem altazimutal, a imagem gira junto.
 */
export function anguloParalatico(H: number, dec: number, lat: number): number {
  const [h, d, f] = [H * RAD, dec * RAD, lat * RAD];
  return Math.atan2(Math.sin(h), Math.tan(f) * Math.cos(d) - Math.sin(d) * Math.cos(h)) / RAD;
}
