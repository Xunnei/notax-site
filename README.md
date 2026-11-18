# notaX · site, estúdio e Instagram

Site da marca **notaX** (`notax.xunei.com.br`), o **Estúdio** de artes e a **postagem automática** no Instagram **@gestaonotax**.

```
conteudo/posts/*.json  ──render.mjs──▶  site/artes/*.jpg  ──Cloudflare──▶  notax.xunei.com.br/artes/…
        (fila)          (Playwright +                         (site no ar)            │
                         site/js/render.js)                                           ▼
                                                    instagram.yml (3x/dia) ──▶ API do Instagram ──▶ @gestaonotax
```

| Página | Para quê |
|---|---|
| `/` | Vitrine da marca (funções, como funciona, segurança, últimos posts) |
| `/estudio` | Criar uma arte na hora (baixar e postar à mão) ou copiar o pedido para a fila |
| `/fila` | Prévia dos próximos posts e dos publicados |
| `/marca` | Logos SVG/PNG e paleta |

## Configuração (uma vez)

### 1. Cloudflare
Crie um token em *My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"* e acrescente a zona **xunei.com.br** com **Zone → Workers Routes: Edit** e **DNS: Edit**. Salve no repositório (*Settings → Secrets and variables → Actions*):
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` (o mesmo do sistemas-escolas)

O primeiro push no `main` cria o worker `notax` e liga o domínio `notax.xunei.com.br` sozinho.

### 2. Instagram (API do Instagram com login do Instagram, sem Página do Facebook)
1. Em **developers.facebook.com** → *Meus apps* → **Criar app** → tipo **Empresa**.
2. No app, adicione o produto **Instagram** → *API setup with Instagram login*.
3. Em **Generate access tokens**, clique em **Add account**, entre com o **@gestaonotax** e autorize.
4. Copie o token gerado (vale 60 dias e é renovado sozinho) e salve como segredo **`IG_TOKEN`**.
5. O app pode ficar em modo **Desenvolvimento**: para postar na própria conta não precisa de revisão da Meta.

### 3. Renovação automática do token
Crie um token pessoal *fine-grained* em GitHub → *Settings → Developer settings → Fine-grained tokens*, só para este repositório, com **Secrets: Read and write**. Salve como **`GH_SEGREDOS_TOKEN`**.

## No dia a dia
- Peça ao Claude: *"monta os posts das próximas 2 semanas"*. Ele cria os rascunhos, você confere em `/fila` e responde **"pode postar"**.
- Teste sem postar: *Actions → Postar no Instagram → Run workflow → Só simular*.

## Local
```bash
npm ci && node scripts/render.mjs && node scripts/testar.mjs
```
