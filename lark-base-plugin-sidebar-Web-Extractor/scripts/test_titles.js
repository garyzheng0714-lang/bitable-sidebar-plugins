// Dev-only script: read test URLs and print extracted titles using multiple strategies
// Usage: node scripts/test_titles.js

import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(process.cwd(), 'scripts/test_urls.txt');

async function fetchDirect(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
      },
    });
    const text = await resp.text();
    return text;
  } catch (e) {
    return '';
  }
}

async function fetchJina(url) {
  try {
    const encoded = encodeURI(url);
    const readerUrl = `https://r.jina.ai/${encoded}`;
    const resp = await fetch(readerUrl, { headers: { 'x-respond-with': 'html' } });
    if (!resp.ok) return '';
    return await resp.text();
  } catch (e) { return ''; }
}

function extractTitle(html) {
  if (!html) return '';
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m && m[1]) return m[1].trim();
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) || html.match(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (og && og[1]) return og[1].trim();
  return '';
}

async function getTitle(url) {
  let html = await fetchDirect(url);
  let title = extractTitle(html);
  if (title) return { title, method: 'direct' };
  html = await fetchJina(url);
  title = extractTitle(html);
  if (title) return { title, method: 'jina' };
  return { title: '', method: 'none' };
}

async function main() {
  console.log(`Reading file: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error('File not found');
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Content length: ${content.length}`);
  const lines = content.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
  console.log(`Total URLs: ${lines.length}`);
  for (const url of lines) {
    const r = await getTitle(url);
    console.log(`${url}\n -> [${r.method}] ${r.title || '未提取到标题'}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});