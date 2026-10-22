/// <reference types="vitest" />
import { defineConfig, type Plugin, type UserConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, montaCatalogo, pastasDeJogos } from './shared/catalogo/catalogo';
import { CANAL } from './shared/brand/canal';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const pastaJogos = resolve(raiz, 'games');

/**
 * Gera dist/games/catalogo.json e copia as capas para dist/games/<slug>/capa.svg.
 * No `npm run dev`, serve o mesmo catalogo.json, montado a cada pedido, e uma lista simples dos jogos em
 * /games/ (o catálogo de verdade é a página /games do site).
 */
function catalogo(): Plugin {
  return {
    name: 'catalogo-de-jogos',
    configureServer(server) {
      server.middlewares.use(`${BASE}catalogo.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        try {
          res.end(JSON.stringify(montaCatalogo(pastaJogos), null, 2));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ erro: (e as Error).message }));
        }
      });
      server.middlewares.use((req, res, next) => {
        if (req.url !== BASE && req.url !== BASE.slice(0, -1)) return next();
        const links = pastasDeJogos(pastaJogos)
          .map((j) => `<li><a href="${BASE}${j}/">${j}</a></li>`)
          .join('');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(
          `<!doctype html><meta charset="utf-8"><title>Jogos (dev)</title>` +
            `<h1>Jogos (dev)</h1><ul>${links}</ul><p><a href="${BASE}catalogo.json">catalogo.json</a></p>`,
        );
      });
    },
    generateBundle() {
      const cat = montaCatalogo(pastaJogos);
      for (const jogo of cat.jogos) {
        this.emitFile({
          type: 'asset',
          fileName: `${jogo.slug}/capa.svg`,
          source: readFileSync(resolve(pastaJogos, jogo.slug, 'capa.svg')),
        });
      }
      this.emitFile({
        type: 'asset',
        fileName: 'catalogo.json',
        source: JSON.stringify(cat, null, 2) + '\n',
      });
    },
  };
}

/** No arquivo solto não há site em volta: os links para o catálogo (/games) vão para o site publicado. */
function linksParaOSite(): Plugin {
  const catalogo = BASE.slice(0, -1);
  return {
    name: 'links-para-o-site',
    transformIndexHtml: (html) => html.replaceAll(`href="${catalogo}"`, `href="${CANAL.site}${catalogo}"`),
  };
}

const comum: UserConfig = {
  root: pastaJogos,
  resolve: {
    alias: { '@shared': resolve(raiz, 'shared') },
  },
  server: {
    // shared/ fica fora da raiz do Vite (games/).
    fs: { allow: [raiz] },
  },
  test: {
    root: raiz,
    include: ['shared/**/*.test.ts', 'games/**/*.test.ts'],
  },
};

export default defineConfig(({ mode }): UserConfig => {
  // `npm run build:arquivos` (scripts/build-arquivos.mjs): um HTML com tudo embutido, para abrir sem servidor.
  // O plugin só funciona com uma página por build, então o script roda um build por jogo, passando JOGO.
  if (mode === 'arquivo') {
    const jogo = process.env.JOGO;
    if (!jogo) throw new Error('Defina JOGO=<slug> (use npm run build:arquivos).');
    return {
      ...comum,
      base: './',
      plugins: [linksParaOSite(), viteSingleFile()],
      build: {
        outDir: resolve(raiz, 'dist-arquivos', jogo),
        emptyOutDir: true,
        rollupOptions: { input: resolve(pastaJogos, jogo, 'index.html') },
      },
    };
  }

  return {
    ...comum,
    base: BASE,
    plugins: [catalogo()],
    build: {
      outDir: resolve(raiz, 'dist/games'),
      emptyOutDir: true,
      rollupOptions: {
        input: Object.fromEntries(
          pastasDeJogos(pastaJogos).map((j) => [j, resolve(pastaJogos, j, 'index.html')]),
        ),
      },
    },
  };
});
