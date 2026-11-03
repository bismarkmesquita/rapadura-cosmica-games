import type { Fase } from '../types';
import { FaseArranjos } from './arranjos';
import { FaseMontagens } from './montagens';

/** Fases prontas (a 7 é a missão final). Para acrescentar uma, crie a classe e registre aqui; o menu sai de content/jogo.ts. */
export const FASES: Record<number, Fase> = {
  1: new FaseArranjos(),
  2: new FaseMontagens(),
};
