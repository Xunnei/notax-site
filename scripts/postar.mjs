// Publica no Instagram os posts da fila que já venceram (status "aprovado", sem "publicado").
// API do Instagram com login do Instagram (graph.instagram.com), sem precisar de Página do Facebook.
// Variáveis: IG_TOKEN (segredo), IG_USER_ID (opcional: descobre pelo token), SITE_URL, IG_API_VERSION.
// Uso: node scripts/postar.mjs [--simular]   (--simular só mostra o que faria)
import fs from 'node:fs';
import path from 'node:path';
import { DIR_ARTES, SITE_URL, lerPosts, salvarPost, validar, nomeImagem } from './lib.mjs';

const SIMULAR = process.argv.includes('--simular');
const API = `https://graph.instagram.com/${process.env.IG_API_VERSION || 'v23.0'}`;
const TOKEN = process.env.IG_TOKEN;
const MAX_POR_RODADA = 1; // nunca despeja a fila atrasada de uma vez
const ATRASO_MAX_H = 72; // post vencido há mais que isso não sai sozinho (avisa)

if (!TOKEN && !SIMULAR) { console.error('IG_TOKEN não configurado (segredo do repositório).'); process.exit(1); }

async function ig(metodo, caminho, params = {}) {
  const url = new URL(API + caminho);
  const corpo = new URLSearchParams({ ...params, access_token: TOKEN });
  const r = metodo === 'GET'
    ? await fetch(url + '?' + corpo)
    : await fetch(url, { method: 'POST', body: corpo });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${metodo} ${caminho}: ${j.error?.message || r.status}`);
  return j;
}

async function esperarPronto(containerId) {
  for (let i = 0; i < 30; i++) {
    const { status_code } = await ig('GET', `/${containerId}`, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${containerId}: ${status_code}`);
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error(`container ${containerId}: demorou demais`);
}

async function conferirNoAr(url) {
  const r = await fetch(url, { method: 'HEAD' });
  if (!r.ok || !String(r.headers.get('content-type')).includes('image/jpeg')) throw new Error(`imagem fora do ar: ${url} (${r.status})`);
}

const agora = Date.now();
const vencidos = lerPosts().filter(({ post }) => post.status === 'aprovado' && !post.publicado && Date.parse(post.quando) <= agora);
const atrasados = vencidos.filter(({ post }) => agora - Date.parse(post.quando) > ATRASO_MAX_H * 3600e3);
for (const { id } of atrasados) console.warn(`⚠️ ${id} venceu há mais de ${ATRASO_MAX_H}h e não foi postado. Mude o "quando" para reagendar.`);
const fila = vencidos.filter((x) => !atrasados.includes(x)).slice(0, MAX_POR_RODADA);

if (!fila.length) { console.log('Nada para postar agora.'); process.exit(atrasados.length ? 2 : 0); }

const userId = SIMULAR ? 'SIMULADO' : (process.env.IG_USER_ID || (await ig('GET', '/me', { fields: 'user_id' })).user_id);

for (const { id, arquivo, post } of fila) {
  const erros = validar(post, arquivo);
  if (erros.length) throw new Error(`${id}: ${erros.join('; ')}`);
  const urls = post.artes.map((a, i) => {
    const nome = nomeImagem(id, i, a);
    if (!fs.existsSync(path.join(DIR_ARTES, nome))) throw new Error(`${id}: imagem ${nome} não foi gerada (rode o render)`);
    return `${SITE_URL}/artes/${nome}`;
  });
  console.log(`→ ${id} (${post.tipo}, ${urls.length} imagem/ns)`);
  if (SIMULAR) { urls.forEach((u) => console.log('   ', u)); continue; }
  for (const u of urls) await conferirNoAr(u);

  let creation;
  if (post.tipo === 'story') {
    creation = (await ig('POST', `/${userId}/media`, { image_url: urls[0], media_type: 'STORIES' })).id;
  } else if (post.tipo === 'carrossel') {
    const filhos = [];
    for (const u of urls) filhos.push((await ig('POST', `/${userId}/media`, { image_url: u, is_carousel_item: 'true' })).id);
    for (const f of filhos) await esperarPronto(f);
    creation = (await ig('POST', `/${userId}/media`, { media_type: 'CAROUSEL', children: filhos.join(','), caption: post.legenda })).id;
  } else {
    creation = (await ig('POST', `/${userId}/media`, { image_url: urls[0], caption: post.legenda })).id;
  }
  await esperarPronto(creation);
  const { id: mediaId } = await ig('POST', `/${userId}/media_publish`, { creation_id: creation });
  let permalink = null;
  try { permalink = (await ig('GET', `/${mediaId}`, { fields: 'permalink' })).permalink; } catch {}
  post.publicado = { em: new Date().toISOString(), media_id: mediaId, permalink };
  salvarPost(arquivo, post);
  console.log(`✓ publicado ${id} → ${permalink || mediaId}`);
}
