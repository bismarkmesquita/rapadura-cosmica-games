import type { CatalogoIlustracoes } from '@shared/ui/illustration';
import * as orbitas from './orbitas';
import * as newton from './newton';
import * as espacoTempo from './espacoTempo';
import * as buracosNegros from './buracosNegros';

/** Catálogo de ilustrações do jogo. O nome da chave é o que os cards usam em `ilus`. */
export const ILUSTRACOES: CatalogoIlustracoes = { ...orbitas, ...newton, ...espacoTempo, ...buracosNegros };
