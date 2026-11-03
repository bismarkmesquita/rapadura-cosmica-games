import type { Fase } from '../types';
import { FaseArranjos } from './arranjos';
import { FaseMontagens } from './montagens';
import { FaseAmpliacao } from './ampliacao';
import { FaseMagLimite } from './magLimite';
import { FaseResolucao } from './resolucao';
import { FaseAtmosfera } from './atmosfera';

/** Fases prontas (a 7 é a missão final). Para acrescentar uma, crie a classe e registre aqui; o menu sai de content/jogo.ts. */
export const FASES: Record<number, Fase> = {
  1: new FaseArranjos(),
  2: new FaseMontagens(),
  3: new FaseAmpliacao(),
  4: new FaseMagLimite(),
  5: new FaseResolucao(),
  6: new FaseAtmosfera(),
};
