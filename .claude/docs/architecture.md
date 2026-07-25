# Arquitetura

## Componentes

```
index.html      → o app inteiro: markup + CSS + JS inline (parser, renderer, tamanho, marcador de linha, barra retrátil, tela cheia, wake lock, registro do SW)
songs.json      → array de caminhos dos .md; a ORDEM define a ordem do seletor
songs/*.md      → as letras, no dialeto de Markdown descrito em lyrics-format.md
sw.js           → service worker: precache dos arquivos core + todas as músicas; network-first
manifest.json   → manifesto PWA (nome, cores, ícones, standalone)
icons/          → icon.svg (fonte) + icon-192.png / icon-512.png (usados pelo manifesto e favicon)
README.md       → instruções para humanos (como ver no tablet, como escrever uma letra)
.claude/docs/   → esta documentação
```

Sem `package.json`, sem build, sem framework, sem CDN de JS. A única dependência externa em runtime é a fonte do Google Fonts, importada via `@import` no `<style>`.

## Fluxo de dados

```
boot()
  fetch('songs.json')            → lista de caminhos
  fetch(cada .md) + parse(md)    → songs[] = [{ title, sections: [{ label, lines: [...] }] }]
  popula <select id="picker">    → option.value = índice, option.text = título vindo do "# " do .md
  lê localStorage['dueto:song']  → render(índice salvo, ou 0 se inválido)

render(i)
  monta o HTML da música inteira em string → stage.innerHTML
  scrollTo(0,0), picker.value = i, salva localStorage['dueto:song']
```

Tudo é carregado de uma vez no boot (todas as músicas ficam em memória). Trocar de música é só re-render — não há novo `fetch`.

## Mapa do `index.html`

Todo o JS vive num único `<script>` no fim do arquivo. Não há módulos, imports nem escopo isolado.

| Símbolo | Linha (aprox.) | Propósito |
|---------|----------------|-----------|
| `VOICES` | ~143 | Mapa `A`/`B`/`AB` → `{ name, cls }`. **Único lugar** para renomear os cantores. `cls` liga o código à cor CSS (`--voice-${cls}`, `.t-${cls}`, `.r-${cls}`) |
| `parse(md)` | ~160 | Markdown → `{ title, sections[] }`. Uma passada linha a linha; ver "Regras do parser" abaixo |
| `renderPitch(text)` | ~186 | Troca `^` por `<span class="pitch">↑</span>` e `_` por `↓`, só quando colados numa palavra (`/\^(?=\S)/`) |
| `lineHtml(ln, isCounter)` | ~192 | Uma linha → `<div class="line">` com fita lateral (`.ribbon`) + texto. Resolve a etiqueta "2ª: Nome" do `[AB>X]` e aplica a classe `counter-text` no contra-canto |
| `render(i)` | ~200 | Monta e injeta a música `i` em `#stage`; persiste o índice |
| `current` / `navigate(delta)` | ~154 / ~223 | Índice da música na tela e navegação sequencial pelas setas `⟨`/`⟩`. Sem wrap-around: `render()` desabilita `#prev` na primeira e `#next` na última |
| marcador de linha | ~230 | Delegação de `pointerdown`/`pointerup` em `#stage`. Toque só conta se o dedo andou <10px (senão arrasto pra rolar marcaria). Uma `.line.marked` por vez, em memória; contra-canto marca a linha principal anterior |
| `boot()` | ~250 | Carrega tudo; em qualquer erro mostra o aviso de `file://` em `.notice` |
| `size` / `apply()` | ~269 | Tamanho da letra: grava `--lyric-size` no `:root` e persiste. Botões `+`/`−` andam de 3px, clamp **22–72px**, padrão 40px |
| botão de tela cheia | ~279 | `#fs` → Fullscreen API. Removido da barra onde a API não existe; estado ligado pela classe `.on` |
| `keepAwake()` | ~296 | `navigator.wakeLock.request('screen')`; re-adquire em `visibilitychange`. Falha silenciosa onde não há suporte |
| `syncSticky()` / `setBar()` | ~313 / ~318 | Esconde a barra ao rolar pra baixo (acumulado >60px) e mostra ao rolar pra cima (>10px) ou com `scrollY < 40`. `syncSticky` grava `--sticky-top` = altura da barra (medida por `ResizeObserver`, porque `flex-wrap` muda a altura) ou `0px` quando escondida |
| registro do SW | ~337 | `navigator.serviceWorker.register('sw.js')` no evento `load` |

### Regras do parser (`parse`)

Aplicadas nessa ordem, por linha já trimada:

1. Linha vazia, ou começando com `<!--` ou `-->` → ignorada.
2. `# ` → título da música (o último vence; padrão `'Sem título'`).
3. `## ` → abre uma nova seção (`label`) e passa a acumular linhas nela.
4. **Antes da primeira `##`, qualquer outra linha é descartada** (`if (!section) continue`). É isso que faz os blocos de comentário no topo dos `.md` sumirem.
5. Demais linhas passam pela regex `^(~)?\[([A-Za-z]+)(?:>([A-Za-z]+))?\]\s*(.*)$`:
   - `~` → é contra-canto: anexa-se como `.counter` da linha **anterior**, não vira linha própria.
   - grupo 2 → código da voz (uppercased); código desconhecido cai em `VOICES.AB` na renderização.
   - grupo 3 → voz que faz a **1ª voz** em `[AB>X]`; a etiqueta exibida mostra o **outro** cantor ("2ª: Fulano").
   - Linha sem marca nenhuma → código `AB`.

## Vozes, cores e classes

| Código | `VOICES[].name` atual | `cls` | Cor | Fita lateral |
|--------|----------------------|-------|-----|--------------|
| `A` | Daniel | `a` | `--voice-a` (#ffb454, quente) | sólida |
| `B` | Ícaro | `b` | `--voice-b` (#5fe6d8, fria) | sólida |
| `AB` | Ambos | `ab` | `--voice-ab` (#f2f0f8, quase branco) | gradiente A→B |

A fita (`.ribbon`) existe para dar redundância à cor — dá pra rastrear quem canta de canto de olho e ajuda quem tem dificuldade com cores.

## Legibilidade de palco

- `--lyric-size` (padrão 40px) governa `.words`; o rótulo da seção escala junto: `clamp(12px, calc(var(--lyric-size) * .5), 30px)`.
- Contra-canto (`.counter-text`) e etiquetas são derivados do mesmo tamanho (`.62em`, `.72em`), então tudo cresce em bloco.
- Letras em peso 700, `line-height` 1.45, `user-select: none` (evita seleção acidental ao tocar na tela).
- Botões de tamanho têm 56×56px — alvo de toque confortável com o tablet a distância.
- Tema escuro fixo; não há alternância claro/escuro.
- Zoom nativo bloqueado (`user-scalable=no` + `touch-action: pan-y`); o controle de tamanho do app substitui o pinch com faixa maior (22–72px).
- Barra do topo retrátil: sai ao rolar pra baixo, volta ao rolar pra cima. O rótulo da seção é `sticky` e acompanha o estado da barra via `--sticky-top`.
- Marcador de linha por toque (`.line.marked`, cores `--mark-bg`/`--mark-line`) — "você está aqui" para não se perder entre refrões repetidos idênticos.
- Botões da barra usam a classe `.tbtn` (56×56px). Não há mais marca "DUETO" no topo: o espaço vale mais que a identidade num app de um usuário.

## Estado persistido

| Chave (`localStorage`) | Valor | Onde é lida/escrita |
|------------------------|-------|---------------------|
| `dueto:song` | Índice numérico da música no array (não o caminho) | `render()` escreve; `boot()` lê com validação de faixa |
| `dueto:size` | Tamanho da letra em px | `apply()` escreve; lido na inicialização |

Como `dueto:song` é um índice, **reordenar `songs.json` muda qual música é restaurada** para quem já usou o app.

O marcador de linha **não** é persistido: significa "onde estou agora nesta música", não uma anotação. Some ao trocar de música (o `innerHTML` é substituído) e ao recarregar.

## PWA / offline (`sw.js`)

- Nome do cache: `dueto-v2` (constante `CACHE`).
- **Install**: pré-cacheia `./`, `./index.html`, `./songs.json`, `./manifest.json` e, em seguida, todos os caminhos listados em `songs.json`. Se estiver offline nesse momento, o precache das músicas falha em silêncio. `skipWaiting()` ativa a versão nova imediatamente.
- **Activate**: apaga todo cache cujo nome ≠ `CACHE` e chama `clients.claim()`.
- **Fetch**: só `GET`. Estratégia **network-first**: tenta a rede, guarda a resposta no cache, e só cai para o cache se a rede falhar. Ou seja, online sempre mostra a versão mais recente; a troca de `CACHE` serve para descartar caches antigos.

## Colaboração (fork ↔ upstream)

- `origin` = `icarosuper/Dueto` (fork do usuário), `upstream` = `DANIDx/Dueto` (repo do Daniel).
- O upstream traz branches de trabalho (`Issue-01`, `Issue-02`) — o conteúdo das vozes das letras costuma vir de lá.
- Integrar upstream com **merge**, não rebase, para não reescrever histórico compartilhado.
- O preview roda no GitHub Pages do próprio fork.
