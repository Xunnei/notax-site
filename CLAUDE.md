# Instruções para o Claude neste repositório (site da notaX)

Dono: Xunei. Não é programador. Responda em português, simples e direto, com sinceridade brutal.
Este repositório é SÓ da marca **notaX**: site, estúdio de artes e postagem automática no Instagram **@gestaonotax**.
Os sistemas das escolas vivem em outro repositório (`xunnei/sistemas-escolas`); nada daqui mexe neles.

## Marca (fonte: seção "## Marca" do sistemas-escolas)
- X = nota 10 + X de Xunei + X do metrônomo. Logo em traço único; X protagonista; ondas douradas; ponto vermelho da batida.
- Paleta: violeta `#421C6F` · ouro `#F4CF6C` (em fundo claro `#C9A227`) · batida `#E8264F` · letra `#F1E7F9`. Fonte: Sora (local em `site/fonts/`).
- Arquivos da marca: `site/marca/` (cópia de `marca-notax/` do sistemas-escolas). Assinatura: "by Xunei · Sistemas de gestão".
- **Texto público sem travessão (— ou –).** O teste trava.

## Como funciona
- `site/` = o que vai pro ar (Cloudflare Worker só de arquivos, `wrangler.toml`, domínio `notax.xunei.com.br`).
- `site/js/render.js` = **desenho único das artes**. O Estúdio (`/estudio`) e a geração automática usam o mesmo arquivo. Mudou o render.js → todas as imagens são regeradas (o nome leva o hash).
- `conteudo/posts/AAAA-MM-DD-assunto.json` = **fila do Instagram**. Campos: `quando` (ISO com `-03:00`), `tipo` (`feed`|`carrossel`|`story`), `status` (`rascunho`|`aprovado`|`pausado`), `legenda`, `artes` (lista; story usa `fmt:"s"`, feed `q` ou `f`, carrossel 2 a 10 no mesmo `fmt`). O robô grava `publicado` sozinho: **nunca apagar nem editar `publicado`**.
- Estilos de arte: `funcao`, `lista` (campo `itens`), `capa`, `frase`, `sabia`, `novidade`, `cta` (campo `botao`). Opcional `pagina` ("2/5") no carrossel.
- `conteudo/vitrine.json` = as 2 artes fixas do topo da página inicial.
- `node scripts/render.mjs` gera `site/artes/*.jpg` + `site/artes/index.json`; `node scripts/testar.mjs` confere tudo (rodar os dois antes de commitar).

## Regras de postagem (decididas com o dono)
- **Só sai o que estiver `aprovado`.** Post novo nasce `rascunho`; vira `aprovado` só quando o dono escrever "pode postar" (pode ser um lote).
- Robô (`.github/workflows/instagram.yml`) roda 09:07, 13:07 e 19:07 de Brasília, posta **1 por rodada**, e post vencido há mais de 72h não sai sozinho (abre aviso). Falha = Issue no repositório.
- Prévia de tudo em `https://notax.xunei.com.br/fila`.
- Formatos do Instagram: feed 1:1 (`q`) ou 4:5 (`f`), story 9:16 (`s`). Imagem sempre JPG (exigência da API).
- Calendário: manter a fila com ~2 semanas à frente. Conteúdo só do que o sistema realmente faz (ver CLAUDE.md do sistemas-escolas). **Nunca citar escola cliente pelo nome sem o dono autorizar.**

## Segredos (Settings → Secrets → Actions)
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `IG_TOKEN`, `IG_USER_ID` (opcional), `GH_SEGREDOS_TOKEN` (renovar o IG_TOKEN). Nunca pedir nem receber os valores na conversa.

## Estado atual e pendências do dono (atualizado em 21/11/2026)
**Feito:** site no ar em `notax.xunei.com.br` (worker `notax`, publica sozinho pelo `publicar.yml`); segredos `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` salvos (token só da zona xunei.com.br); 8 cards com "Ver mais"; Estúdio fora do menu; lista pública (`site/artes/index.json`) só com posts publicados, a fila lê `site/fila/dados.json`. **Cadeado Cloudflare Access LIGADO** em `/estudio` e `/fila` (app "auto-hospedado", política `So o dono` = só o e-mail do dono, sessão 1 mês; ele entra pelo login Microsoft/Hotmail, o código por e-mail cai no lixo eletrônico). Faltava o dono confirmar que `/fila` pede login e que a página inicial abre sem login.

**Decisões do dono (25/11/2026):** página Marca ABERTA (link só no rodapé). **Pode citar: Beija-Flor de Nilópolis, Botafogo Samba Clube e Tubarão de Mesquita** (só essas; Mocidade e outras NÃO). WhatsApp dos botões: `5521964107663` em `site/js/config.js`. Seção "Quem já usa" na página inicial + post `2026-11-30-quem-usa`. Fila reagendada de 26/11 a 12/12 (10 rascunhos).

**Ao voltar, LEMBRAR o dono destas pendências:**
1. **"Pode postar"** dos 10 rascunhos (prévia em `/fila`). Se as datas vencerem de novo, reagendar.
2. **Token do Instagram** (liga o robô): developers.facebook.com → Criar app `notaX Postagem` → caso de uso Instagram → "API setup with Instagram login" → Add account @gestaonotax → segredo `IG_TOKEN`. Guiar clique a clique com prints. Pode pedir convite de testador no app do Instagram.
3. **Renovação do token:** segredo `GH_SEGREDOS_TOKEN` (fine-grained, só este repo, Secrets: Read and write).
4. Teste do cadeado: `/fila` pede login e a página inicial abre direto (não confirmado).
