import type { Fase } from '../types';
import { FaseAngulos } from './angulos';
import { FaseParalaxe } from './paralaxe';
import { FaseFluxo } from './fluxo';

/** Fases prontas. Para acrescentar uma, crie a classe e registre aqui; o menu sai de content/jogo.ts. */
export const FASES: Record<number, Fase> = {
  1: new FaseAngulos(),
  2: new FaseParalaxe(),
  3: new FaseFluxo(),
};
