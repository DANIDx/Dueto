# Convenções

Para a sintaxe das letras, ver [Formato das letras](lyrics-format.md).

## Restrições do projeto

O app é servido como arquivo estático direto do repositório pelo GitHub Pages. Isso impõe:

- **Sem etapa de build.** O que está no repo é o que roda. Nada de bundler, transpilador, `package.json` ou pós-processamento.
- **Sem dependências de runtime**, fora a fonte do Google Fonts. Nada de CDN de JS/CSS: offline tem que continuar funcionando.
- **Sem backend.** Todo estado é `localStorage`; todo dado é arquivo no repo.
- **Um arquivo só de app.** HTML, CSS e JS moram em `index.html`. Não separar em `app.js` / `style.css` sem motivo forte — o `sw.js` teria que pré-cachear mais arquivos e a edição deixa de ser em um lugar só.

## Onde mexer em quê

| Quero mudar | Mexo em |
|-------------|---------|
| Nome dos cantores | Objeto `VOICES` em `index.html` (**só** ali) |
| Cores dos cantores | Variáveis `--voice-a` / `--voice-b` / `--voice-ab` no `:root` |
| Tema (fundo, texto, réguas) | `--bg`, `--surface`, `--rule`, `--text`, `--muted` no `:root` |
| Tamanho padrão / limites da letra | `let size = ... || 40` e os clamps `Math.min(72, ...)` / `Math.max(22, ...)` |
| Fontes | `--display` (títulos/rótulos) e `--body` (UI), mais o `@import` do Google Fonts |
| Ordem das músicas | `songs.json` |
| Título exibido de uma música | A linha `# ` do `.md` correspondente |

Regra geral: **editar uma letra nunca deve exigir tocar em `index.html`, e mexer em cor/nome nunca deve exigir tocar num `.md`.** Essa separação é o ponto principal do design.

## Estilo do código em `index.html`

- HTML sem `<html>`, `<head>`, `<body>` explícitos — o navegador infere. Manter assim; não "arrumar" a estrutura só por formalidade.
- CSS: classes curtas e semânticas (`.line`, `.ribbon`, `.words`, `.section-label`), regras de uma linha quando cabem. Cores sempre por variável, nunca hardcoded no seletor.
- Prefixos de voz seguem o `cls` de `VOICES`: `.t-<cls>` para texto, `.r-<cls>` para a fita. Adicionar uma voz nova exige as duas classes + a variável `--voice-<cls>`.
- JS: funções pequenas em escopo global, `const`/`let`, template literals para montar HTML, sem framework. Comentários em português, curtos, explicando o "porquê".
- Tamanhos que precisam acompanhar a letra usam `calc(var(--lyric-size) * fator)` ou `em`, nunca px fixo.
- Recursos opcionais do navegador (Wake Lock, Service Worker) são sempre usados com guarda (`navigator.wakeLock?.`, `if ('serviceWorker' in navigator)`) e falham em silêncio.

## Checklist — adicionar uma música

1. `songs/<artista>-<musica>.md` com `#` de título e seções `##`.
2. Caminho acrescentado em `songs.json`, na posição desejada.
3. Servir localmente e conferir: título no seletor, cores por linha, seções na ordem certa.
4. Se editou `sw.js`/`index.html` junto, bump em `CACHE`.

## Checklist — mudar cantor ou paleta

1. `VOICES` (nomes) e/ou `--voice-*` (cores).
2. Conferir contraste no escuro com a letra grande — a leitura acontece a ~1m de distância, no palco.
3. A legenda do topo e o subtítulo da música saem de `VOICES` automaticamente; não duplicar nomes em outro lugar.

## Checklist — mexer no parser ou na sintaxe

1. Alterar `parse()` / `lineHtml()` / `renderPitch()` em `index.html`.
2. Atualizar o bloco de comentário no topo do `index.html` (é a referência que o Daniel lê ao escrever letra).
3. Atualizar [lyrics-format.md](lyrics-format.md) e a seção correspondente do `README.md`.
4. Verificar que as letras existentes continuam renderizando (o repo já usa `[A]`, `[B]`, `[AB]`, `[AB>A]`, `[AB>B]`, `^`, `_`).
