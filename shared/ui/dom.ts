/** Busca um elemento pelo id e falha cedo, com mensagem clara, se ele não existir no HTML. */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado no HTML do jogo.`);
  return el as T;
}
