import type { Fase } from '../types';
import { FaseAngulos } from './angulos';

/** Fases prontas. Para acrescentar uma, crie a classe e registre aqui; o menu sai de content/jogo.ts. */
export const FASES: Record<number, Fase> = {
  1: new FaseAngulos(),
};
