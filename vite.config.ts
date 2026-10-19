/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));

/** Cada pasta em games/ com um index.html vira uma página do site, em /games/<pasta>/. */
const jogos = readdirSync(resolve(raiz, 'games'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(raiz, 'games', d.name, 'index.html')))
  .map((d) => d.name);

export default defineConfig({
  resolve: {
    alias: { '@shared': resolve(raiz, 'shared') },
  },
  build: {
    rollupOptions: {
      input: {
        portal: resolve(raiz, 'index.html'),
        ...Object.fromEntries(jogos.map((j) => [j, resolve(raiz, 'games', j, 'index.html')])),
      },
    },
  },
  test: {
    include: ['shared/**/*.test.ts', 'games/**/*.test.ts'],
  },
});
