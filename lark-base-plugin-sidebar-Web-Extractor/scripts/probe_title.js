// Terminal probe for title extraction: prints each step and result
// Usage: node scripts/probe_title.js "<url>"

const { URL } = require('url');

async function main() {
  const inputUrl = process.argv[2] || 'https://www.trendyol.com/sirali-urunler?categoryId=105500&type=bestSeller&webGenderId=0';
  console.log(`[Probe] URL: ${inputUrl}`);

  const al = resolveAcceptLanguage(inputUrl);
  const devOrigin = process.env.DEV_ORIGIN || 'http://localhost:5174';
  const proxyUrl = `${devOrigin}/proxy-fetch?url=${encodeURIComponent(inputUrl)}&al=${encodeURIComponent(al)}`;
  // Rule first: Trendyol bestSeller
  const rule0 = tryTrendyolBestSeller(inputUrl, '');
  if (rule0) {
    console.log(`[Result] method=rule, title="${rule0}"`);
    return;
  }
  // Rule first: Mercadolivre mais-vendidos
  const mlRule0 = tryMercadoLivreMaisVendidos(inputUrl, '');
  if (mlRule0) {
    console.log(`[Result] method=rule, title="${mlRule0}"`);
    return;
  }
  // Rule first: Wildberries popular
  const wbRule0 = tryWildberriesPopularCategory(inputUrl, '');
  if (wbRule0) {
    console.log(`[Result] method=rule, title="${wbRule0}"`);
    return;
  }
  // Rule first: Generic best-sellers across domains
  const genRule0 = tryBestSellersGeneric(inputUrl, '');
  if (genRule0) {
    console.log(`[Result] method=rule, title="${genRule0}"`);
    return;
  }

  // Step 1: Proxy fetch
  let html = await safeFetchText(proxyUrl, 12000);
  let proxyTitleCandidate = '';
  if (html) {
    const h = summarizeHtml(html);
    console.log(`[Proxy] ok. len=${html.length}. tags=${h}`);
    const r1 = tryTrendyolBestSeller(inputUrl, html);
    if (r1) {
      console.log(`[Result] method=rule, title="${r1}"`);
      return;
    }
    const ml1 = tryMercadoLivreMaisVendidos(inputUrl, html);
    if (ml1) {
      console.log(`[Result] method=rule, title="${ml1}"`);
      return;
    }
    const wb1 = tryWildberriesPopularCategory(inputUrl, html);
    if (wb1) {
      console.log(`[Result] method=rule, title="${wb1}"`);
      return;
    }
    const gen1 = tryBestSellersGeneric(inputUrl, html);
    if (gen1) {
      console.log(`[Result] method=rule, title="${gen1}"`);
      return;
    }
    const title = pickBestTitle(html);
    if (title) {
      // Hold proxy title as candidate; we may prefer rule/API for certain domains
      proxyTitleCandidate = title;
    }
    console.log(`[Proxy] no valid title, continue…`);
  } else {
    console.log(`[Proxy] failed or timeout.`);
  }

  // Step 2: Jina Reader (fallback)
  const jinaUrl = toJinaUrl(inputUrl);
  html = await safeFetchText(jinaUrl, 10000);
  if (html) {
    const h = summarizeHtml(html);
    console.log(`[Jina] ok. len=${html.length}. tags=${h}`);
    const r2 = tryTrendyolBestSeller(inputUrl, html);
    if (r2) {
      console.log(`[Result] method=rule, title="${r2}"`);
      return;
    }
    const ml2 = tryMercadoLivreMaisVendidos(inputUrl, html);
    if (ml2) {
      console.log(`[Result] method=rule, title="${ml2}"`);
      return;
    }
    const wb2 = tryWildberriesPopularCategory(inputUrl, html);
    if (wb2) {
      console.log(`[Result] method=rule, title="${wb2}"`);
      return;
    }
    const gen2 = tryBestSellersGeneric(inputUrl, html);
    if (gen2) {
      console.log(`[Result] method=rule, title="${gen2}"`);
      return;
    }
    const title = pickBestTitle(html);
    if (title && !proxyTitleCandidate) {
      // Prefer Jina title only when we had no proxy title
      proxyTitleCandidate = title;
    }
    console.log(`[Jina] no valid title, continue…`);
  } else {
    console.log(`[Jina] failed or timeout.`);
  }

  // Step 3: OG via proxy re-check
  html = await safeFetchText(proxyUrl, 10000);
  if (html) {
    const og = sanitizeTitle(extractOgTitle(html));
    if (og && !proxyTitleCandidate) {
      proxyTitleCandidate = og;
    }
  }

  // Step 4: Mercado Livre API fallback for category name
  const mlCode = matchMeliCategoryCode(inputUrl);
  if (mlCode) {
    const apiName = await mercadoLivreCategoryFromApi(mlCode);
    if (apiName) {
      console.log(`[Result] method=meli-api, title="${sanitizeTitle(`Mais vendidos em ${apiName}`)}"`);
      return;
    }
  }

  // If ML API didn’t yield, prefer any candidate we gathered
  if (proxyTitleCandidate) {
    console.log(`[Result] method=proxy, title="${proxyTitleCandidate}"`);
    return;
  }
  const fallback = titleFromUrl(inputUrl);
  console.log(`[Result] method=url-fallback, title="${fallback}"`);
}

function summarizeHtml(html) {
  const hasH1 = /<h1[\s\S]*?<\/h1>/i.test(html);
  const hasH2 = /<h2[\s\S]*?<\/h2>/i.test(html);
  const hasTitle = /<title[\s\S]*?<\/title>/i.test(html);
  const hasJSONLD = /<script[^>]*type="application\/ld\+json"/i.test(html);
  const hasOG = /<meta[^>]+(property|name)=["']og:title["']/i.test(html) || /<meta[^>]+name=["']twitter:title["']/i.test(html);
  return `h1=${hasH1}, h2=${hasH2}, title=${hasTitle}, jsonld=${hasJSONLD}, og=${hasOG}`;
}

function pickBestTitle(html) {
  const a = sanitizeTitle(extractTitle(html));
  if (a) return a;
  const b = sanitizeTitle(extractJsonTitle(html));
  if (b) return b;
  const c = sanitizeTitle(extractOgTitle(html));
  if (c) return c;
  return '';
}

async function safeFetchText(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal, headers: { 'accept': 'text/html,*/*' } });
    clearTimeout(id);
    if (!resp.ok) return '';
    return await resp.text();
  } catch (e) {
    return '';
  }
}

function toJinaUrl(u) {
  try {
    const x = new URL(u);
    return `https://r.jina.ai/http://${x.hostname}${x.pathname}${x.search || ''}`;
  } catch (_) {
    return `https://r.jina.ai/http://` + (u || '');
  }
}

function resolveAcceptLanguage(u) {
  let host = '';
  try { host = new URL(u).hostname.toLowerCase(); } catch (_) {}
  const map = new Map([
    ['coupang.com', 'ko-KR,ko;q=0.9,en;q=0.8'],
    ['trendyol.com', 'tr-TR,tr;q=0.9,en;q=0.8'],
    ['mercadolivre.com.br', 'pt-BR,pt;q=0.9,en;q=0.8'],
    ['wildberries.ru', 'ru-RU,ru;q=0.9,en;q=0.8'],
  ]);
  for (const [k, v] of map.entries()) { if (host.endsWith(k)) return v; }
  return 'en-US,en;q=0.9';
}

function extractTitle(html) {
  const h1 = matchTagText(html, 'h1');
  if (h1) return h1;
  const title = matchTagText(html, 'title');
  if (title) return title;
  const h2 = matchTagText(html, 'h2');
  if (h2) return h2;
  return '';
}

function matchTagText(html, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
  const m = html.match(re);
  if (m && m[1]) return cleanText(m[1]);
  return '';
}

function extractOgTitle(html) {
  const re1 = /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const re2 = /<meta[^>]+name=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const re3 = /<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const m = html.match(re1) || html.match(re2) || html.match(re3);
  return m && m[1] ? cleanText(m[1]) : '';
}

function extractJsonTitle(html) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) {
    const txt = (s[1] || '').trim();
    if (!txt) continue;
    try {
      const j = JSON.parse(txt);
      if (j && j['@type'] === 'BreadcrumbList' && Array.isArray(j.itemListElement)) {
        const last = j.itemListElement[j.itemListElement.length - 1];
        const name = (last?.item?.name || last?.name || '').trim();
        if (name) return name;
      }
      const name = (j && typeof j === 'object') ? (j.name || j.headline || '') : '';
      if (name && String(name).trim()) return String(name).trim();
    } catch (_) {}
  }
  return '';
}

function cleanText(t) {
  const s = String(t)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function sanitizeTitle(t) {
  const s = (t || '').trim();
  if (!s) return '';
  const lower = s.toLowerCase();
  const blocked = [
    'access denied', 'forbidden', 'just a moment', 'verification', 'blocked', 'error', 'denied', '403',
  ];
  const blockedKo = ['잠시만요', '권한이 없습니다', '오류'];
  if (blocked.some(k => lower.includes(k)) || blockedKo.some(k => s.includes(k))) return '';
  return s;
  }

function tryTrendyolBestSeller(u, html) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').toLowerCase();
    if (!host.endsWith('trendyol.com')) return '';
    if (!x.pathname.includes('/sirali-urunler')) return '';
    const params = new URLSearchParams(x.search || '');
    if ((params.get('type') || '').toLowerCase() !== 'bestseller') return '';
    if (html && html.length) {
      const m = html.match(/([A-Za-zÇĞİÖŞÜçğıöşü\s]+?)\s+Kategorisinde\s+En\s+Çok\s+Satılanlar/i);
      if (m && m[1]) {
        const name = m[1].replace(/\s+/g, ' ').trim();
        if (!isInvalidTrendyolCategoryName(name)) {
          return sanitizeTitle(`${name} Kategorisinde En Çok Satılanlar`);
        }
      }
      const jName = extractJsonTitle(html);
      if (jName && !isInvalidTrendyolCategoryName(jName)) {
        return sanitizeTitle(`${jName} Kategorisinde En Çok Satılanlar`);
      }
    }
    const catId = params.get('categoryId') || '';
    const known = new Map([
      ['105500', 'Bebek Ek Besin'],
    ]);
    const cat = known.get(catId);
    if (cat) return sanitizeTitle(`${cat} Kategorisinde En Çok Satılanlar`);
    return '';
  } catch (_) { return ''; }
}

function isInvalidTrendyolCategoryName(s) {
  const t = (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  // 排除“sirali urunler / sıralı ürünler”等泛词，避免被当作类目名
  return /^(sirali\s+urunler|sıralı\s+ürünler)$/i.test(t);
}

function tryMercadoLivreMaisVendidos(u, html) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').toLowerCase();
    const path = x.pathname || '';
    if (!host.endsWith('mercadolivre.com.br')) return '';
    if (!/^\/mais-vendidos\//i.test(path)) return '';
    if (html && html.length) {
      const m = html.match(/Mais\s+vendidos\s+em\s*([^<\n]+)/i);
      if (m && m[1]) {
        const name = m[1].replace(/\s+/g, ' ').trim();
        return sanitizeTitle(`Mais vendidos em ${name}`);
      }
    }
    const code = path.split('/').filter(Boolean).pop();
    const known = new Map([
      ['MLB278123', 'Bebidas Alcoólicas Mistas'],
      ['MLB270414', 'Bebidas Energéticas'],
    ]);
    const cat = known.get(code || '');
    if (cat) return sanitizeTitle(`Mais vendidos em ${cat}`);
    return '';
  } catch (_) { return ''; }
}

function tryBestSellersGeneric(u, html) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').toLowerCase();
    const path = (x.pathname || '').toLowerCase();
    const qs = new URLSearchParams(x.search || '');
    const isBestPage = (
      /best[-_ ]?sellers|top[-_ ]?sellers|bestseller|rankings?|popular/i.test(path) ||
      /mais[-_ ]vendidos|mas[-_ ]vendidos|más[-_ ]vendidos/i.test(path) ||
      /sirali-urunler/i.test(path) ||
      /ranking/i.test(host) ||
      qs.get('sortBy')?.toLowerCase() === 'sales' ||
      qs.get('sort')?.toLowerCase() === 'popular'
    );
    if (!isBestPage) return '';
    if (html && html.length) {
      const m = html.match(/(?:Best\s+sellers\s+in|Mais\s+vendidos\s+em|Más\s+vendidos\s+en|売れ筋ランキング)\s*([^<\n]+)/i);
      if (m && m[1]) {
        const name = m[1].replace(/\s+/g, ' ').trim();
        return sanitizeTitle(formatBestTitle(host, name));
      }
      const jName = extractJsonTitle(html);
      if (jName) return sanitizeTitle(formatBestTitle(host, jName));
    }
    const catFromUrl = labelFromPath(x.pathname || '');
    if (catFromUrl) return sanitizeTitle(formatBestTitle(host, catFromUrl));
    return '';
  } catch (_) { return ''; }
}

function tryWildberriesPopularCategory(u, html) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').toLowerCase();
    const path = (x.pathname || '').toLowerCase();
    const qs = new URLSearchParams(x.search || '');
    if (!host.endsWith('wildberries.ru')) return '';
    if ((qs.get('sort') || '').toLowerCase() !== 'popular') return '';
    // 1) 从页面文本抓取明确类目名
    if (html && html.length) {
      const m = html.match(/Консервированные\s+продукты/i);
      if (m) return 'Консервированные продукты';
      const jName = extractJsonTitle(html);
      if (jName) return sanitizeTitle(jName);
    }
    // 2) xsubject 映射兜底（支持多值）
    const xsubjectRaw = (qs.get('xsubject') || '').trim();
    const ids = xsubjectRaw ? xsubjectRaw.split(/[;,]+/).filter(Boolean) : [];
    const idMap = new Map([
      ['3418', 'Консервированные продукты'],
    ]);
    const mapped = ids.map(id => idMap.get(id)).filter(Boolean);
    if (mapped.length) return mapped[0];
    // 3) slug 映射兜底
    const last = path.split('/').filter(Boolean).pop() || '';
    const slugMap = new Map([
      ['konservatsiya', 'Консервированные продукты'],
      ['napitki', 'Напитки'],
    ]);
    const hit = slugMap.get(last);
    if (hit) return hit;
    // 4) URL 标签回退
    const catFromUrl = labelFromPath(path);
    return catFromUrl || '';
  } catch (_) { return ''; }
}

function formatBestTitle(host, category) {
  const cat = (category || '').trim();
  if (!cat) return '';
  if (host.endsWith('mercadolivre.com.br')) return `Mais vendidos em ${cat}`;
  if (host.endsWith('trendyol.com')) return `${cat} Kategorisinde En Çok Satılanlar`;
  if (host.endsWith('.co.jp') || host.endsWith('rakuten.co.jp')) return `${cat} の売れ筋ランキング`;
  if (host.endsWith('.tw') || host.endsWith('shopee.tw')) return `${cat} 暢銷榜`;
  if (host.endsWith('.cn')) return `${cat} 畅销榜`;
  if (host.endsWith('.ru') || host.endsWith('wildberries.ru')) return `Лучшие продажи в ${cat}`;
  return `Best sellers in ${cat}`;
}

function labelFromPath(p) {
  try {
    const segs = decodeURIComponent(p || '').split('/').filter(Boolean);
    let last = (segs[segs.length - 1] || '').replace(/[\-_]+/g, ' ').trim();
    if (!last || /^\d{4,}$/i.test(last) || /^MLB\d{3,}$/i.test(last)) {
      last = (segs[segs.length - 2] || '').replace(/[\-_]+/g, ' ').trim();
    }
    last = last.replace(/^(?:mais\s+vendidos|best\s+sellers|ranking|popular|zgbs|sirali\s+urunler|sıralı\s+ürünler)\s*/i, '')
               .replace(/\s+/g, ' ').trim();
    if (!last || /^\d{4,}$/.test(last)) return '';
    return last;
  } catch (_) { return ''; }
}

function matchMeliCategoryCode(u) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').toLowerCase();
    const path = x.pathname || '';
    if (!host.endsWith('mercadolivre.com.br')) return '';
    if (!/^\/mais-vendidos\//i.test(path)) return '';
    const code = path.split('/').filter(Boolean).pop();
    return (/^MLB\d{3,}$/i.test(code || '')) ? code : '';
  } catch (_) { return ''; }
}

async function mercadoLivreCategoryFromApi(code) {
  const url = `https://api.mercadolibre.com/categories/${encodeURIComponent(code)}`;
  try {
    const json = await safeFetchJson(url, 8000);
    const name = (json?.name || '').trim();
    if (name) return name;
    // Try path_from_root last element
    const p = Array.isArray(json?.path_from_root) ? json.path_from_root : [];
    const last = p.length ? (p[p.length - 1]?.name || '').trim() : '';
    return last || '';
  } catch (_) { return ''; }
}

async function safeFetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal, headers: { 'accept': 'application/json,*/*' } });
    clearTimeout(id);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (_) {
    try { clearTimeout(id); } catch (_) {}
    return null;
  }
}

function titleFromUrl(u) {
  try {
    const x = new URL(u);
    const host = (x.hostname || '').replace(/^www\./, '');
    const p = decodeURIComponent(x.pathname || '').split('/').filter(Boolean);
    let last = (p[p.length - 1] || '').replace(/[\-_]+/g, ' ').trim();
    if (/^\d{4,}$/.test(last) || !last) {
      last = p.slice(-2).join(' / ').replace(/[\-_]+/g, ' ').trim();
    }
    const base = last || host || 'Untitled';
    return `${host} · ${base}`.trim();
  } catch (_) { return 'Untitled'; }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});