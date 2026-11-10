/** Textos da tela final (escada de distâncias). Edite à vontade: o código só usa as chaves. */
import type { CardDef } from '@shared/ui/cards';

export const ID_ESCADA = 8;
export const NOME_FASE = 'Escada de distâncias';

/** Um degrau por régua, na ordem das fases: até onde ela alcança e em que ela se apoia. */
export const DEGRAUS: Record<number, { alcance: string; usa: string }> = {
  1: { alcance: 'Lua, Sol e planetas', usa: 'geometria do ângulo' },
  2: { alcance: 'estrelas a até milhares de anos-luz', usa: 'o tamanho da órbita da Terra' },
  3: { alcance: 'liga o brilho à distância', usa: 'a luz que chega até nós' },
  4: { alcance: 'mede o brilho visto daqui', usa: 'o fluxo' },
  5: { alcance: 'compara o brilho real das estrelas', usa: 'distâncias da paralaxe' },
  6: { alcance: 'conta toda a energia, não só a visível', usa: 'as magnitudes' },
  7: { alcance: 'galáxias a milhões e bilhões de anos-luz', usa: 'Cefeidas calibradas pela paralaxe' },
};

export const ROTULOS = {
  alcance: 'alcança',
  usa: 'apoia-se em',
  conquistadas: 'Réguas conquistadas',
  de: (n: number, total: number): string => `${n} de ${total}`,
  menu: 'Voltar ao menu',
  falta: 'ainda não conquistada',
};

export const intro: CardDef = {
  eyebrow: 'Final · Escada de distâncias',
  ilus: 'escada',
  titulo: 'Cada régua apoia a seguinte',
  corpo:
    '<p>Ninguém mede o Universo com uma régua só. Os ângulos e a paralaxe medem o que está perto; com essas distâncias, os astrônomos calibram o brilho das estrelas; e com o brilho conhecido das Cefeidas e das supernovas, chegam às galáxias mais distantes.</p>' +
    '<p>É a <b>escada de distâncias</b>: se um degrau de baixo errar, todos os de cima erram junto.</p>',
  botao: 'Ver a escada',
};
