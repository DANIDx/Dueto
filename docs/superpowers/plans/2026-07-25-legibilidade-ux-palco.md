# Legibilidade e UX de palco — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir os dois atritos que sobraram na leitura em palco — trocar de música e não achar onde se está na letra — com barra que se esconde, rótulo de seção fixo, setas de música, marcador de linha por toque, tela cheia e zoom bloqueado.

**Architecture:** Tudo acontece dentro de `index.html` — markup, CSS e JS inline, sem módulos e sem escopo isolado. Cada feature é um bloco de CSS + um punhado de funções globais penduradas nos elementos da barra ou delegadas em `#stage`. Nenhuma mudança no parser, na sintaxe das letras ou nos `songs/*.md`; nenhuma chave nova de `localStorage`.

**Tech Stack:** HTML + CSS + JavaScript de navegador, zero dependência. APIs usadas: Fullscreen, ResizeObserver, Pointer Events. Verificação manual com `python3 -m http.server`.

**Spec:** `docs/superpowers/specs/2026-07-25-legibilidade-ux-palco-design.md`

## Global Constraints

- **Sem build, sem dependência, sem backend.** Proibido `package.json`, bundler, framework, CDN de JS/CSS. (`.claude/docs/rules.md`)
- **Um arquivo só de app.** HTML, CSS e JS ficam em `index.html`. Não criar `app.js` nem `style.css`.
- **Sem teste automatizado no projeto.** Não existe test runner e não se pode adicionar um. Cada tarefa termina com verificação manual em `http://localhost:8000` — os passos e o resultado esperado estão escritos em cada tarefa.
- **`file://` nunca funciona.** Verificar sempre servindo a pasta: `python3 -m http.server`.
- **Cores sempre por variável CSS**, nunca hardcoded no seletor. (`.claude/docs/conventions.md`)
- **Nome dos cantores só em `VOICES`.** Nunca escrever "Daniel"/"Ícaro" no HTML, CSS ou `.md`.
- **Tamanhos que acompanham a letra** usam `calc(var(--lyric-size) * fator)` ou `em`, nunca px fixo.
- **Recursos opcionais do navegador falham em silêncio** (`navigator.wakeLock?.`, `if ('serviceWorker' in navigator)`) — nunca alerta ao usuário. Vale para a Fullscreen API.
- **Alvo de toque mínimo 56×56px** — leitura a ~1m de distância.
- **`CACHE` do `sw.js` sobe quando `index.html` muda.** O bump está na Task 7 (uma vez para o lote inteiro). **Se você publicar no Pages antes de terminar o plano, bumpe o `CACHE` nesse commit também** — senão quem instalou o PWA fica na versão antiga.
- **Git liberado em `origin`** (`icarosuper/Dueto`); trabalho na branch `feat/legibilidade`. Push para `upstream` (`DANIDx/Dueto`) exige confirmação.
- **Comentários em português**, curtos, explicando o "porquê".

---

## File Structure

| Arquivo | Responsabilidade | Tarefas que tocam |
|---|---|---|
| `index.html` | O app inteiro: `<meta viewport>`, `<style>`, markup da `.topbar` e `<main>`, `<script>` com parser/render/controles | 1–6 |
| `sw.js` | Só a constante `CACHE` | 7 |
| `.claude/docs/architecture.md` | Mapa de símbolos, estado, legibilidade de palco | 7 |
| `.claude/docs/conventions.md` | Tabela "onde mexer em quê" | 7 |
| `.claude/docs/decisions.md` | Três decisões novas | 7 |
| `README.md` | Seção curta de uso no palco (é o doc que o colaborador do upstream lê) | 7 |

Nenhum arquivo novo de código. Nenhum `songs/*.md` tocado.

---

## Task 1: Zoom bloqueado, marca removida e botões unificados

Prepara o terreno: tira o `DUETO` (que ocupava o espaço das setas), bloqueia o zoom, e unifica o estilo dos botões da barra numa classe `.tbtn` — as Tasks 2 e 3 vão pendurar três botões novos nela em vez de duplicar 6 linhas de CSS.

**Files:**
- Modify: `index.html:2` (meta viewport)
- Modify: `index.html:53-57` (`body`)
- Modify: `index.html:66-68` (remover `.brand`)
- Modify: `index.html:71-78` (`.legend`, `.sizer` → `.nav`/`.tools`/`.tbtn`)
- Modify: `index.html:109` (media query citava `.brand`)
- Modify: `index.html:112-120` (markup da `.topbar`)

**Interfaces:**
- Consumes: nada.
- Produces: classe CSS `.tbtn` (botão 56×56 da barra, com `:disabled` a 35% de opacidade); containers `.nav` (esquerda, envolve o `#picker`) e `.tools` (direita); `id="topbar"` no elemento `.topbar`. Tasks 2/3 inserem botões dentro de `.nav`/`.tools`; Task 5 usa `#topbar`.

- [ ] **Step 1: Bloquear zoom no `<meta viewport>`**

`index.html:2` — substituir a linha inteira por:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

- [ ] **Step 2: Bloquear pinch e duplo-toque no `body`**

Em `index.html:53-57`, acrescentar `touch-action: pan-y;` na regra do `body`. Resultado:

```css
  body {
    background: var(--bg); color: var(--text); font-family: var(--body);
    -webkit-font-smoothing: antialiased; line-height: 1.5;
    -webkit-tap-highlight-color: transparent;
    /* pan-y libera rolagem vertical e mata pinch + duplo-toque;
       de brinde, tira o atraso de ~300ms no toque (ajuda o marcador de linha) */
    touch-action: pan-y;
  }
```

- [ ] **Step 3: Remover o CSS da marca**

Apagar as três linhas de `index.html:66-68`:

```css
  .brand { font-family: var(--display); font-weight: 600; font-size: 20px; letter-spacing: .5px; margin-right: auto; }
  .brand span { color: var(--voice-a); }
  .brand em { color: var(--voice-b); font-style: normal; }
```

- [ ] **Step 4: Trocar `.sizer` por `.tbtn` + `.nav`/`.tools`**

Em `index.html:71-78`, substituir o bloco que vai de `.legend` até o `:focus-visible` por:

```css
  .legend { display: flex; gap: 14px; align-items: center; margin-right: auto; }
  .chip { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; color: var(--muted); }
  .dot { width: 12px; height: 12px; border-radius: 4px; }
  .nav, .tools { display: flex; gap: 8px; align-items: center; }
  .tbtn { width: 56px; height: 56px; border-radius: 12px; border: 1px solid var(--rule); background: var(--surface); color: var(--text); font-family: var(--display); font-size: 22px; cursor: pointer; flex: none; }
  .tbtn:active { background: var(--rule); }
  .tbtn:hover { border-color: var(--muted); }
  .tbtn:disabled { opacity: .35; cursor: default; }
  .tbtn:focus-visible, .picker:focus-visible { outline: 2px solid var(--voice-b); outline-offset: 2px; }
```

O `margin-right: auto` migrou da `.brand` para a `.legend` — é ele que empurra o `.tools` para a direita agora que a marca saiu.

- [ ] **Step 5: Tirar `.brand` da media query**

`index.html:109` — remover só a regra da `.brand`, mantendo o resto:

```css
  @media (max-width: 520px) { .legend { order: 3; width: 100%; } .picker { max-width: 100%; } }
```

- [ ] **Step 6: Reescrever o markup da barra**

`index.html:112-120` — substituir o bloco inteiro por:

```html
<div class="topbar" id="topbar">
  <div class="nav">
    <select class="picker" id="picker" aria-label="Escolher música"></select>
  </div>
  <div class="legend" id="legend"></div>
  <div class="tools">
    <button class="tbtn" id="minus" aria-label="Diminuir a letra">A−</button>
    <button class="tbtn" id="plus" aria-label="Aumentar a letra">A+</button>
  </div>
</div>
```

- [ ] **Step 7: Verificar no navegador**

Rodar `python3 -m http.server` e abrir <http://localhost:8000>.

| Checar | Esperado |
|---|---|
| Topo da página | Sem "DUETO". Seletor à esquerda, legenda dos 3 nomes ao lado, `A− A+` colados na direita |
| Clicar `A+` / `A−` | Letra cresce/diminui de 3px por clique, como antes |
| Recarregar | Tamanho e música escolhida voltam (nada quebrou no `localStorage`) |
| DevTools → device toolbar → pinch com duas setas do mouse, ou pinch no tablet | Página **não** dá zoom |
| Duplo-toque na letra | Página **não** dá zoom |
| Rolar com o dedo | Rola normalmente na vertical |

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: bloqueia zoom e libera espaço na barra do topo

Remove a marca DUETO (o app tem um usuario so; o espaco vale mais) e
unifica o estilo dos botoes da barra numa classe .tbtn, para as setas de
musica e o botao de tela cheia entrarem sem duplicar CSS.

Zoom nativo bloqueado por viewport + touch-action: pan-y. O app tem
controle proprio de tamanho (22-72px), mais amplo que o pinch daria, e o
zoom acidental so desalinhava a letra no palco."
```

---

## Task 2: Setas de troca de música

**Files:**
- Modify: `index.html:113-115` (inserir botões na `.nav`)
- Modify: `index.html:132-134` (consts do topo do script)
- Modify: `index.html:180-196` (`render`)
- Modify: `index.html:203` (listener do picker, dentro de `boot`)

**Interfaces:**
- Consumes: `.nav`, `.tbtn` (Task 1).
- Produces: `let current` (índice da música na tela, global); `navigate(delta)` (move `delta` posições na ordem do `songs.json`, sem passar das pontas); `render(i)` passa a manter `current` e o `disabled` dos botões `#prev`/`#next`.

- [ ] **Step 1: Inserir os botões na `.nav`**

Substituir o bloco `.nav` do markup por:

```html
  <div class="nav">
    <button class="tbtn" id="prev" aria-label="Música anterior">⟨</button>
    <select class="picker" id="picker" aria-label="Escolher música"></select>
    <button class="tbtn" id="next" aria-label="Próxima música">⟩</button>
  </div>
```

- [ ] **Step 2: Declarar os elementos e o índice atual**

Em `index.html:132-134`, junto de `stage` e `picker`:

```js
  const stage  = document.getElementById('stage');
  const picker = document.getElementById('picker');
  const prev   = document.getElementById('prev');
  const next   = document.getElementById('next');
  let songs = [];
  let current = 0;   // índice da música na tela — as setas andam a partir dele
```

- [ ] **Step 3: Manter `current` e o estado das setas em `render`**

Em `render(i)` (`index.html:192-196`), acrescentar três linhas ao bloco final:

```js
    stage.innerHTML = html;
    window.scrollTo(0, 0);
    picker.value = i;
    current = i;
    // Sem wrap-around: na última música, ⟩ não faz nada em vez de voltar pra primeira
    prev.disabled = i === 0;
    next.disabled = i === songs.length - 1;
    localStorage.setItem('dueto:song', i);
```

- [ ] **Step 4: Escrever `navigate` e ligar os cliques**

Logo depois da função `render`, antes de `boot`:

```js
  // Ordem do songs.json = ordem do show, então navegação sequencial basta.
  function navigate(delta) {
    const i = current + delta;
    if (i >= 0 && i < songs.length) render(i);
  }
  prev.onclick = () => navigate(-1);
  next.onclick = () => navigate(1);
```

- [ ] **Step 5: Verificar no navegador**

| Checar | Esperado |
|---|---|
| Abrir na primeira música do `songs.json` | `⟨` apagada (35% de opacidade) e sem efeito ao clicar |
| Clicar `⟩` | Vai para a música seguinte da lista, rola para o topo, o seletor mostra o novo título |
| Chegar na última música | `⟩` apagada e sem efeito |
| Escolher uma música pelo seletor e depois clicar `⟩` | Avança a partir da música escolhida (não de onde estava antes) |
| Recarregar depois de navegar com as setas | Volta na mesma música (as setas usam `render`, que grava `dueto:song`) |

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: setas de troca de musica na barra do topo

A ordem do songs.json e a ordem do show, entao navegacao sequencial
resolve: entre uma musica e outra nao precisa mais abrir o seletor,
procurar o titulo e acertar o toque.

Sem wrap-around de proposito: na ultima musica, levar de volta pra
primeira e pior que nao fazer nada."
```

---

## Task 3: Botão de tela cheia

**Files:**
- Modify: `index.html` (bloco `.tools` do markup)
- Modify: `index.html` (regra `.tbtn` — acrescentar `.tbtn.on`)
- Modify: `index.html` (script, logo depois do bloco do `size`/`apply`)

**Interfaces:**
- Consumes: `.tools`, `.tbtn` (Task 1).
- Produces: botão `#fs`. O estado ligado é sinalizado pela classe `.on` no botão (cor da voz B), não por troca de glifo.

- [ ] **Step 1: Inserir o botão na `.tools`**

```html
  <div class="tools">
    <button class="tbtn" id="minus" aria-label="Diminuir a letra">A−</button>
    <button class="tbtn" id="plus" aria-label="Aumentar a letra">A+</button>
    <button class="tbtn" id="fs" aria-label="Tela cheia">⛶</button>
  </div>
```

- [ ] **Step 2: Estilo do estado ligado**

Acrescentar depois de `.tbtn:hover`:

```css
  .tbtn.on { color: var(--voice-b); border-color: var(--voice-b); }
```

O glifo `⛶` **não** muda ao entrar em tela cheia — só a cor. Trocar por um glifo de "sair" arriscaria cair num quadrado vazio numa fonte de tablet sem esse caractere.

- [ ] **Step 3: Ligar o botão**

Depois do bloco do `size`/`apply` (`index.html:217-224`):

```js
  // Tela cheia: some onde a API não existe, igual ao Wake Lock e ao SW.
  const fsBtn = document.getElementById('fs');
  if (!document.documentElement.requestFullscreen) {
    fsBtn.remove();
  } else {
    fsBtn.onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    };
    document.addEventListener('fullscreenchange', () => {
      const on = !!document.fullscreenElement;
      fsBtn.classList.toggle('on', on);
      fsBtn.setAttribute('aria-label', on ? 'Sair da tela cheia' : 'Tela cheia');
    });
  }
```

Nada de restaurar tela cheia no boot: navegador nenhum permite entrar sem gesto do usuário, então a tentativa só geraria um erro engolido.

- [ ] **Step 4: Verificar no navegador**

| Checar | Esperado |
|---|---|
| Clicar `⛶` | Página ocupa a tela inteira; o botão fica ciano |
| Clicar `⛶` de novo | Sai da tela cheia; o botão volta ao cinza |
| Em tela cheia, apertar `Esc` (ou o gesto do sistema no tablet) | Sai, e o botão volta ao cinza sozinho — o ícone não fica dessincronizado |
| Rolar e trocar de música em tela cheia | Tudo funciona igual |

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: botao de tela cheia

Usa a Fullscreen API e se remove da barra onde a API nao existe, mesma
progressive enhancement do Wake Lock. O estado ligado e sinalizado por
cor (classe .on), nao por troca de glifo: um icone de 'sair' poderia
cair num quadrado vazio na fonte do tablet."
```

---

## Task 4: Marcador de linha por toque

Um "você está aqui" que anda: uma linha marcada por vez, só na sessão. Trocar de música limpa a marca junto com o `innerHTML`.

**Files:**
- Modify: `index.html:38-50` (`:root` — variáveis do marcador)
- Modify: `index.html:87-95` (depois das regras de `.line`/`.words`)
- Modify: `index.html` (script, depois de `navigate`/`prev`/`next`)

**Interfaces:**
- Consumes: `#stage` e a estrutura que `lineHtml` gera (`.line`, `.line.counter`, `.ribbon`).
- Produces: classe `.line.marked`; variáveis `--mark-bg` / `--mark-line`; delegação de `pointerdown`/`pointerup`/`pointercancel` em `#stage`. Nenhum estado global exportado — a marca vive no DOM.

- [ ] **Step 1: Variáveis do marcador**

No `:root` (`index.html:38-50`), depois das `--voice-*`:

```css
    /* Marcador de linha — ciano da voz B em baixa opacidade */
    --mark-bg: rgba(95,230,216,.13);
    --mark-line: rgba(95,230,216,.30);
```

- [ ] **Step 2: Estilo da linha marcada**

Depois das regras `.t-a`/`.t-b`/`.t-ab` (`index.html:93-95`):

```css
  .line.marked { background: var(--mark-bg); box-shadow: inset 0 0 0 1px var(--mark-line); border-radius: 10px; margin: 0 -12px; padding: 9px 12px; }
  .line.marked .ribbon { width: 11px; }
```

O `margin` negativo com `padding` igual faz a caixa vazar 12px para as laterais **sem** deslocar o texto — a letra fica exatamente onde estava, só ganha fundo. As outras linhas continuam 100% legíveis de propósito: um marcador errado ou atrasado não custa nada.

- [ ] **Step 3: Delegar o toque em `#stage`**

Depois de `prev.onclick`/`next.onclick`:

```js
  // Marcador "você está aqui": uma linha por vez, só na sessão.
  // render() troca o innerHTML, então trocar de música limpa a marca — é o esperado.
  let touchStart = null;
  stage.addEventListener('pointerdown', e => { touchStart = { x: e.clientX, y: e.clientY }; });
  stage.addEventListener('pointercancel', () => { touchStart = null; });
  stage.addEventListener('pointerup', e => {
    if (!touchStart) return;
    const moved = Math.hypot(e.clientX - touchStart.x, e.clientY - touchStart.y);
    touchStart = null;
    if (moved > 10) return;   // foi arrasto pra rolar, não toque
    let line = e.target.closest('.line');
    if (!line) return;
    // Contra-canto (~[B]) é extensão da linha de cima, não frase própria: marca a de cima.
    if (line.classList.contains('counter')) line = line.previousElementSibling;
    if (!line || !line.classList.contains('line')) return;
    const was = line.classList.contains('marked');
    stage.querySelector('.line.marked')?.classList.remove('marked');
    if (!was) line.classList.add('marked');
  });
```

- [ ] **Step 4: Verificar no navegador**

Abrir "João" (tem contra-canto `~[B]` nas seções `## Final`).

| Checar | Esperado |
|---|---|
| Tocar numa linha | Fundo ciano fraco + contorno; a fita lateral engrossa. O **texto não se move** |
| Tocar em outra linha | A marca migra — nunca sobram duas |
| Tocar na linha já marcada | Desmarca |
| Arrastar a partir de uma linha para rolar | **Não** marca nada |
| Tocar num contra-canto (linha recuada e itálica no `## Final`) | Marca a linha principal logo acima, não o contra-canto |
| Tocar no título, no rótulo da seção ou no fundo | Nada acontece |
| Trocar de música (seta ou seletor) e voltar | A marca sumiu |
| Recarregar | Nenhuma marca (não persiste, de propósito) |
| Aumentar a letra com a marca ativa | A caixa acompanha o tamanho novo |

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: marcador de linha por toque

Tocar numa linha acende um fundo ciano fraco: um 'voce esta aqui' pra
nao se perder entre refroes repetidos identicos. Uma linha por vez, em
memoria — a marca morre ao trocar de musica, que e o esperado, entao nao
entra no localStorage.

Toque so conta se o dedo andou menos de 10px, senao todo arrasto pra
rolar marcaria uma linha. Contra-canto marca a linha principal de cima."
```

---

## Task 5: Barra do topo que se esconde ao rolar

**Files:**
- Modify: `index.html:38-50` (`:root` — `--veil`, `--sticky-top`)
- Modify: `index.html:59-65` (`.topbar`)
- Modify: `index.html` (script, no fim, antes do registro do SW)

**Interfaces:**
- Consumes: `#topbar` (Task 1).
- Produces: classe `.topbar.hidden`; variável CSS `--sticky-top` (altura da barra quando visível, `0px` quando escondida) — **a Task 6 depende dela**; funções `setBar(hidden)` e `syncSticky()`; variável `--veil` (fundo translúcido da barra, reusado pelo rótulo de seção na Task 6).

- [ ] **Step 1: Variáveis no `:root`**

```css
    --veil: rgba(20,19,26,.94);   /* fundo translúcido de barra e rótulo fixo */
    --sticky-top: 0px;            /* offset do rótulo de seção; JS mantém sincronizado */
```

- [ ] **Step 2: Barra translúcida por variável, com transição**

Substituir a regra `.topbar` (`index.html:59-65`) por:

```css
  .topbar {
    position: sticky; top: 0; z-index: 10;
    background: var(--veil); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
    padding: 14px clamp(16px,4vw,40px);
    display: flex; flex-wrap: wrap; align-items: center; gap: 14px 20px;
    transition: transform .2s ease;
  }
  .topbar.hidden { transform: translateY(-100%); }
```

Fica `sticky`, **não** vira `fixed`: sticky mantém a altura reservada no fluxo lá no topo do documento, então esconder com `translateY(-100%)` não abre buraco e dispensa compensar `padding-top` no `main` — compensação que seria frágil, já que a barra tem `flex-wrap` e muda de altura conforme a largura.

O fundo passou de `rgba(20,19,26,.86)` para `--veil` (`.94`): mais opaco, a letra passando atrás atrapalha menos.

- [ ] **Step 3: Escrever o controle de rolagem**

No fim do script, antes do `if ('serviceWorker' in navigator)`:

```js
  // Esconde a barra ao rolar pra baixo (mais letra na tela); volta ao rolar
  // pra cima ou ao chegar no topo da música.
  const topbar = document.getElementById('topbar');
  const root = document.documentElement;
  let lastY = 0, accDown = 0, accUp = 0;

  function syncSticky() {
    // O rótulo de seção gruda embaixo da barra; com a barra escondida, no zero.
    root.style.setProperty('--sticky-top', topbar.classList.contains('hidden') ? '0px' : topbar.offsetHeight + 'px');
  }

  function setBar(hidden) {
    if (topbar.classList.contains('hidden') === hidden) return;
    topbar.classList.toggle('hidden', hidden);
    syncSticky();
  }

  // A barra tem flex-wrap: a altura muda com a largura, então é medida, não hardcoded.
  new ResizeObserver(syncSticky).observe(topbar);

  window.addEventListener('scroll', () => {
    const y = Math.max(0, window.scrollY);
    const d = y - lastY;
    lastY = y;
    if (y < 40) { accDown = accUp = 0; setBar(false); return; }
    // Acumula em vez de reagir a cada delta: rolagem suave manda deltas de 2-3px.
    if (d > 0) { accUp = 0; accDown += d; if (accDown > 60 && y > topbar.offsetHeight) setBar(true); }
    else if (d < 0) { accDown = 0; accUp -= d; if (accUp > 10) setBar(false); }
  }, { passive: true });
```

- [ ] **Step 4: Verificar no navegador**

Abrir uma música longa (`songs/julliany-souza-ah-jesus-coracao-igual-ao-teu.md` é a maior).

| Checar | Esperado |
|---|---|
| Rolar para baixo ~60px+ | Barra desliza para cima e sai, em ~200ms |
| Continuar rolando para baixo | Barra continua fora, sem piscar nem tremer |
| Rolar para cima um tiquinho | Barra volta |
| Rolar até o topo | Barra visível |
| Trocar de música com a barra escondida (dá para chegar ao seletor rolando pra cima) | `render` rola para o topo, a barra volta sozinha |
| Estreitar a janela até a barra quebrar em duas linhas | Nada de layout quebrado; `--sticky-top` no DevTools (`:root`) igual à nova altura da barra |
| DevTools → Elements → `:root` → conferir `--sticky-top` com a barra escondida | `0px` |

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: barra do topo se esconde ao rolar

Ganha ~85px de letra na tela, que e o que se olha 95% do show. Volta ao
rolar pra cima e sempre no topo da musica.

Continua sticky com transform em vez de virar fixed: sticky ja reserva a
altura no fluxo, entao nao precisa compensar padding-top no main —
compensacao fragil, porque a barra tem flex-wrap e muda de altura."
```

---

## Task 6: Rótulo de seção fixo no topo

Com refrões repetidos idênticos, o rótulo é o que diz onde você está sem precisar ler a letra.

**Files:**
- Modify: `index.html:84` (`.section`)
- Modify: `index.html:85` (`.section-label`)

**Interfaces:**
- Consumes: `--sticky-top` e `--veil` (Task 5).
- Produces: nada — é só CSS.

- [ ] **Step 1: Trocar margem por padding na seção**

`index.html:84`:

```css
  .section { padding-bottom: 40px; }
```

Margem **não** faz parte da caixa que delimita um elemento `sticky`: com `margin-bottom`, o rótulo desgruda e desaparece durante os 40px entre seções. Com `padding-bottom`, o vão pertence à seção e o rótulo fica preso até o rótulo seguinte empurrá-lo.

- [ ] **Step 2: Grudar o rótulo**

`index.html:85` — substituir a regra inteira por:

```css
  .section-label { position: sticky; top: var(--sticky-top); z-index: 5; background: var(--veil); backdrop-filter: blur(12px); font-family: var(--display); font-style: italic; font-weight: 500; font-size: clamp(12px, calc(var(--lyric-size) * .5), 30px); letter-spacing: .3px; color: var(--muted); text-transform: lowercase; margin: 0 -12px 12px; padding: 6px 12px 8px; border-bottom: 1px solid var(--rule); }
```

Mudou: `position`/`top`/`z-index`/`background`/`backdrop-filter` entraram; `margin` ganhou `-12px` nas laterais e o `padding` compensa — os mesmos 12px que a linha marcada vaza, para o fundo do rótulo cobrir a marca inteira quando ela passa por baixo. `z-index: 5` fica abaixo do `10` da barra, então a barra passa por cima do rótulo, nunca o contrário.

- [ ] **Step 3: Verificar no navegador**

Abrir "João" (tem `## Refrão` repetido idêntico duas vezes, `## Verso 2`, `## Ponte (2x)` e três `## Final`).

| Checar | Esperado |
|---|---|
| Rolar devagar dentro do refrão | "refrão" fica colado no topo, logo abaixo da barra |
| Rolar até a seção seguinte | O rótulo novo empurra o antigo para fora e assume o lugar |
| Rolar pelo vão entre duas seções | Sempre tem um rótulo grudado — não pisca nem some |
| Rolar para baixo até a barra se esconder | O rótulo sobe e gruda no topo da tela (`--sticky-top: 0px`) |
| Rolar para cima e a barra voltar | O rótulo desce e volta a ficar abaixo da barra, sem sobrepor |
| Passar a letra por baixo do rótulo | A letra fica atrás do fundo opaco; não dá para ler duas coisas ao mesmo tempo |
| Marcar uma linha e rolar até ela passar por baixo do rótulo | A caixa ciana desaparece atrás do rótulo, inclusive nas laterais que vazam 12px |
| Aumentar a letra com `A+` | O rótulo cresce junto (`calc(var(--lyric-size) * .5)`), sem sobrepor a barra |

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: rotulo de secao fixo no topo enquanto rola

Com refroes repetidos identicos, o rotulo e o que diz onde voce esta sem
precisar ler a letra. Gruda embaixo da barra e sobe pro zero quando ela
se esconde, seguindo --sticky-top.

.section troca margin-bottom por padding-bottom: margem nao conta pra
caixa do sticky, entao com margem o rotulo desgrudava e sumia nos 40px
entre secoes."
```

---

## Task 7: Bump do `CACHE` e documentação

Sem isso, quem instalou o PWA continua na versão antiga.

**Files:**
- Modify: `sw.js:1`
- Modify: `.claude/docs/architecture.md` (linha 6, linha 13, tabela de símbolos, "Legibilidade de palco", seção do PWA)
- Modify: `.claude/docs/conventions.md` (tabela "onde mexer em quê")
- Modify: `.claude/docs/decisions.md` (três entradas novas)
- Modify: `README.md` (seção nova)

**Interfaces:**
- Consumes: tudo das Tasks 1–6.
- Produces: nada.

- [ ] **Step 1: Bump do `CACHE`**

`sw.js:1`:

```js
const CACHE = 'dueto-v2';
```

- [ ] **Step 2: Atualizar `architecture.md` — componentes**

Linha 6, acrescentar as responsabilidades novas do `index.html`:

```
index.html      → o app inteiro: markup + CSS + JS inline (parser, renderer, tamanho, marcador de linha, barra retrátil, tela cheia, wake lock, registro do SW)
```

Linha 13 está errada (`docs/agents/` não existe) — corrigir de passagem:

```
.claude/docs/   → esta documentação
```

- [ ] **Step 3: Atualizar `architecture.md` — tabela de símbolos**

Acrescentar ao fim da tabela (as linhas aproximadas mudaram com as edições; conferir no arquivo):

```markdown
| `current` / `navigate(delta)` | ~135 / ~198 | Índice da música na tela e navegação sequencial pelas setas `⟨`/`⟩`. Sem wrap-around: `render()` desabilita `#prev` na primeira e `#next` na última |
| marcador de linha | ~205 | Delegação de `pointerdown`/`pointerup` em `#stage`. Toque só conta se o dedo andou <10px (senão arrasto pra rolar marcaria). Uma `.line.marked` por vez, em memória; contra-canto marca a linha principal anterior |
| botão de tela cheia | ~232 | `#fs` → Fullscreen API. Removido da barra onde a API não existe; estado ligado pela classe `.on` |
| `setBar()` / `syncSticky()` | ~248 | Esconde a barra ao rolar pra baixo (acumulado >60px) e mostra ao rolar pra cima (>10px) ou com `scrollY < 40`. `syncSticky` grava `--sticky-top` = altura da barra (medida por `ResizeObserver`, porque `flex-wrap` muda a altura) ou `0px` quando escondida |
```

- [ ] **Step 4: Atualizar `architecture.md` — legibilidade de palco**

Acrescentar à lista da seção "Legibilidade de palco":

```markdown
- Zoom nativo bloqueado (`user-scalable=no` + `touch-action: pan-y`); o controle de tamanho do app substitui o pinch com faixa maior (22–72px).
- Barra do topo retrátil: sai ao rolar pra baixo, volta ao rolar pra cima. O rótulo da seção é `sticky` e acompanha o estado da barra via `--sticky-top`.
- Marcador de linha por toque (`.line.marked`, cores `--mark-bg`/`--mark-line`) — "você está aqui" para não se perder entre refrões repetidos idênticos.
- Botões da barra usam a classe `.tbtn` (56×56px). Não há mais marca "DUETO" no topo: o espaço vale mais que a identidade num app de um usuário.
```

- [ ] **Step 5: Atualizar `architecture.md` — PWA e estado**

Na seção "PWA / offline", trocar `dueto-v1` por `dueto-v2`.

Na tabela "Estado persistido", acrescentar abaixo dela:

```markdown
O marcador de linha **não** é persistido: significa "onde estou agora nesta música", não uma anotação. Some ao trocar de música (o `innerHTML` é substituído) e ao recarregar.
```

- [ ] **Step 6: Atualizar `conventions.md`**

Acrescentar linhas à tabela "Onde mexer em quê":

```markdown
| Cor do marcador de linha | `--mark-bg` / `--mark-line` no `:root` |
| Fundo translúcido da barra e do rótulo fixo | `--veil` no `:root` |
| Sensibilidade da barra retrátil | Limiares `accDown > 60`, `accUp > 10` e `y < 40` no listener de `scroll` |
| Tolerância do toque que marca linha | `moved > 10` no `pointerup` de `#stage` |
| Estilo dos botões da barra | Classe `.tbtn` (um lugar só para os três grupos: setas, tamanho, tela cheia) |
```

- [ ] **Step 7: Três entradas novas em `decisions.md`**

Acrescentar ao fim, seguindo o formato das outras (título, "Como parece", "Por que está certo", "Não 'consertar'"):

```markdown
---

### 9. Marcador de linha não é persistido

**Como parece:** esquecimento — tamanho da letra e música atual vão para o `localStorage`, mas a linha marcada não.

**Por que está certo:** a marca significa "onde estou agora nesta música", não uma anotação de ensaio. Restaurá-la ao abrir colocaria na tela um "você está aqui" de dias atrás, que é pior que nenhum. Morrer com a troca de música sai de graça: `render()` substitui o `innerHTML`.

**Não "consertar"** salvando em `localStorage`. Marcação permanente de trecho difícil foi avaliada e recusada: toque acidental deixaria lixo na tela.

---

### 10. Zoom nativo bloqueado de propósito

**Como parece:** erro de acessibilidade — `user-scalable=no` é justamente o que as boas práticas mandam não fazer.

**Por que está certo:** o app tem controle de tamanho próprio, de 22 a 72px, faixa maior que o pinch daria, e ele persiste. O zoom nativo só produzia desalinhamento acidental no meio do louvor, com a letra cortada na horizontal e sem jeito óbvio de voltar. `touch-action: pan-y` reforça (mata pinch e duplo-toque) e de brinde tira o atraso de ~300ms no toque, o que o marcador de linha aproveita.

**Não "consertar"** liberando o zoom sem antes tirar os botões `A−`/`A+` — são a alternativa que justifica o bloqueio.

---

### 11. Barra retrátil é `sticky` com `transform`, não `fixed`

**Como parece:** o natural para uma barra que aparece e desaparece seria `position: fixed`.

**Por que está certo:** `sticky` mantém a altura da barra reservada no fluxo, no topo do documento, então `translateY(-100%)` a tira da vista sem abrir buraco e sem precisar de `padding-top` compensatório no `main`. Com `fixed`, essa compensação seria obrigatória — e frágil, porque a barra tem `flex-wrap` e muda de altura conforme a largura, exigindo remedir e reescrever o padding a cada `resize`.

**Não "consertar"** trocando por `fixed`. A altura já é medida por `ResizeObserver`, mas só para posicionar o rótulo de seção (`--sticky-top`), que é um offset e não um espaçador.
```

- [ ] **Step 8: Seção nova no `README.md`**

Depois de "Testar no computador", antes de "Escrever uma letra":

```markdown
## Usar no palco

- **Trocar de música:** setas `⟨` `⟩` na barra do topo seguem a ordem do `songs.json`, que é a ordem do show. O seletor continua ali para pular fora da sequência.
- **Tamanho da letra:** `A−` / `A+` (22 a 72px). Fica salvo. O zoom do navegador está desligado de propósito — use esses botões.
- **Não se perder:** toque numa linha para marcá-la; toque em outra para mover a marca, ou na mesma para tirar. A marca é só da sessão.
- **Mais tela:** a barra do topo sai ao rolar para baixo e volta ao rolar para cima. O botão `⛶` põe em tela cheia.
- **O nome da seção** (Verso, Refrão...) fica fixo no topo enquanto você rola.
- A tela não apaga sozinha enquanto o app está aberto.
```

- [ ] **Step 9: Verificação final — o roteiro inteiro**

Com `python3 -m http.server` rodando, passar pelos 8 itens da seção "Verificação" do spec de uma vez, numa mesma sessão, incluindo os dois que dependem do bump:

1. Barra some ao rolar pra baixo, volta ao rolar pra cima e no topo.
2. Rótulo da seção troca sozinho e não pisca no vão entre seções.
3. `⟨` desabilitada na primeira música, `⟩` na última; setas e seletor sempre concordam.
4. Toque marca; arrasto não marca; tocar na marcada desmarca; trocar de música limpa.
5. Toque em contra-canto marca a linha de cima.
6. `⛶` entra e sai; sair pelo `Esc`/gesto do sistema atualiza a cor do botão.
7. Pinch e duplo-toque não dão zoom; `A−`/`A+` funcionam e sobrevivem ao reload.
8. **Offline:** DevTools → Application → Service Workers, confirmar cache `dueto-v2` (e que `dueto-v1` sumiu); então Network → Offline e recarregar — a letra continua abrindo.

Registrar qualquer divergência antes de commitar.

- [ ] **Step 10: Commit e push**

```bash
git add sw.js .claude/docs README.md
git commit -m "chore: bump do CACHE para dueto-v2 e docs de UX de palco

index.html mudou, entao o CACHE sobe: sem isso quem instalou o PWA fica
na versao antiga. Documenta as features novas em architecture.md e
conventions.md, registra tres decisoes em decisions.md (marcador nao
persistido, zoom bloqueado, sticky+transform em vez de fixed) e explica
o uso no palco no README (o doc que o colaborador do upstream le).

Corrige de passagem o caminho dos docs em architecture.md: .claude/docs,
nao docs/agents."
git push origin feat/legibilidade
```

---

## Notas de execução

- **Ordem importa em um ponto só:** a Task 6 consome `--sticky-top`, criado na Task 5. Fazer 6 antes de 5 deixa o rótulo grudado em `top: 0px` por baixo da barra. As outras são independentes.
- **Não publicar no Pages no meio do plano** sem bumpar o `CACHE` no commit correspondente (ver Global Constraints).
- **Nenhum `songs/*.md` deve aparecer no `git status`** em nenhuma tarefa. Se aparecer, algo saiu do escopo.
