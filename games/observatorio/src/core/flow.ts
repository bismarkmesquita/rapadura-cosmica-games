/**
 * Ponte para as fases pedirem troca de fase ou volta ao menu sem importar main.ts
 * (evita dependência circular). main.ts preenche estas funções ao iniciar.
 */
export const fluxo = {
  iniciaFase: (_n: number): void => {},
  vaiMenu: (): void => {},
  existeFase: (_n: number): boolean => false,
};
