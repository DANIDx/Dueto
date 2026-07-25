# Legibilidade e UX para leitura no palco

**Data:** 2026-07-25
**Escopo:** `index.html`, `sw.js`, docs em `.claude/docs/`

## Problema

O Dueto já resolve tamanho de fonte e tela apagando. Sobraram dois atritos num show real:

1. **Trocar de música entre uma e outra.** O `<select>` exige abrir a lista, achar o título e acertar o toque.
2. **Densidade do texto.** Mesmo com fonte grande, é difícil bater o olho e achar onde se está — refrões repetidos idênticos, linhas parecidas, muita coisa junta.

Rolar durante a música **não** é um problema, e a ordem do show é definida antes e cumprida. Isso descarta setlist separada, auto-scroll e busca por digitação.

## Contexto que restringe o design

- Tablet **Android / Chrome**. Fullscreen API funciona e `user-scalable=no` é respeitado — sem gambiarra de iOS.
- Ordem do show = ordem do `songs.json`. Navegação sequencial basta.
- Valem as restrições do projeto: sem build, sem dependência, tudo em `index.html`, tema escuro fixo, estado em `localStorage`.

## Features

### 1. Barra do topo que se esconde

Sai a marca `DUETO` (o app tem um usuário só; o espaço vale mais que a identidade). A barra fica: `⟨` `[seletor]` `⟩` · legenda · `A−` `A+` `⛶`.

Continua `position: sticky` — **não** virar `fixed`. Sticky mantém a altura reservada no fluxo, no topo do documento, então esconder com `transform: translateY(-100%)` não abre buraco nenhum e dispensa compensar com `padding-top` no `main`. Transição de 200ms.

Regra de rolagem, com histerese pra não tremer:

- Esconde ao rolar **para baixo** acumulando mais de ~60px, e só se `scrollY` já passou da altura da barra.
- Volta ao rolar **para cima** mais de ~10px.
- Volta sempre que `scrollY < 40` (topo da música — inclusive depois de `render()`, que faz `scrollTo(0,0)`).

### 2. Rótulo da seção fixo no topo

`.section-label` ganha `position: sticky; top: var(--sticky-top)` e fundo opaco (`--bg` + `backdrop-filter: blur`, coerente com a barra). Com refrões repetidos idênticos, o rótulo é o que diz onde você está sem precisar ler a letra.

`--sticky-top` acompanha o estado da barra: altura da barra quando visível, `0` quando escondida. A altura é **medida** com `ResizeObserver` sobre a `.topbar` — ela usa `flex-wrap` e `padding: clamp()`, logo muda de altura conforme a largura. Não hardcodar px.

`.section` troca `margin-bottom: 40px` por `padding-bottom: 40px`. Margem não faz parte da caixa que delimita o sticky, então com margem o rótulo desgruda e desaparece durante os 40px entre seções; com padding ele fica preso até o rótulo seguinte empurrá-lo.

### 3. Setas de música `⟨` `⟩`

Dois botões colados ao seletor, no mesmo tamanho dos do `sizer` (56px), navegando a ordem do `songs.json`. Reaproveitam `render(i)` — que já rola pro topo, sincroniza o `<select>` e grava `dueto:song`.

**Sem wrap-around.** Na primeira música `⟨` fica desabilitada; na última, `⟩`. Estado atualizado a cada `render()`. Dar a volta na última música é pior que não fazer nada: você olha esperando a próxima e está na primeira.

### 4. Marcador de linha

Uma linha marcada por vez — um "você está aqui" que anda. Estado em memória, não em `localStorage`: trocar de música limpa naturalmente junto com o `innerHTML`, e é o comportamento esperado.

Interação por delegação de evento em `#stage`:

- Toque numa `.line` não marcada → marca.
- Toque na linha marcada → desmarca.
- Toque em outra linha → move a marca.
- Toque num `.line.counter` (contra-canto `~[B]`) → marca a `.line` principal anterior. O contra-canto é extensão da linha de cima, não uma frase própria; marcá-lo isolado não significa nada.
- Toques fora de `.line` (título, rótulo de seção, fundo) não fazem nada.

**Toque vs. rolagem:** `pointerdown` guarda `clientX/clientY`; `pointerup` só marca se o dedo andou menos de ~10px. Sem esse limiar, todo arrasto pra rolar marcaria uma linha.

**Visual** (escolhido sobre "apagar o resto" e "seta na margem" — as outras linhas continuam 100% legíveis, então um marcador errado ou atrasado não custa nada):

- `background: rgba(95,230,216,.13)` (a cor da voz B, ciano, em baixa opacidade)
- contorno interno de 1px em `rgba(95,230,216,.30)`
- fita de 7px → 11px
- `border-radius` com `margin`/`padding` horizontais compensando, pra caixa respirar sem deslocar o texto

### 5. Botão de tela cheia

`⛶` na barra → `documentElement.requestFullscreen()` / `document.exitFullscreen()`. O ícone alterna ouvindo `fullscreenchange` (cobre também a saída pelo gesto do sistema).

Se `documentElement.requestFullscreen` não existir, o botão **não é inserido** — mesma progressive enhancement do Wake Lock e do Service Worker (decisão nº 7: recurso opcional falha em silêncio, nunca com alerta no meio do louvor).

O estado não persiste entre sessões: navegador nenhum permite entrar em tela cheia sem gesto do usuário, então tentar restaurar no boot só geraria erro engolido.

### 6. Bloqueio de zoom

- `viewport`: acrescentar `maximum-scale=1, user-scalable=no`.
- `body`: `touch-action: pan-y` — mata pinch e duplo-toque, permite rolar na vertical, e de brinde elimina o atraso de ~300ms no toque, o que deixa o marcador responsivo.

Isso remove a saída de emergência do usuário pro tamanho do texto, o que normalmente é problema de acessibilidade. Aqui é aceitável e proposital: o app tem o próprio controle de tamanho (22–72px, mais amplo que o pinch daria) e o zoom nativo só causava desalinhamento acidental no palco.

## Fora de escopo

Descartado por decisão explícita, não por esquecimento:

- **Teclado / pedal Bluetooth** (page-turner) — sem pedal no setup.
- **Marcador persistido por música** — a marca deve morrer com a troca de música.
- **Setlist separada do `songs.json`** — a ordem do arquivo já é a ordem do show.
- **Marcar vários trechos (marca-texto)** — toque acidental deixaria lixo na tela.
- **Auto-scroll** — rolar não é um atrito.

## Impacto em arquivos

| Arquivo | Mudança |
|---|---|
| `index.html` | Todas as 6 features: `viewport`, CSS (`.topbar`, `.section-label`, `.section`, `.line.marked`, botões), JS (scroll handler, `ResizeObserver`, setas, marcador, fullscreen), remoção da `.brand` |
| `sw.js` | Bump `CACHE`: `dueto-v1` → `dueto-v2` (obrigatório — quem instalou o PWA continuaria na versão antiga) |
| `.claude/docs/architecture.md` | Novas funções e o estado em memória do marcador |
| `.claude/docs/conventions.md` | Tabela "onde mexer em quê": limiares de rolagem, cor do marcador |
| `.claude/docs/decisions.md` | Três decisões novas (abaixo) |

Nenhuma chave nova de `localStorage`. Nenhuma mudança no parser nem na sintaxe das letras — nenhum `songs/*.md` é tocado.

## Decisões a registrar em `decisions.md`

1. **Marcador não persiste.** Parece esquecimento não salvar em `localStorage` quando tudo mais é salvo. É proposital: a marca significa "onde estou agora nesta música", não uma anotação.
2. **Zoom bloqueado de propósito.** Parece erro de acessibilidade. O app tem controle de tamanho próprio mais amplo; o pinch só atrapalhava.
3. **Barra sticky com `transform`, não `fixed`.** Parece que `fixed` seria o natural pra esconder. Sticky evita compensar altura no `main`, e a altura variável (`flex-wrap`) tornaria essa compensação frágil.

## Verificação

Sem testes automatizados no projeto. Roteiro manual, servindo com `python3 -m http.server`:

1. Barra some ao rolar pra baixo, volta ao rolar pra cima e ao chegar no topo.
2. Rótulo da seção troca sozinho ao passar de "verso 2" → "refrão" → "ponte", e não pisca no vão entre seções.
3. `⟨` desabilitada na primeira música, `⟩` na última; setas e seletor sempre concordam.
4. Toque marca; arrastar pra rolar não marca; tocar na marcada desmarca; trocar de música limpa a marca.
5. Toque num contra-canto marca a linha de cima.
6. `⛶` entra e sai de tela cheia; sair pelo gesto do sistema atualiza o ícone.
7. Pinch e duplo-toque não dão zoom; `A−`/`A+` continuam funcionando e sobrevivem ao reload.
8. Com o app já instalado, um reload puxa a versão nova (bump do `CACHE`); depois, em modo avião, a letra continua abrindo.
