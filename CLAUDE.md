# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dueto = página estática, **sem build e sem dependências**. Um único `index.html` (HTML + CSS + JS inline) lê `songs.json`, busca cada `songs/*.md`, faz o parse de um dialeto próprio de Markdown e renderiza a letra colorida por cantor. Pensado para ler num tablet enquanto se canta em dupla: fonte grande e ajustável, tela que não apaga (Wake Lock) e funcionamento offline (PWA + service worker). Publicado via GitHub Pages.

Não há backend, testes automatizados, gerenciador de pacotes ou pipeline de build. Todo o "app" cabe em 4 arquivos: `index.html`, `songs.json`, `sw.js`, `manifest.json`.

## Importante — depois de qualquer mudança

1. **Testar servindo a pasta**: `python3 -m http.server` e abrir <http://localhost:8000>. Abrir por `file://` **nunca** funciona (o `fetch` dos `.md` é bloqueado).
2. **Música nova**: criar `songs/<slug>.md` **e** acrescentar o caminho em `songs.json` — só o arquivo não aparece no seletor.
3. **Mexeu em `sw.js`, `index.html`, `songs.json` ou `manifest.json`**: incrementar a constante `CACHE` em `sw.js` (`dueto-v1` → `dueto-v2`), senão quem já instalou o PWA continua com a versão antiga.
4. **Atualizar docs**: mudou o parser, a sintaxe das letras, as chaves de `localStorage` ou a lista de arquivos → atualizar o doc correspondente em `.claude/docs/`; criou um padrão não óbvio → registrar em `decisions.md`.
5. **Git liberado neste repo**: commitar, criar branch e dar push em `origin` (`icarosuper/Dueto`) sem pedir. Só `upstream` (`DANIDx/Dueto`, repo de outra pessoa) exige confirmação.

## Docs

- [Arquitetura](.claude/docs/architecture.md) — ler ao navegar/alterar o código; mapeia todos os arquivos, funções do `index.html`, fluxo de dados, `localStorage` e PWA
- [Formato das letras](.claude/docs/lyrics-format.md) — ler ao escrever ou editar qualquer `songs/*.md`; gramática completa (`[A]`, `[AB>B]`, `~[B]`, `^`, `_`) e o que o parser ignora
- [Convenções](.claude/docs/conventions.md) — ler antes de editar `index.html`; onde ficam cores, nomes, tamanhos, e as restrições do projeto
- [Regras](.claude/docs/rules.md) — ler ao adicionar/remover arquivos ou na dúvida sobre uma convenção
- [Decisões](.claude/docs/decisions.md) — ler antes de "consertar" algo que parece errado; documenta escolhas intencionais
- [Comandos](.claude/docs/commands.md) — servir localmente, publicar no Pages, fluxo de fork/upstream
- [Troubleshooting](.claude/docs/troubleshooting.md) — seguir quando a página não carrega, a letra não atualiza ou o offline falha
