// Conferências rápidas (rodam no CI antes de publicar). Sem rede.
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, DIR_ARTES, lerPosts, validar, nomeImagem } from './lib.mjs';

let erros = 0;
const falha = (m) => { erros++; console.error('✗ ' + m); };

// 1) fila válida e com imagens geradas
const posts = lerPosts();
for (const { id, arquivo, post } of posts) {
  validar(post, arquivo).forEach((e) => falha(`${id}: ${e}`));
  post.artes?.forEach((a, i) => { if (!fs.existsSync(path.join(DIR_ARTES, nomeImagem(id, i, a)))) falha(`${id}: falta imagem ${i + 1} (rode npm run render)`); });
}
const fila = JSON.parse(fs.readFileSync(path.join(RAIZ, 'site', 'fila', 'dados.json'), 'utf8'));
if (fila.posts.length !== posts.length) falha('site/fila/dados.json desatualizado (rode npm run render)');
const pub = JSON.parse(fs.readFileSync(path.join(DIR_ARTES, 'index.json'), 'utf8'));
if (pub.posts.some((p) => !p.publicado || p.status)) falha('site/artes/index.json público não pode ter rascunho/agendado');
if (pub.posts.length !== posts.filter((p) => p.post.publicado).length) falha('site/artes/index.json desatualizado');

// 2) páginas: título, descrição, sem travessão no texto público, links internos existem
const SITE = path.join(RAIZ, 'site');
const paginas = ['index.html', 'estudio/index.html', 'fila/index.html', 'marca/index.html', '404.html'];
for (const p of paginas) {
  const html = fs.readFileSync(path.join(SITE, p), 'utf8');
  if (!/<title>[^<]+<\/title>/.test(html)) falha(`${p}: sem <title>`);
  if (p !== '404.html' && !/<meta name="description" content="[^"]{30,}"/.test(html)) falha(`${p}: sem meta description`);
  const texto = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
  if (/[—–]/.test(texto)) falha(`${p}: tem travessão (— ou –) no texto`);
  for (const [, href] of texto.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const alvo = path.join(SITE, href);
    const ok = fs.existsSync(alvo) && (fs.statSync(alvo).isFile() || fs.existsSync(path.join(alvo, 'index.html')));
    if (!ok && !fs.existsSync(alvo + '.html')) falha(`${p}: link quebrado ${href}`);
  }
}
for (const { id, post } of posts) if (/[—–]/.test(post.legenda || '') || JSON.stringify(post.artes).match(/[—–]/)) falha(`${id}: tem travessão`);

if (erros) { console.error(`\n${erros} problema(s).`); process.exit(1); }
console.log(`✓ tudo certo · ${posts.length} posts · ${paginas.length} páginas`);
