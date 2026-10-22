# Guia dos jogos Rapadura Cósmica

Este repositório reúne os jogos de navegador do canal Rapadura Cósmica. Ele **só fornece os jogos**: não tem
página de catálogo, não fala com o backend do site e não usa login. Cada jogo fica numa pasta própria em `games/` e
reaproveita o que está em `shared/`.

O catálogo é uma página do site (`rapaduracosmica.com.br/games`, no repositório `rapadura-cosmica-frontend`). O site
serve cada jogo no mesmo domínio por um _rewrite_: `rapaduracosmica.com.br/games/<slug>/` mostra o que este projeto
publica em `/games/<slug>/`. A página do catálogo lê o `catalogo.json` que o build daqui gera, então um jogo novo
aparece no site sem mexer no front-end.

Os jogos são usados principalmente em **aulas ao vivo**: o professor joga e compartilha a tela com turmas de
EF1 (1º ao 5º ano) e EF2 (6º ao 9º ano). Siga este guia ao criar ou alterar qualquer jogo.

## Tecnologias

| Para quê                           | O que usar                                                     |
| ---------------------------------- | -------------------------------------------------------------- |
| Linguagem                          | TypeScript em modo `strict`, sem `any`                         |
| Build e servidor local             | Vite (uma página por jogo, montadas automaticamente)           |
| 3D                                 | Three.js instalado pelo npm (`import * as THREE from 'three'`) |
| Desenhos 2D, rótulos e ilustrações | Canvas 2D                                                      |
| Fórmulas                           | MathML nativo, pelos helpers de `shared/math/mathml.ts`        |
| Testes                             | Vitest                                                         |
| Estilo de código                   | ESLint e Prettier                                              |
| Hospedagem                         | Site estático na Vercel, publicado a cada push na `main`       |

Não use frameworks de interface (React, Vue) nem motores de física prontos sem um motivo forte. Não carregue
bibliotecas por CDN: tudo entra pelo `package.json`.

## Estrutura

```
rapadura-games/
├── shared/                  o que todo jogo reaproveita
│   ├── brand/               dados, logo e selo do canal (site, YouTube)
│   ├── catalogo/            tipo e validação do jogo.json, geração do catalogo.json
│   ├── draw/                helpers de Canvas 2D (seta, rótulo, Sol, Terra…)
│   ├── math/                formatação de números e fórmulas em MathML
│   ├── physics/             gravitação, Kepler, Schwarzschild (com testes)
│   ├── styles/              tokens.css (cores e fontes, copiados do site), fonts/ e ui.css (componentes)
│   └── ui/                  cards, missões, painel de ação, toast, HUD
├── games/
│   └── <slug-do-jogo>/
│       ├── jogo.json        ficha do jogo (vai para o catalogo.json)
│       ├── capa.svg         capa 16:9 para o catálogo do site
│       ├── index.html       HTML do jogo (menu, HUD, cards, pausa)
│       └── src/
│           ├── main.ts      liga tudo: menu, pausa, laço principal
│           ├── types.ts     contrato das fases
│           ├── core/        motor, entrada, câmera, nave, sobreposição 2D, estado
│           ├── scene/       objetos 3D e texturas reutilizáveis no jogo
│           ├── phases/      uma classe por fase
│           ├── content/     TODOS os textos: cards, missões, avisos, teclas
│           ├── illustrations/  animações dos cards
│           └── style.css    estilos que só este jogo usa
├── vite.config.ts           raiz em games/, base /games/, plugin que gera o catalogo.json
├── vercel.json              cabeçalhos do catalogo.json e redirecionamentos para o site
├── CLAUDE.md                este guia
└── .github/workflows/ci.yml verificação automática
```

## Anatomia de um jogo

### `jogo.json`

```json
{
  "slug": "rumo-ao-buraco-negro",
  "titulo": "Rumo ao Buraco Negro",
  "resumo": "Uma frase de até 140 caracteres para o card do catálogo.",
  "aula": "Buracos negros",
  "turmas": ["EF1", "EF2"],
  "temas": ["Leis de Kepler", "Gravitação universal"],
  "fases": 5,
  "duracaoMinutos": 30,
  "tecnologias": ["three"],
  "status": "beta",
  "versao": "0.1.0",
  "atualizadoEm": "2026-10-18"
}
```

- `slug` é igual ao nome da pasta, só com minúsculas, números e hífens.
- `status`: `rascunho` (não aparece no catálogo, mas a página do jogo continua publicada), `beta` (o site mostra o
  selo "Beta") ou `publicado`.
- A validação está em `shared/catalogo/manifesto.ts`. Ela roda nos testes e no build: uma ficha inválida (mesmo de
  rascunho) ou sem `capa.svg` **faz o build falhar**.

### `catalogo.json`

O build (`npm run build`) gera `dist/games/catalogo.json` (código em `shared/catalogo/catalogo.ts`, plugin em
`vite.config.ts`) e copia cada capa para `dist/games/<slug>/capa.svg`:

```json
{
  "versaoCatalogo": 1,
  "jogos": [{ "...campos do jogo.json": "", "url": "/games/<slug>/", "capa": "/games/<slug>/capa.svg" }]
}
```

- Sem os rascunhos, do `atualizadoEm` mais recente para o mais antigo.
- É um contrato com o site: o front-end tem uma cópia do tipo (`src/games/models/game.ts`). Mudança que quebra o
  formato precisa subir `versaoCatalogo` e ser feita junto no front-end.
- No `npm run dev`, o mesmo arquivo é servido em `/games/catalogo.json`, montado a cada pedido.

### Fases

Cada fase é uma classe em `phases/` que implementa a interface `Fase` de `types.ts`:
`init`, `update(dt)` (física e missões), `sync(dt)` (posição dos objetos 3D), `overlay` (rótulos 2D),
`hud` (painel). Toda fase cria seus objetos dentro de um `THREE.Group`, que é descartado ao trocar de fase.
Para mudar de fase ou voltar ao menu, use `fluxo` de `core/flow.ts`; nunca importe `main.ts`.

### Conteúdo separado do código

Textos de cards, missões, avisos e listas de teclas ficam **só** em `content/`. A lógica nunca tem frases para o
aluno. Assim, corrigir uma data ou reescrever uma explicação não mexe na física.

## Regras de código

1. TypeScript `strict`. Nada de `any`; quando precisar, use tipos do Three.js ou crie um tipo.
2. Um módulo, uma responsabilidade. Arquivos acima de ~300 linhas devem ser divididos.
3. Física e matemática em **funções puras** em `shared/physics/`, com testes que conferem valores conhecidos
   (ex.: raio de Schwarzschild do Sol ≈ 2,95 km; órbita rasante da Terra ≈ 7,9 km/s).
4. Números de calibragem do jogo (escalas, velocidades) ficam em constantes nomeadas, com um comentário dizendo
   por que têm aquele valor.
5. Intensidade de luzes sempre multiplicada por `LUZ` (de `core/engine.ts`), por causa da iluminação física do
   Three.js.
6. Nomes do domínio em português (`nave`, `missoes`, `raioSchwarzschild`); termos técnicos de programação
   podem ficar em inglês quando forem padrão.
7. Comentários explicam o porquê, não o óbvio.
8. Toda dependência nova precisa de justificativa no PR.

## Padrão pedagógico

- **Público duplo.** O texto principal de cada card deve ser entendido por uma criança do EF1. Fórmulas e
  detalhes vão no bloco recolhido **"Aprofundar (EF2)"**.
- **Card.** Campos: `eyebrow` (quem · ano · conceito, ex.: "Kepler · 1609 · 1ª lei"), `titulo` afirmativo e
  curto, `corpo` com 2 ou 3 parágrafos curtos, `ef2` opcional com fórmula em MathML, `ilus` e `dica`.
- **Toda explicação tem ilustração animada** ao lado (`illustrations/`), mostrando o que o texto diz.
- **Fatos conferidos.** Datas, valores e nomes vêm de fontes confiáveis; liste as fontes no PR.
- **Avise quando algo está fora de escala** ou exagerado para caber na tela.
- **Desafios de cálculo do EF2 são sempre opcionais**, com botão "Pular desafio", para não travar a aula do EF1.
- **Missões curtas e claras**, com uma seta na tela apontando o alvo.
- Um jogo deve caber numa aula de 1 hora; fases devem poder ser escolhidas direto no menu.

## Padrão visual

- Tema escuro único, de "noite estrelada". Cores e fontes vêm de `shared/styles/tokens.css`:
  âmbar `--sol` para destaques, ciano `--orbita` para trajetórias e gravidade, `--ok` e `--alerta` para estados.
- Os tokens de interface (`--void`, `--panel`, `--line`, `--ink`, `--muted`, `--sol`, `--primaria`) e as fontes são
  **copiados do site** (`src/base/styles/colors.scss`, tema escuro, e `src/app/layout.tsx`). A cópia é intencional:
  são poucos valores e mudam raramente; não crie pacote npm nem submódulo. Se o site mudar, atualize aqui.
- Fontes: Plus Jakarta Sans para textos, títulos e números (também nos rótulos desenhados no canvas); Xilosa
  (`--f-marca`, arquivo em `shared/styles/fonts/`) só para o nome do canal e o título do menu, como no site.
- As fontes ficam **dentro do projeto**, nunca no Google Fonts nem em outro CDN, para o jogo abrir offline: a Plus
  Jakarta Sans vem do pacote `@fontsource-variable/plus-jakarta-sans` (só o subconjunto latino, declarado em
  `tokens.css`).
- Cards grandes e legíveis numa tela compartilhada; nada de texto pequeno no meio da cena.
- Acessibilidade: foco visível, respeito a `prefers-reduced-motion`, contraste alto.

## Marca do canal

- Dados do canal (nome, site, YouTube) ficam só em `shared/brand/canal.ts`.
- Todo jogo mostra o **selo do canal** no menu inicial, o **selo compacto** durante o jogo e os **links do site e do
  YouTube** na pausa e na tela final. Use `seloCanal()` e `linksCanal()` de `shared/brand/selo.ts`.
- O menu do jogo tem um botão "Outros jogos" que volta ao catálogo do site (`/games`, link comum).
- O logo (`shared/brand/logo.png`) é **copiado do site** (`public/static/images/channel.png`). Se ele mudar lá,
  copie de novo; o selo usa esse arquivo em um só lugar.

## Controles padrão

| Ação                        | Tecla                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Virar (3D, terceira pessoa) | mouse para os lados, ou A e D                                                                           |
| Apontar (visão de cima)     | mouse                                                                                                   |
| Acelerar / frear / turbo    | W ou clique / S / Shift                                                                                 |
| Câmera                      | V alterna primeira e terceira pessoa; M abre o mapa visto de cima; botão direito arrasta; roda aproxima |
| Interface                   | Esc pausa, C revê o último card, H esconde o painel, botão de tela cheia                                |

Fases em que ver de cima é essencial (como a de Newton) usam `camFixa` e ignoram V e M.

## Qualidade

Antes de abrir um PR, rode:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:arquivos
```

Teste no navegador em 1280×720 (tela de aula) e numa largura de celular. O CI repete as verificações.

Para testar junto com o site: rode `npm run dev` aqui (porta 5173) e, no front-end, `npm run dev` com
`GAMES_ORIGIN=http://localhost:5173` no `.env.development`. `localhost:3000/games` mostra o catálogo e o botão
"Jogar" abre o jogo pelo rewrite. O Next só lê `GAMES_ORIGIN` ao iniciar: reinicie o `npm run dev` do front-end
depois de mudá-la. Para conferir a versão gerada, `npm run build && npm run preview` (porta 4173) e
`GAMES_ORIGIN=http://localhost:4173`.

## Arquivo para abrir sem servidor

`npm run build:arquivos` gera `dist-arquivos/<slug>.html` para cada jogo (rascunhos inclusos): um arquivo só, de
uns 800 KB, com código, estilos, imagens e fontes embutidos. Abre com dois cliques, sem `localhost` e sem internet,
o que serve para mandar a um professor ou usar numa aula offline.

- Usa o `vite-plugin-singlefile` no modo `arquivo` do `vite.config.ts`. O plugin só aceita uma página por build,
  então `scripts/build-arquivos.mjs` roda um build por jogo (passando `JOGO=<slug>`) e renomeia a saída.
- No arquivo, os links para `/games` ("Outros jogos") apontam para `rapaduracosmica.com.br/games`
  (plugin `linksParaOSite`), porque um caminho relativo não existe fora do site.
- Por isso tudo o que o jogo carrega precisa entrar pelo `import` ou pelo CSS (o Vite embute), nunca por URL
  externa ou caminho fixo em `public/`.
- `dist-arquivos/` fica fora do git e não é publicado na Vercel. O CI roda o comando para garantir que continua
  funcionando.

## Publicação

- Projeto estático próprio na Vercel (`vercel.json`: comando `npm run build`, pasta `dist`). Não precisa de domínio:
  o site usa o endereço `.vercel.app` do projeto na variável `GAMES_ORIGIN`.
- Tudo é publicado sob `/games/` (`base: '/games/'` no Vite): cada jogo em `/games/<slug>/`, os arquivos gerados em
  `/games/assets/` e o catálogo em `/games/catalogo.json`. Esse caminho precisa ser igual aqui e no site, senão o
  rewrite quebra os endereços dos arquivos.
- `vercel.json` libera o `catalogo.json` para outros domínios (CORS) com cache curto (5 min) e manda `/` e `/games`
  deste projeto para `rapaduracosmica.com.br/games`.
- O site e os jogos ficam no mesmo domínio, então o código dos jogos roda com a mesma origem do site. Não leia
  `localStorage`, cookies nem nada do site, e mantenha as dependências no mínimo (toda dependência nova precisa de
  justificativa no PR).

## Como criar um jogo novo

1. Crie `games/<slug>/` copiando a estrutura de um jogo existente. No `index.html`, o script é
   `<script type="module" src="/<slug>/src/main.ts">`: caminho a partir da pasta do jogo, nunca `./`, porque o
   site tira a barra final de `/games/<slug>/` e um caminho relativo quebraria no `npm run dev` (há teste para isso).
2. Preencha `jogo.json` com `status: "rascunho"` e desenhe `capa.svg` (16:9).
3. Escreva primeiro o roteiro do jogo: fases, missões e os cards, em `content/`.
4. Implemente as fases em `phases/`, reaproveitando `shared/` (cards, missões, painel, física).
5. Crie uma ilustração animada para cada card em `illustrations/`.
6. Acrescente testes para qualquer física nova em `shared/physics/`.
7. Rode as verificações, teste no navegador e mude o status para `beta`.

### Pedido-modelo para um novo chat

> Crie um jogo novo no repositório rapadura-games seguindo o guia (CLAUDE.md / "Guia dos jogos Rapadura Cósmica").
> Tema da aula: **\_. Turmas: EF1 e EF2. Ideia das fases: _**. Duração: cerca de \_\_\_ minutos.
