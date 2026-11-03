import type { Fase } from '../types';
import { FaseAngulos } from './angulos';
import { FaseParalaxe } from './paralaxe';
import { FaseFluxo } from './fluxo';
import { FaseMagAparente } from './magAparente';
import { FaseMagAbsoluta } from './magAbsoluta';
import { FaseBolometrica } from './bolometrica';
import { FaseVelasPadrao } from './velasPadrao';
import { FaseEscada } from './escada';

/** Fases prontas (a 8 é a tela final). Para acrescentar uma, crie a classe e registre aqui; o menu sai de content/jogo.ts. */
export const FASES: Record<number, Fase> = {
  1: new FaseAngulos(),
  2: new FaseParalaxe(),
  3: new FaseFluxo(),
  4: new FaseMagAparente(),
  5: new FaseMagAbsoluta(),
  6: new FaseBolometrica(),
  7: new FaseVelasPadrao(),
  8: new FaseEscada(),
};
