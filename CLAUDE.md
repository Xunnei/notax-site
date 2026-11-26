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
- Robô (`.github/workflows/instagram.yml`) roda de hora em hora (:07) das 9h às 22h de Brasília (o GitHub atrasa o agendamento), posta **1 por rodada**, e post vencido há mais de 72h não sai sozinho (abre aviso). Falha = Issue no repositório.
- Prévia de tudo em `https://notax.xunei.com.br/fila`.
- Formatos do Instagram: feed 1:1 (`q`) ou 4:5 (`f`), story 9:16 (`s`). Imagem sempre JPG (exigência da API).
- Calendário: manter a fila com ~2 semanas à frente. Conteúdo só do que o sistema realmente faz (ver CLAUDE.md do sistemas-escolas). **Nunca citar escola cliente pelo nome sem o dono autorizar.**

## Segredos (Settings → Secrets → Actions)
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `IG_TOKEN`, `IG_USER_ID` (opcional), `GH_SEGREDOS_TOKEN` (renovar o IG_TOKEN). Nunca pedir nem receber os valores na conversa.

## Estado atual e pendências do dono (atualizado em 21/11/2026)
**Feito:** site no ar em `notax.xunei.com.br` (worker `notax`, publica sozinho pelo `publicar.yml`); segredos `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` salvos (token só da zona xunei.com.br); 8 cards com "Ver mais"; Estúdio fora do menu; lista pública (`site/artes/index.json`) só com posts publicados, a fila lê `site/fila/dados.json`. **Cadeado Cloudflare Access LIGADO** em `/estudio` e `/fila` (app "auto-hospedado", política `So o dono` = só o e-mail do dono, sessão 1 mês; ele entra pelo login Microsoft/Hotmail, o código por e-mail cai no lixo eletrônico). Faltava o dono confirmar que `/fila` pede login e que a página inicial abre sem login.

**Decisões do dono (25/11/2026):** página Marca ABERTA (link só no rodapé). **Pode citar: Beija-Flor de Nilópolis, Botafogo Samba Clube e Tubarão de Mesquita** (só essas; Mocidade e outras NÃO). WhatsApp dos botões: `5521964107663` em `site/js/config.js`. Seção "Quem já usa" na página inicial + post `2026-11-30-quem-usa`. Fila reagendada de 26/11 a 12/12 (10 rascunhos).

**Ao voltar, LEMBRAR o dono destas pendências:**
1. ~~"Pode postar"~~ FEITO em 25/11: os 10 posts (26/11 a 12/12) estão `aprovado`. Só saem quando o `IG_TOKEN` existir; post vencido há mais de 72h não sai sozinho (reagendar).
2. ~~Token do Instagram~~ FEITO em 25/11: app Meta `notaX Postagem` (ID 1514125850573240), caso de uso Instagram com **login unificado**, ligado ao portfólio **Xunei** (o @gestaonotax foi adicionado ao portfólio). Token de **usuário do sistema** (começa com EAA, **não vence**) salvo em `IG_TOKEN`; robô usa graph.facebook.com e `IG_USER_ID=17841480891596692` (fixo no instagram.yml). Robô CONFERE que a conta é @gestaonotax antes de postar. Teste "conferir" passou (25/11). Se precisar gerar de novo: developers.facebook.com → app → Casos de uso → Personalizar → API setup with Unified login → etapa 2 → Gerar token (em janela anônima, logado no Facebook pessoal "Junior Xunei"; o navegador normal fica preso na conta empresarial). Botão de teste: Actions → Postar no Instagram → Run workflow → "conferir".
3. ~~Renovação~~ NÃO precisa: token não vence (`token-instagram.yml` só age se o token começar com "IG").
5. ~~1º post real~~ SAIU em 26/11 (https://www.instagram.com/p/DgOLOZeIxK1/), disparado à mão às 19h26 porque o agendador do GitHub atrasou ~5h. A publicação pela API funcionou com o app em modo desenvolvimento. Bug corrigido: a anotação do `publicado` falhava (render exigia Playwright); anotado à mão. Agendamento passou a ser de hora em hora.
6. ~~PR dos Planos~~ JUNTADO em 26/11 a pedido do dono ("pode publicar os planos"; a tabela foi decidida na conversa session_01RdUXs494VUgFCrCW8pzJru). Preço de fundadora = **40% de desconto no 1º ano** (decidido pelo dono em 26/11; o texto antigo dizia "metade", corrigido). Nunca escrever "metade". **Fidelidade (decidido 26/11):** mensal SEM fidelidade; anual (paga 10 leva 12) e fundadora com contrato de 12 meses; quem sai antes só devolve o desconto recebido (sem multa). Sem plano de 24/36 meses no site (oferecer caso a caso). Contrato de verdade: com advogado.
4. ~~Teste do cadeado~~ CONFIRMADO pelo dono em 26/11: `/fila` pede login, página inicial abre direto.
