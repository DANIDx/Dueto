# Dueto

Folha de letras para cantar em dupla, com cor por cantor. As letras ficam em
Markdown (`songs/*.md`) e um único `index.html` as renderiza coloridas — pensado
para ler num tablet enquanto se canta.

## Ver no tablet

Ligue o **GitHub Pages** no repositório (Settings → Pages → branch `main`, pasta
raiz) e abra a URL gerada. Nada para instalar.

## Testar no computador

```
python3 -m http.server
```

Depois abra <http://localhost:8000>. (Abrir o `index.html` direto pelo
`file://` não funciona: o navegador bloqueia a leitura dos `.md`.)

## Escrever uma letra

Cada música é um arquivo em `songs/`. A convenção:

```
# Título da Música

## Verso 1
[A] linha cantada por Você
[B] linha cantada pelo Amigo

## Refrão
[AB] linha cantada pelos dois
```

- `#` título · `##` seção (Verso, Refrão, Ponte...)
- `[A]`, `[B]`, `[AB]` no começo da linha marcam quem canta. Linha sem marca = ambos.
- Comentários `<!-- ... -->` são ignorados.

## Adicionar uma música nova

1. Crie `songs/nome-da-musica.md` seguindo a convenção.
2. Acrescente o caminho em `songs.json` (a ordem da lista é a ordem no seletor).

## Trocar nomes e cores dos cantores

Tudo em um lugar só, no topo do `index.html`:

- Nomes: objeto `VOICES` (`A`, `B`, `AB`).
- Cores: variáveis `--voice-a`, `--voice-b`, `--voice-ab`.

Além da cor, cada linha tem uma barrinha lateral da cor do cantor — dá pra
rastrear quem canta mesmo de canto de olho, e ajuda quem tem dificuldade com cor.
