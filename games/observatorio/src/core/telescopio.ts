export type Arranjo = 'refrator' | 'newtoniano' | 'cassegrain' | 'sct';
export type Montagem = 'altaz' | 'equatorial';

/**
 * O telescópio do aluno, montado na Oficina e usado no Observatório. Começa no telescópio de referência da
 * aula: newtoniano de 200 mm, f/5, com oculares de 25 mm e 10 mm.
 */
export const telescopio = {
  arranjo: 'newtoniano' as Arranjo,
  aberturaMm: 200,
  focalMm: 1000,
  oculares: [25, 10],
  montagem: 'equatorial' as Montagem,
};
