# Jogos Rapadura Cósmica

Jogos de astronomia para o navegador, feitos para as aulas do canal
[Rapadura Cósmica](https://rapaduracosmica.com.br). Publicados em **games.rapaduracosmica.com.br**.

| Jogo                                                | Aula           | Turmas    |
| --------------------------------------------------- | -------------- | --------- |
| [Rumo ao Buraco Negro](games/rumo-ao-buraco-negro/) | Buracos negros | EF1 e EF2 |

## Rodar no computador

Precisa do Node 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar. O portal fica em `/` e cada jogo em `/games/<pasta>/`.

## Comandos

| Comando                           | O que faz                                 |
| --------------------------------- | ----------------------------------------- |
| `npm run dev`                     | servidor local com recarga automática     |
| `npm run build`                   | confere os tipos e gera o site em `dist/` |
| `npm run preview`                 | serve a versão gerada                     |
| `npm test`                        | testes de física e das fichas dos jogos   |
| `npm run lint` / `npm run format` | estilo de código                          |

## Organização e novos jogos

Leia o [CLAUDE.md](CLAUDE.md): ele descreve a estrutura, as regras de código, o padrão dos cards e o passo a passo
para criar um jogo novo.
