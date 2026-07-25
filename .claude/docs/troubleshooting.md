# Troubleshooting

## "Não consegui carregar as letras" (aviso cinza no lugar da música)

É o `catch` de `boot()` — algum `fetch` falhou. Na ordem de probabilidade:

1. **Abriu por `file://`.** Servir a pasta (`python3 -m http.server`) — ver [Comandos](commands.md).
2. **Caminho errado em `songs.json`.** Conferir no DevTools → Network qual `.md` deu 404. O caminho é relativo à raiz do repo (`songs/arquivo.md`), sem `./` e sensível a maiúsculas.
3. **`songs.json` com JSON inválido** (vírgula sobrando na última entrada, aspas curvas). O erro aparece no Console.

O aviso é genérico de propósito: qualquer uma das três causas cai nele.

## Música nova não aparece no seletor

O caminho não foi acrescentado em `songs.json`. Criar o `.md` não basta.

## Música aparece com título errado ou "Sem título"

O título vem da primeira linha `# ` do `.md`, não de `songs.json`. Sem `# `, o parser usa `'Sem título'`.

## Uma seção inteira sumiu

O parser só acumula linhas depois de abrir uma seção com `## `. Linhas antes da primeira `##` são descartadas. Conferir se a `##` tem o espaço depois dos dois `#`.

## Texto de comentário aparecendo como letra

Bloco `<!-- ... -->` de várias linhas **dentro** de uma seção: o parser só ignora linhas que começam com `<!--` ou `-->`, então o miolo vira letra. Usar comentário de uma linha só, ou movê-lo para antes da primeira `##`.

## Linha renderizada quebrada / com HTML estranho

O texto vai para `innerHTML` sem escape. Um `<`, `>` ou `&` na letra é interpretado como HTML. Trocar por `&lt;`, `&gt;`, `&amp;`.

## Linha na cor errada

- Marca de voz desconhecida (`[C]`, `[a b]`, espaço antes do `[`) cai em "Ambos" sem avisar. A regex exige a marca no **começo** da linha.
- Se todas as linhas de uma voz estão erradas, o problema é em `VOICES`/`--voice-*`, não no `.md`.

## Mudança publicada não aparece no tablet

O Service Worker é network-first, então com internet a versão nova deveria vir na hora. Se não veio:

1. Confirmar que o GitHub Pages já republicou (Actions/Pages no repo, ~1 min).
2. Cache de HTTP do Pages: recarregar com cache limpo (`Ctrl+Shift+R`).
3. PWA instalado com SW antigo: incrementar `CACHE` em `sw.js` (`dueto-v1` → `dueto-v2`) e publicar; o `activate` apaga os caches antigos.
4. Último recurso no dispositivo: DevTools → Application → Storage → Clear site data, ou desinstalar e reinstalar o PWA.

## App não funciona offline

- O precache das músicas roda no `install` do SW; se o dispositivo estava offline na primeira instalação, ele falha em silêncio. Abrir uma vez online resolve.
- Música adicionada depois só entra no cache quando o dispositivo abrir o app online (aí o handler de `fetch` a guarda).
- SW não registra em `http://` que não seja `localhost` — testar pelo Pages (HTTPS).

## A tela apaga durante o louvor

Wake Lock exige contexto seguro (HTTPS ou localhost) e suporte do navegador (Chromium; Safari iOS 16.4+). Em `http://<ip-local>` não funciona. O código re-adquire o lock ao voltar o foco (`visibilitychange`), mas se o sistema negou, não há fallback — usar o ajuste de tempo de tela do tablet.

## Fontes diferentes do esperado

`Fraunces`/`Figtree` vêm do Google Fonts por `@import` e **não** estão na lista de precache do SW — só entram no cache depois que o app é aberto online uma vez (o handler de `fetch` guarda toda resposta GET). Antes disso, offline, caem para as fontes do sistema (`Georgia` / `system-ui`). Layout e tamanhos não mudam.
