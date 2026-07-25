# Formato das letras (`songs/*.md`)

Dialeto próprio de Markdown, interpretado por `parse()` em `index.html`. **Não é Markdown padrão** — negrito, listas, links etc. não são interpretados (viram texto cru dentro de HTML, ver "Armadilhas").

## Esqueleto

```markdown
# Título da Música
<!--
  Artista / notas de ensaio — comentários aqui em cima somem.
-->

## Verso 1
[A] linha cantada pelo cantor A
[B] linha cantada pelo cantor B

## Refrão
[AB] linha cantada pelos dois
linha sem marca também é "ambos"
```

## Gramática

| Sintaxe | Efeito |
|---------|--------|
| `# Texto` | Título da música. É o que aparece no seletor — **não** vem de `songs.json` |
| `## Texto` | Abre uma seção (Verso 1, Refrão, Ponte, Final...). Rótulo renderizado em itálico minúsculo |
| `[A] texto` | Linha do cantor A (cor quente) |
| `[B] texto` | Linha do cantor B (cor fria) |
| `[AB] texto` | Os dois juntos (quase branco, fita em gradiente) |
| `texto` (sem marca) | Equivale a `[AB]` |
| `[AB>A] texto` | Os dois cantam, **A faz a 1ª voz** (melodia) e B a 2ª (harmonia). A etiqueta "2ª: <nome de B>" fica **à esquerda** da linha, na cor de quem faz a 2ª voz |
| `[AB>B] texto` | Idem, invertido |
| `~[B] texto` | **Contra-canto**: cola na linha ANTERIOR e é cantado em paralelo com ela — não é a próxima frase. Renderiza recuado, menor e em itálico. Aceita `~[A]`, `~[B]`, `~[AB]` |
| `^palavra` | Melodia sobe nessa palavra → `↑palavra`. O `^` tem que estar **colado** na palavra |
| `_palavra` | Melodia desce nessa palavra → `↓palavra`. Também colado |
| `<!-- ... -->` | Comentário — ver a ressalva abaixo |

Uso atual no repo: `[A]`, `[B]`, `[AB]`, `[AB>A]` e `[AB>B]` aparecem nas músicas; `~[X]` é suportado mas ainda não usado por nenhuma letra.

## Convenções de escrita

- **Uma frase cantada por linha.** É a unidade visual da leitura no palco; não juntar duas frases numa linha só para poupar espaço.
- Repetições que mudam de voz são escritas por extenso (o refrão aparece de novo com `[AB>B]` em vez de `[AB>A]`), em vez de anotar "2x". Repetições idênticas podem usar `## Refrão (2x)` no rótulo da seção.
- Nome do arquivo: `songs/<artista-slug>-<musica-slug>.md`, minúsculo, sem acento, hifenizado (ex.: `eli-soares-os-anjos-te-louvam.md`).
- Acentos e maiúsculas normais **no texto da letra** — só o nome do arquivo é slug.

## Adicionar uma música

1. Criar `songs/<slug>.md` com `#` de título e pelo menos uma `##`.
2. Acrescentar o caminho em `songs.json` — sem isso a música não existe para o app.
3. Posição em `songs.json` = posição no seletor.
4. Se `sw.js` foi tocado no mesmo trabalho, incrementar `CACHE`. Só adicionar música não exige bump (o SW é network-first e re-cacheia sozinho), mas quem estiver offline só verá a música nova depois de abrir online uma vez.

## Armadilhas

- **Comentários só somem antes da primeira `##`.** O parser ignora linhas que *começam* com `<!--` ou `-->`; as linhas do meio de um bloco de comentário são descartadas apenas porque ainda não há seção aberta. Um `<!-- ... -->` de várias linhas **dentro** de uma seção faz o miolo virar letra na tela. Se precisar comentar no meio da música, use uma linha só: `<!-- nota -->`.
- **Nada é escapado.** O texto vai para `innerHTML`. `<`, `>` e `&` são interpretados como HTML. Escrever `R&B` ou `<3` pode quebrar o render — usar entidades (`&amp;`, `&lt;`) se necessário.
- `^` e `_` soltos (com espaço depois) não viram seta; só contam colados numa palavra.
- Código de voz desconhecido (`[C]`, `[X]`) não dá erro: cai silenciosamente em "Ambos".
- Texto antes da primeira `##` (fora o `#` do título) é descartado sem aviso.
