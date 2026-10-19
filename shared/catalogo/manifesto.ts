/**
 * Ficha de um jogo (games/<pasta>/jogo.json). O portal lê estas fichas para montar o menu,
 * então um jogo novo aparece no site só por ter a pasta com jogo.json e index.html.
 */
export type Turma = 'EF1' | 'EF2' | 'EM';

export type StatusJogo = 'rascunho' | 'beta' | 'publicado';

export interface ManifestoJogo {
  /** Igual ao nome da pasta em games/. Só letras minúsculas, números e hífens. */
  slug: string;
  titulo: string;
  /** Uma frase, até uns 120 caracteres, para o card do portal. */
  resumo: string;
  /** Tema da aula em que o jogo é usado. */
  aula: string;
  turmas: Turma[];
  temas: string[];
  fases: number;
  /** Tempo aproximado para jogar tudo. */
  duracaoMinutos: number;
  /** Bibliotecas usadas, por exemplo "three". */
  tecnologias: string[];
  /** "rascunho" não aparece no portal. */
  status: StatusJogo;
  versao: string;
  /** Data da última atualização, no formato AAAA-MM-DD. */
  atualizadoEm: string;
}

const TURMAS: Turma[] = ['EF1', 'EF2', 'EM'];
const STATUS: StatusJogo[] = ['rascunho', 'beta', 'publicado'];

/** Lista os problemas de uma ficha. Vazia quando está tudo certo. */
export function validaManifesto(m: Partial<ManifestoJogo>, pasta: string): string[] {
  const erros: string[] = [];
  const texto = (campo: keyof ManifestoJogo) => {
    if (typeof m[campo] !== 'string' || !(m[campo] as string).trim()) erros.push(`${campo} é obrigatório`);
  };
  (['slug', 'titulo', 'resumo', 'aula', 'versao', 'atualizadoEm'] as const).forEach(texto);
  if (m.slug !== pasta) erros.push(`slug "${m.slug}" deve ser igual ao nome da pasta "${pasta}"`);
  if (m.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.slug))
    erros.push('slug deve usar só minúsculas, números e hífens');
  if (!Array.isArray(m.turmas) || !m.turmas.length || m.turmas.some((t) => !TURMAS.includes(t)))
    erros.push(`turmas deve ter ao menos uma entre ${TURMAS.join(', ')}`);
  if (!Array.isArray(m.temas) || !m.temas.length) erros.push('temas deve ter ao menos um tema');
  if (!Array.isArray(m.tecnologias)) erros.push('tecnologias deve ser uma lista');
  if (!Number.isInteger(m.fases) || (m.fases ?? 0) < 1) erros.push('fases deve ser um inteiro positivo');
  if (typeof m.duracaoMinutos !== 'number' || m.duracaoMinutos <= 0)
    erros.push('duracaoMinutos deve ser positivo');
  if (!m.status || !STATUS.includes(m.status)) erros.push(`status deve ser ${STATUS.join(', ')}`);
  if (m.atualizadoEm && !/^\d{4}-\d{2}-\d{2}$/.test(m.atualizadoEm))
    erros.push('atualizadoEm deve ser AAAA-MM-DD');
  if (m.resumo && m.resumo.length > 140) erros.push('resumo deve ter no máximo 140 caracteres');
  return erros;
}
