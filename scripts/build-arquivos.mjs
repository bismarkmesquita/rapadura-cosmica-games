// Gera dist-arquivos/<slug>.html para cada jogo: um arquivo só, com código, estilos, imagens e fontes
// embutidos, que abre com dois cliques, sem servidor e sem internet. Inclui os rascunhos.
import { build } from 'vite';
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const pastaJogos = join(raiz, 'games');
const saida = join(raiz, 'dist-arquivos');

const jogos = readdirSync(pastaJogos, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(pastaJogos, d.name, 'index.html')))
  .map((d) => d.name);

rmSync(saida, { recursive: true, force: true });

for (const jogo of jogos) {
  process.env.JOGO = jogo;
  await build({ configFile: resolve(raiz, 'vite.config.ts'), mode: 'arquivo', logLevel: 'warn' });
  // O Vite grava em dist-arquivos/<slug>/<slug>/index.html (caminho relativo à raiz games/).
  renameSync(join(saida, jogo, jogo, 'index.html'), join(saida, `${jogo}.html`));
  rmSync(join(saida, jogo), { recursive: true, force: true });
  process.stdout.write(`dist-arquivos/${jogo}.html\n`);
}
