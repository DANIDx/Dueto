# Regras

Regras obrigatórias. Complementam as [Convenções](conventions.md).

## Conteúdo

### Toda música nova entra em `songs.json`

Criar o `.md` não basta: o app só conhece o que está listado em `songs.json`. Arquivo órfão em `songs/` = música invisível. Da mesma forma, remover uma música exige apagar as duas coisas (arquivo e entrada).

### Nunca reescrever a letra "melhorando" o texto

Os `.md` são letra de música e marcação de ensaio decidida pela dupla. Corrigir divisão de linhas, trocar `[A]` por `[B]`, "unificar" repetições ou reescrever versos muda o combinado do ensaio. Alterar marcação de voz só quando pedido explicitamente.

## Código

### Não introduzir build, dependência ou backend

Sem `package.json`, bundler, framework, CDN de JS/CSS ou servidor. O repo é servido cru pelo GitHub Pages e precisa funcionar offline. Qualquer proposta nessa direção é uma mudança de arquitetura — perguntar antes, não fazer de passagem.

### `CACHE` do `sw.js` sobe quando os arquivos core mudam

Alterou `index.html`, `sw.js`, `manifest.json` ou a estrutura de `songs.json` → incrementar `dueto-vN`. Sem isso, o `activate` não limpa o cache antigo dos dispositivos que já instalaram o PWA.

### Nome dos cantores só em `VOICES`

Nunca escrever "Daniel" ou "Ícaro" direto no HTML, no CSS ou num `.md`. A legenda, o subtítulo da música e a etiqueta "2ª:" derivam todos de `VOICES`.

## Documentação

### Mudou parser, sintaxe ou arquivos → atualizar os docs junto

- Sintaxe das letras → [lyrics-format.md](lyrics-format.md) **e** o bloco de comentário no topo do `index.html` **e** o `README.md`.
- Funções, chaves de `localStorage`, arquivos criados/removidos → [architecture.md](architecture.md).
- Padrão não óbvio introduzido de propósito → uma entrada em [decisions.md](decisions.md).

O `README.md` é para humanos (inclusive o colaborador do upstream); `.claude/docs/` é para agentes. Os dois precisam concordar sobre a sintaxe das letras.

## Git

### Commitar e dar push em `origin` é liberado

Neste repo o agente mexe no git à vontade: commit, branch e push em `origin` (`icarosuper/Dueto`) sem pedir permissão a cada vez.

A exceção é `upstream` (`DANIDx/Dueto`): é o repo de outra pessoa, então push ou PR pra lá se confirma antes.

### Integrar o upstream com merge, não rebase

`upstream` = `DANIDx/Dueto`. O histórico é compartilhado com outra pessoa; rebase reescreveria commits que já estão publicados.
