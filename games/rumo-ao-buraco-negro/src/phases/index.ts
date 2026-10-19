import type { Fase } from '../types';
import { FaseKepler } from './kepler';
import { FaseNewton } from './newton';
import { FaseEinstein } from './einstein';
import { FaseEstrelasEscuras } from './estrelasEscuras';
import { FaseBuracoNegro } from './buracoNegro';

export const kepler = new FaseKepler();

/** Ordem das fases. Para acrescentar uma fase, crie a classe e registre aqui e no menu do index.html. */
export const FASES: Record<number, Fase> = {
  1: kepler,
  2: new FaseNewton(),
  3: new FaseEinstein(),
  4: new FaseEstrelasEscuras(),
  5: new FaseBuracoNegro(),
};
