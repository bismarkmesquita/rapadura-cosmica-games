# Jogos Rapadura Cósmica

Jogos de astronomia para o navegador, feitos para as aulas do canal
[Rapadura Cósmica](https://rapaduracosmica.com.br). O catálogo fica no site, em
**rapaduracosmica.com.br/games**; este repositório só publica os jogos e o `catalogo.json` que o site lê.

| Jogo                                                | Aula           | Turmas    |
| --------------------------------------------------- | -------------- | --------- |
| [Rumo ao Buraco Negro](games/rumo-ao-buraco-negro/) | Buracos negros | EF1 e EF2 |

## Rodar no computador

Precisa do Node 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/games/`: lá tem a lista dos jogos (só no modo dev) e o `catalogo.json`. Cada jogo fica
em `/games/<pasta>/`, por exemplo `/games/rumo-ao-buraco-negro/`.

Para ver os jogos dentro do site, deixe este `npm run dev` rodando e, na pasta do front-end, ponha
`GAMES_ORIGIN=http://localhost:5173` no `.env.development` e rode `npm run dev` (reinicie se já estava rodando).
O catálogo fica em `http://localhost:3000/games`.

## Comandos

| Comando                           | O que faz                                                                   |
| --------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                     | servidor local com recarga automática                                       |
| `npm run build`                   | confere os tipos e gera os jogos e o `catalogo.json` em `dist/games/`       |
| `npm run build:arquivos`          | gera `dist-arquivos/<jogo>.html`, um arquivo por jogo que abre sem servidor |
| `npm run preview`                 | serve a versão gerada (porta 4173), nos mesmos caminhos `/games/` do site   |
| `npm test`                        | testes de física, das fichas dos jogos e do catálogo                        |
| `npm run lint` / `npm run format` | estilo de código                                                            |

## Publicação

Projeto estático próprio na Vercel (configuração em `vercel.json`). O site repassa
`rapaduracosmica.com.br/games/<slug>/` para este projeto por um rewrite, com a variável `GAMES_ORIGIN` do
front-end apontando para o endereço `.vercel.app` daqui. Os detalhes estão no [CLAUDE.md](CLAUDE.md).

## Organização e novos jogos

Leia o [CLAUDE.md](CLAUDE.md): ele descreve a estrutura, o `catalogo.json`, as regras de código, o padrão dos
cards e o passo a passo para criar um jogo novo.
