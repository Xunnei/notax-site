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
