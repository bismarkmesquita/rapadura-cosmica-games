# Guia dos jogos Rapadura Cósmica

Este repositório reúne os jogos de navegador do canal Rapadura Cósmica, publicados em
**games.rapaduracosmica.com.br**. A página inicial é um portal com a lista de jogos e uma área sobre o canal.
Cada jogo fica numa pasta própria em `games/` e reaproveita o que está em `shared/`.

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
├── index.html               portal (menu de jogos)
├── portal/                  código e estilo do portal
├── shared/                  o que todo jogo reaproveita
│   ├── brand/               dados e selo do canal (site, YouTube, logo)
│   ├── catalogo/            tipo e validação do jogo.json
│   ├── draw/                helpers de Canvas 2D (seta, rótulo, Sol, Terra…)
│   ├── math/                formatação de números e fórmulas em MathML
│   ├── physics/             gravitação, Kepler, Schwarzschild (com testes)
│   ├── styles/              tokens.css (cores e fontes) e ui.css (componentes)
│   └── ui/                  cards, missões, painel de ação, toast, HUD
├── games/
│   └── <slug-do-jogo>/
│       ├── jogo.json        ficha do jogo (o portal lê daqui)
│       ├── capa.svg         capa 16:9 para o portal
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
├── CLAUDE.md                este guia
└── .github/workflows/ci.yml verificação automática
```

## Anatomia de um jogo

### `jogo.json`

```json
{
  "slug": "rumo-ao-buraco-negro",
  "titulo": "Rumo ao Buraco Negro",
  "resumo": "Uma frase de até 140 caracteres para o card do portal.",
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
- `status`: `rascunho` (não aparece no portal), `beta` ou `publicado`.
- A validação está em `shared/catalogo/manifesto.ts` e roda nos testes.

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
- Fontes: Chakra Petch para títulos e números, Atkinson Hyperlegible para textos.
- Cards grandes e legíveis numa tela compartilhada; nada de texto pequeno no meio da cena.
- Acessibilidade: foco visível, respeito a `prefers-reduced-motion`, contraste alto.

## Marca do canal

- Dados do canal (nome, site, YouTube) ficam só em `shared/brand/canal.ts`.
- Todo jogo mostra o **selo do canal** no menu inicial, o **selo compacto** durante o jogo e os **links do site e do
  YouTube** na pausa e na tela final. Use `seloCanal()` e `linksCanal()` de `shared/brand/selo.ts`.
- O menu do jogo tem um botão "Outros jogos" que volta ao portal (`/`).
- Quando o logo oficial existir, coloque-o em `shared/brand/` e troque o selo provisório em um só lugar.

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
```

Teste no navegador em 1280×720 (tela de aula) e numa largura de celular. O CI repete as verificações.

## Publicação

- Projeto estático na Vercel, comando `npm run build`, pasta `dist`.
- Domínio `games.rapaduracosmica.com.br` apontado para o projeto (registro CNAME para a Vercel).
- Cada jogo fica em `/games/<slug>/`.

## Como criar um jogo novo

1. Crie `games/<slug>/` copiando a estrutura de um jogo existente.
2. Preencha `jogo.json` com `status: "rascunho"` e desenhe `capa.svg` (16:9).
3. Escreva primeiro o roteiro do jogo: fases, missões e os cards, em `content/`.
4. Implemente as fases em `phases/`, reaproveitando `shared/` (cards, missões, painel, física).
5. Crie uma ilustração animada para cada card em `illustrations/`.
6. Acrescente testes para qualquer física nova em `shared/physics/`.
7. Rode as verificações, teste no navegador e mude o status para `beta`.

### Pedido-modelo para um novo chat

> Crie um jogo novo no repositório rapadura-games seguindo o guia (CLAUDE.md / "Guia dos jogos Rapadura Cósmica").
> Tema da aula: **_. Turmas: EF1 e EF2. Ideia das fases: _**. Duração: cerca de \_\_\_ minutos.
