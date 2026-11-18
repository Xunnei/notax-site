// Gera as imagens (JPG 1080) de todos os posts da fila com o MESMO renderizador do Estúdio,
// e escreve site/artes/index.json (lido pela vitrine e pela página /fila).
// Uso: node scripts/render.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { RAIZ, DIR_ARTES, lerPosts, validar, nomeImagem } from './lib.mjs';

const SITE = path.join(RAIZ, 'site');
const TIPOS_MIME = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const PAGINA = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/css/base.css"></head>
<body style="font-family:Sora"><span style="font-weight:400">a</span><span style="font-weight:600">a</span><span style="font-weight:800">a</span>
<canvas id="c"></canvas><script src="/js/render.js"></script></body></html>`;

function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/__render') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGINA); }
      const f = path.join(SITE, path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
      if (!f.startsWith(SITE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': TIPOS_MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, '127.0.0.1', () => ok(s));
  });
}

const posts = lerPosts();
let falhou = false;
for (const { arquivo, post } of posts) {
  const erros = validar(post, arquivo);
  if (erros.length) { falhou = true; console.error(`✗ ${path.basename(arquivo)}\n  - ${erros.join('\n  - ')}`); }
}
if (falhou) process.exit(1);

fs.mkdirSync(DIR_ARTES, { recursive: true });
const SO_INDICE = process.argv.includes('--so-indice'); // não desenha nada; só reescreve o index.json
let s, browser, page;
async function pagina() { // o navegador só abre se alguma imagem precisar ser desenhada
  if (page) return page;
  s = await servidor();
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${s.address().port}/__render`);
  await page.evaluate(() => window.NotaxArte.preparar());
  return page;
}

const usados = new Set(['index.json']);
const indice = [];
let geradas = 0;
for (const { id, post } of posts) {
  const imagens = [];
  for (let i = 0; i < post.artes.length; i++) {
    const nome = nomeImagem(id, i, post.artes[i]);
    usados.add(nome);
    imagens.push(`/artes/${nome}`);
    const destino = path.join(DIR_ARTES, nome);
    if (fs.existsSync(destino)) continue;
    if (SO_INDICE) { console.error(`✗ falta ${nome} (rode sem --so-indice)`); process.exit(1); }
    const dataUrl = await (await pagina()).evaluate((arte) => {
      const c = window.NotaxArte.emCanvas(document.getElementById('c'), arte);
      return c.toDataURL('image/jpeg', 0.92);
    }, post.artes[i]);
    fs.writeFileSync(destino, Buffer.from(dataUrl.split(',')[1], 'base64'));
    geradas++;
  }
  indice.push({
    id, quando: post.quando, tipo: post.tipo, status: post.status,
    legenda: post.legenda || '', fmt: post.artes[0].fmt, imagens,
    publicado: post.publicado ? { em: post.publicado.em, permalink: post.publicado.permalink || null } : null,
  });
}
// artes fixas da vitrine (página inicial)
const vitrine = SO_INDICE ? [] : JSON.parse(fs.readFileSync(path.join(RAIZ, 'conteudo', 'vitrine.json'), 'utf8')).artes;

for (let i = 0; i < vitrine.length; i++) {
  const dataUrl = await (await pagina()).evaluate((arte) => window.NotaxArte.emCanvas(document.getElementById('c'), arte).toDataURL('image/jpeg', 0.88), vitrine[i]);
  const destino = path.join(RAIZ, 'site', 'img', `vitrine-${i + 1}.jpg`);
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  if (!fs.existsSync(destino) || !buf.equals(fs.readFileSync(destino))) fs.writeFileSync(destino, buf);
}
if (browser) { await browser.close(); s.close(); }

// remove imagens que não pertencem mais a nenhum post
let removidas = 0;
for (const f of fs.readdirSync(DIR_ARTES)) if (!usados.has(f)) { fs.unlinkSync(path.join(DIR_ARTES, f)); removidas++; }

indice.sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando));
fs.writeFileSync(path.join(DIR_ARTES, 'index.json'), JSON.stringify({ gerado: new Date().toISOString(), posts: indice }, null, 1) + '\n');
console.log(`✓ ${posts.length} posts · ${geradas} imagens novas · ${removidas} removidas`);
