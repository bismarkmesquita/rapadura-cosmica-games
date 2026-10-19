/** Linha "rótulo ........ valor" do painel. */
export const linhaHud = (rotulo: string, valor: string | number): string =>
  `<div class="linha"><span>${rotulo}</span><b>${valor}</b></div>`;

/** Barra de 0 a 100%. */
export const medidorHud = (fracao: number, cor?: string): string =>
  `<div class="medidor"><i style="width:${Math.max(0, Math.min(100, fracao * 100))}%${cor ? `;background:${cor}` : ''}"></i></div>`;

export const tituloHud = (texto: string, margemTopo = false): string =>
  `<div class="eyebrow" style="margin:${margemTopo ? '10px 0 4px' : '0 0 6px'}">${texto}</div>`;

/** Lista de atalhos de teclado mostrada no rodapé. */
export const teclasHud = (lista: [string, string][]): string =>
  lista.map(([k, t]) => `<span><kbd>${k}</kbd> ${t}</span>`).join('');
