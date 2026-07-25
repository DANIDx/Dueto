# Comandos

Não há build, testes nem gerenciador de pacotes. Tudo se resume a servir a pasta e publicar.

## Rodar localmente

```bash
python3 -m http.server        # http://localhost:8000
```

Alternativas equivalentes (qualquer servidor estático serve a raiz do repo):

```bash
npx serve .
php -S localhost:8000
```

**Abrir `index.html` por `file://` não funciona** — o navegador bloqueia o `fetch` dos `.md` e o app mostra o aviso de erro em vez das letras.

`localhost` conta como contexto seguro, então Service Worker e Wake Lock funcionam no teste local.

## Testar no tablet, na mesma rede

```bash
python3 -m http.server 8000 --bind 0.0.0.0
ip addr | grep 'inet '        # descobrir o IP da máquina
```

Abrir `http://<ip>:8000` no tablet. Nesse endereço o Wake Lock e o Service Worker **não** ativam (não é HTTPS nem localhost) — para testar offline/PWA de verdade, usar o GitHub Pages.

## Publicar

GitHub Pages servindo `main` na pasta raiz (Settings → Pages). Publicar = dar push em `main`; o Pages republica sozinho em ~1 min. Não há workflow de deploy no repo.

## Git — fork e upstream

```bash
git remote -v                          # origin = icarosuper/Dueto, upstream = DANIDx/Dueto

git fetch upstream
git merge upstream/main                # merge, nunca rebase
git merge upstream/Issue-02            # branches de trabalho do upstream
```

## Verificação manual (não há testes automatizados)

Depois de qualquer mudança, servir localmente e conferir:

1. O seletor lista todas as músicas de `songs.json`, na ordem certa e com o título do `#`.
2. Trocar de música re-renderiza e volta ao topo.
3. `A+` / `A−` mudam o tamanho da letra e do rótulo da seção junto; recarregar mantém o tamanho e a música.
4. As cores e as fitas laterais batem com as marcas `[A]`/`[B]`/`[AB]`.
5. `[AB>X]` mostra a etiqueta "2ª: <o outro cantor>"; `^`/`_` viram `↑`/`↓`.
6. DevTools → Application → Service Workers: SW ativo; em Offline, recarregar continua exibindo as letras.
