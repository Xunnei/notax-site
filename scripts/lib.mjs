// Utilidades comuns: leitura e validação da fila de posts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const DIR_POSTS = path.join(RAIZ, 'conteudo', 'posts');
export const DIR_ARTES = path.join(RAIZ, 'site', 'artes');
export const SITE_URL = (process.env.SITE_URL || 'https://notax.xunei.com.br').replace(/\/$/, '');

const ESTILOS = ['funcao', 'capa', 'frase', 'sabia', 'novidade', 'cta', 'lista'];
const TIPOS = ['feed', 'carrossel', 'story'];
const STATUS = ['rascunho', 'aprovado', 'pausado'];

// O desenho também entra no hash: mudou o render.js, todas as imagens são regeradas.
const VERSAO_RENDER = crypto.createHash('sha1').update(fs.readFileSync(path.join(RAIZ, 'site', 'js', 'render.js'))).digest('hex');

export function hashArte(arte) {
  return crypto.createHash('sha1').update(VERSAO_RENDER + JSON.stringify(arte)).digest('hex').slice(0, 10);
}

/** Nome da imagem de cada arte: muda quando a arte muda (o Instagram e o cache sempre pegam a versão certa). */
export function nomeImagem(id, i, arte) {
  return `${id}-${i + 1}-${hashArte(arte)}.jpg`;
}

export function validar(post, arquivo) {
  const erros = [];
  const id = path.basename(arquivo, '.json');
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(id)) erros.push('nome do arquivo deve ser AAAA-MM-DD-assunto.json (minúsculas, sem acento)');
  if (!TIPOS.includes(post.tipo)) erros.push(`tipo deve ser ${TIPOS.join('|')}`);
  if (!STATUS.includes(post.status)) erros.push(`status deve ser ${STATUS.join('|')}`);
  if (!post.quando || Number.isNaN(Date.parse(post.quando))) erros.push('quando deve ser data ISO com fuso, ex.: 2026-11-24T19:00:00-03:00');
  else if (!/([+-]\d{2}:\d{2}|Z)$/.test(post.quando)) erros.push('quando precisa do fuso (-03:00)');
  if (!Array.isArray(post.artes) || !post.artes.length) erros.push('artes vazio');
  else {
    if (post.tipo === 'carrossel' && (post.artes.length < 2 || post.artes.length > 10)) erros.push('carrossel tem de 2 a 10 artes');
    if (post.tipo !== 'carrossel' && post.artes.length !== 1) erros.push(`${post.tipo} tem exatamente 1 arte`);
    post.artes.forEach((a, i) => {
      if (!ESTILOS.includes(a.estilo)) erros.push(`arte ${i + 1}: estilo inválido`);
      if (post.tipo === 'story' && a.fmt !== 's') erros.push(`arte ${i + 1}: story usa fmt "s"`);
      if (post.tipo !== 'story' && a.fmt === 's') erros.push(`arte ${i + 1}: fmt "s" é só para story`);
      if (post.tipo === 'carrossel' && a.fmt !== post.artes[0].fmt) erros.push('carrossel: todas as artes no mesmo formato');
      if (a.estilo !== 'capa' && !String(a.titulo || '').trim()) erros.push(`arte ${i + 1}: falta título`);
    });
  }
  if (post.tipo !== 'story' && !String(post.legenda || '').trim()) erros.push('falta legenda');
  if (String(post.legenda || '').length > 2200) erros.push('legenda passa de 2200 caracteres');
  if ((String(post.legenda || '').match(/#/g) || []).length > 30) erros.push('mais de 30 hashtags');
  return erros;
}

export function lerPosts() {
  if (!fs.existsSync(DIR_POSTS)) return [];
  return fs.readdirSync(DIR_POSTS).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const arquivo = path.join(DIR_POSTS, f);
    const post = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
    return { id: path.basename(f, '.json'), arquivo, post };
  });
}

export function salvarPost(arquivo, post) {
  fs.writeFileSync(arquivo, JSON.stringify(post, null, 2) + '\n');
}
