export type Arranjo = 'refrator' | 'newtoniano' | 'cassegrain' | 'sct';

/**
 * O telescópio das fases do Observatório: o de referência da aula, newtoniano de 200 mm e f/5. As missões
 * dependem dele, então ele é o mesmo em toda aula; o aluno monta o próprio telescópio na missão final.
 */
export const telescopio = {
  aberturaMm: 200,
  focalMm: 1000,
};
