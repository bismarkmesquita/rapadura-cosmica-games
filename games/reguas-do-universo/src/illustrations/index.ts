import type { CatalogoIlustracoes } from '@shared/ui/illustration';
import * as angulos from './angulos';
import * as paralaxe from './paralaxe';
import * as fluxo from './fluxo';
import * as magnitudes from './magnitudes';
import * as estrelas from './estrelas';

/** Catálogo de ilustrações do jogo. O nome da chave é o que os cards usam em `ilus`. */
export const ILUSTRACOES: CatalogoIlustracoes = {
  ...angulos,
  ...paralaxe,
  ...fluxo,
  ...magnitudes,
  ...estrelas,
};
