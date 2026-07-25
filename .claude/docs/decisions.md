# Decisões

Escolhas intencionais que podem parecer erro. Ler antes de "consertar".

---

### 1. Letras em Markdown separado, cores no `index.html`

**Como parece:** dados espalhados — o texto num `.md`, quem canta codificado em `[A]`/`[B]`, e a cor real só no CSS.

**Por que está certo:** as letras são editadas com frequência e a quatro mãos (o repo tem fork + upstream). Mantendo cada música num arquivo próprio, o diff no GitHub fica limpo e dá para revisar letra sem ler HTML. E como a cor nunca aparece no `.md`, mudar a paleta ou trocar quem é "A" não gera diff em nenhuma letra.

**Não "consertar"** embutindo cor/estilo nos `.md`, nem migrando as letras para dentro de um JSON/JS.

---

### 2. Parser próprio em vez de biblioteca de Markdown

**Como parece:** reinventar a roda — `parse()` é um `for` sobre linhas com uma regex.

**Por que está certo:** o formato **não é** Markdown; é uma notação de ensaio (`[AB>B]`, `~[B]`, `^`/`_`) que nenhuma lib entende. Usar `marked`/`markdown-it` traria uma dependência de CDN — que quebra o requisito de funcionar offline — e ainda precisaria de um pós-processador para as marcas de voz. O parser inteiro tem ~20 linhas.

**Não "consertar"** trocando por uma lib de Markdown.

---

### 3. Service worker network-first

**Como parece:** um PWA "de verdade" serviria do cache primeiro, para abrir instantâneo.

**Por que está certo:** o conteúdo muda entre ensaios e o app é publicado por `git push` no Pages. Cache-first faria a dupla ensaiar com a letra errada até o SW atualizar — o pior modo de falha possível aqui. Network-first mantém o offline (fallback no `catch`) e garante que, com internet, o que está na tela é o que está no repo. O custo é alguns ms de latência na abertura.

**Não "consertar"** invertendo para cache-first "por performance".

---

### 4. Todas as músicas carregadas no boot

**Como parece:** desperdício — busca e faz parse de 11 arquivos para exibir um.

**Por que está certo:** são arquivos de texto de poucos KB; o total é menor que uma foto. Carregar tudo de uma vez torna a troca de música instantânea e sem rede — importante no palco, onde o Wi-Fi pode cair no meio do louvor. Também garante que o precache do SW cubra exatamente o que o app usa.

**Não "consertar"** com carregamento sob demanda.

---

### 5. `dueto:song` guarda o índice, não o caminho

**Como parece:** frágil — reordenar `songs.json` muda qual música volta ao abrir.

**Por que está certo:** o índice é a mesma chave que o `<select>` usa (`option.value`), então salvar/restaurar é uma linha. A consequência é benigna: no pior caso o app abre em outra música da lista, e o seletor está na barra do topo. Guardar caminho exigiria mapear caminho→índice no boot e tratar música removida.

**Não "consertar"** sem ganho real. Se um dia migrar para caminho, tratar o valor legado numérico.

---

### 6. `[AB>A]` rotula a **segunda** voz

**Como parece:** invertido — a marca cita `A`, mas a etiqueta mostra o nome de B.

**Por que está certo:** `>A` significa "A faz a melodia", que é o caso default de quem lê. A informação nova, a que a dupla precisa ver, é quem sai da melodia para harmonizar. Por isso `lineHtml` inverte (`lead === 'A' ? 'B' : 'A'`) e renderiza "2ª: <outro>".

**Não "consertar"** fazendo a etiqueta ecoar a letra da marca.

---

### 7. Wake Lock e Service Worker falham em silêncio

**Como parece:** `catch (e) {}` vazio, erro engolido.

**Por que está certo:** os dois são melhorias progressivas. Num navegador sem suporte (ou sem HTTPS), a única coisa a fazer é seguir sem eles — a letra continua na tela. Um alerta de erro no meio de um ensaio seria pior que a falha.

**Não "consertar"** transformando em erro visível ao usuário.

---

### 8. Tema escuro fixo, sem alternância

**Como parece:** falta um toggle claro/escuro.

**Por que está certo:** o uso é num tablet, no palco, geralmente com luz baixa. Fundo escuro com texto claro é o que reduz ofuscamento, e as cores das vozes (`#ffb454` / `#5fe6d8`) foram escolhidas para brilhar sobre `#14131a`. Um tema claro exigiria uma segunda paleta calibrada.

**Não "consertar"** adicionando `prefers-color-scheme` sem repensar as cores das vozes.

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
