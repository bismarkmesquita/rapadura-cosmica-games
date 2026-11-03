import type { CatalogoIlustracoes } from '@shared/ui/illustration';
import * as arranjos from './arranjos';
import * as montagens from './montagens';

/** Catálogo de ilustrações do jogo. O nome da chave é o que os cards usam em `ilus`. */
export const ILUSTRACOES: CatalogoIlustracoes = { ...arranjos, ...montagens };
