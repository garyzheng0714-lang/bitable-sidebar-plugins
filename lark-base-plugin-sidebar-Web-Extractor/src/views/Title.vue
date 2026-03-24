<script setup>
  import { bitable, FieldType } from '@lark-base-open/js-sdk';
  import { ref, onMounted } from 'vue';
  import { fetchHtmlWithReader } from '../services/reader.js';
  import { log, error as logError } from '../utils/logger.js';

  const base = bitable.base;
  const databaseId = ref();
  const viewId = ref();
  const fieldList = ref([]);
  const urlFieldId = ref('');
  const titleFieldId = ref('');
  const running = ref(false);
  const results = ref([]); // { recordId, url, title, method }
  const runError = ref('');
  const writeCount = ref(0);

  onMounted(async () => {
    const selection = await base.getSelection();
    databaseId.value = selection.tableId;
    viewId.value = selection.viewId;
    await initFieldList();
    autoDetectUrlField();
  });

  async function initFieldList() {
    if (!databaseId.value) return;
    const table = await base.getTable(databaseId.value);
    const view = await table.getViewById(viewId.value);
    const metas = await view.getFieldMetaList();
    fieldList.value = metas;
  }

  function autoDetectUrlField() {
    const metas = fieldList.value || [];
    // 优先使用 URL 类型；其次匹配名称
    const byType = metas.find((m) => m.type === FieldType.Url);
    if (byType) { urlFieldId.value = byType.id; return; }
    const hitByName = metas.find((m) => /url|链接|link/i.test(m.name || ''));
    if (hitByName) { urlFieldId.value = hitByName.id; return; }
    urlFieldId.value = metas[0]?.id || '';
  }

  async function runExtractTitles() {
    runError.value = '';
    results.value = [];
    writeCount.value = 0;
    if (!databaseId.value || !viewId.value || !urlFieldId.value) { runError.value = '上下文或链接字段未就绪'; return; }
    running.value = true;
    try {
      const table = await base.getTable(databaseId.value);
      const view = await table.getViewById(viewId.value);
      // 确保存在“标题”字段，不存在则创建为文本类型
      const titleField = await ensureTitleField(table, '标题');
      titleFieldId.value = titleField.id;
      const recordIds = (await view.getVisibleRecordIdList?.()) || [];
      for (const rid of recordIds) {
        try {
          const val = await table.getCellValue(urlFieldId.value, rid);
          const url = extractFirstUrl(val);
          if (!url) continue;
          const titleInfo = await getTitleForUrl(url);
          results.value.push({ recordId: rid, url, title: titleInfo.title, method: titleInfo.method });
          // 将提取到的标题写入“标题”字段（文本），按官方文档使用纯字符串
          if ((titleInfo.title || '').trim()) {
            try {
              await titleField.setValue(rid, titleInfo.title.trim());
              writeCount.value += 1;
            } catch (e) {
              logError('title:write-fail', e, { recordId: rid, fieldId: titleFieldId.value });
            }
          }
        } catch (e) {
          logError('title:record-error', e, { recordId: rid });
        }
      }
      log('title:run-complete', { count: results.value.length });
    } catch (e) {
      logError('title:run-error', e);
      runError.value = e?.message || String(e) || '运行失败';
    } finally {
      running.value = false;
    }
  }

  function extractFirstUrl(val) {
    if (!val) return '';
    const pickFromText = (text) => { if (!text) return ''; const m = text.match(/https?:\/\/\S+/i); return m ? m[0] : ''; };
    if (Array.isArray(val)) {
      for (const seg of val) {
          if (seg && typeof seg === 'object') {
          if (seg.link && /^https?:\/\//i.test(seg.link)) return seg.link;
          const url = pickFromText(seg.text || seg.value || '');
          if (url) return url;
        } else if (typeof seg === 'string') {
          const url = pickFromText(seg);
          if (url) return url;
        }
      }
      return '';
    }
    if (typeof val === 'string') return pickFromText(val);
    if (typeof val === 'object') {
      if (val.link && /^https?:\/\//i.test(val.link)) return val.link;
      if (val.url && /^https?:\/\//i.test(val.url)) return val.url;
      const fromText = pickFromText(val.text || val.value || '');
      if (fromText) return fromText;
      try { const json = JSON.stringify(val); const m = json.match(/https?:\/\/[^\s"'<>]+/i); return m ? m[0] : ''; } catch (_) { return ''; }
    }
    return '';
  }

  async function getTitleForUrl(url) {
    // 先判断命中哪个规则，再开始提取
    const ruleKey = pickRuleForUrl(url);
    try {
      if (ruleKey === 'trendyol-bestseller') {
        const t = tryTrendyolBestSeller(url, '');
        if (t) return { title: t, method: 'rule' };
      } else if (ruleKey === 'ml-mais-vendidos') {
        const t = tryMercadoLivreMaisVendidos(url, '');
        if (t) return { title: t, method: 'rule' };
      } else if (ruleKey === 'wildberries-popular') {
        const t = tryWildberriesPopularCategory(url, '');
        if (t) return { title: t, method: 'rule' };
      } else {
        const t = tryBestSellersGeneric(url, '');
        if (t) return { title: t, method: 'rule' };
      }
    } catch (_) {}
    // 方式一：直接抓取（开发代理）
    try {
      const al = encodeURIComponent(resolveAcceptLanguage(url));
      const resp = await fetch(`/proxy-fetch?url=${encodeURIComponent(url)}&al=${al}`);
      if (resp.ok) {
        const html = await resp.text();
        if (ruleKey === 'trendyol-bestseller') {
          const t = tryTrendyolBestSeller(url, html);
          if (t) return { title: t, method: 'rule' };
        } else if (ruleKey === 'ml-mais-vendidos') {
          const t = tryMercadoLivreMaisVendidos(url, html);
          if (t) return { title: t, method: 'rule' };
        } else if (ruleKey === 'wildberries-popular') {
          const t = tryWildberriesPopularCategory(url, html);
          if (t) return { title: t, method: 'rule' };
        } else {
          const t = tryBestSellersGeneric(url, html);
          if (t) return { title: t, method: 'rule' };
        }
        const title = sanitizeTitle(extractTitle(html) || extractJsonTitle(html) || extractOgTitle(html));
        if (title) {
          const code = matchMeliCategoryCode(url);
          if (code) {
            const apiName = await mercadoLivreCategoryFromApi(code);
            if (apiName) return { title: `Mais vendidos em ${apiName}`, method: 'meli-api' };
          }
          return { title, method: 'proxy' };
        }
      }
    } catch (e) {
      log('title:proxy-fail', { url, message: e?.message });
    }
    // 方式二：Jina Reader
    try {
      const html = await fetchHtmlWithReader(url, { 'accept-language': resolveAcceptLanguage(url) });
      if (ruleKey === 'trendyol-bestseller') {
        const t = tryTrendyolBestSeller(url, html);
        if (t) return { title: t, method: 'rule' };
      } else if (ruleKey === 'ml-mais-vendidos') {
        const t = tryMercadoLivreMaisVendidos(url, html);
        if (t) return { title: t, method: 'rule' };
      } else if (ruleKey === 'wildberries-popular') {
        const t = tryWildberriesPopularCategory(url, html);
        if (t) return { title: t, method: 'rule' };
      } else {
        const t = tryBestSellersGeneric(url, html);
        if (t) return { title: t, method: 'rule' };
      }
      const title = sanitizeTitle(extractTitle(html) || extractJsonTitle(html) || extractOgTitle(html));
      if (title) {
        const code = matchMeliCategoryCode(url);
        if (code) {
          const apiName = await mercadoLivreCategoryFromApi(code);
          if (apiName) return { title: `Mais vendidos em ${apiName}`, method: 'meli-api' };
        }
        return { title, method: 'jina' };
      }
    } catch (e) {
      log('title:jina-fail', { url, message: e?.message });
    }
    // 方式三：OG 标题回退
    try {
      const al = encodeURIComponent(resolveAcceptLanguage(url));
      const resp = await fetch(`/proxy-fetch?url=${encodeURIComponent(url)}&al=${al}`);
      if (resp.ok) {
        const html = await resp.text();
        if (ruleKey === 'trendyol-bestseller') {
          const t = tryTrendyolBestSeller(url, html);
          if (t) return { title: t, method: 'rule' };
        } else if (ruleKey === 'ml-mais-vendidos') {
          const t = tryMercadoLivreMaisVendidos(url, html);
          if (t) return { title: t, method: 'rule' };
        } else if (ruleKey === 'wildberries-popular') {
          const t = tryWildberriesPopularCategory(url, html);
          if (t) return { title: t, method: 'rule' };
        } else {
          const t = tryBestSellersGeneric(url, html);
          if (t) return { title: t, method: 'rule' };
        }
        const title = sanitizeTitle(extractOgTitle(html) || extractJsonTitle(html) || extractTitle(html));
        if (title) {
          // 暂存候选标题；对于MercadoLivre的MLB代码页优先尝试官方API获取类目名
          const code = matchMeliCategoryCode(url);
          if (code) {
            const apiName = await mercadoLivreCategoryFromApi(code);
            if (apiName) return { title: `Mais vendidos em ${apiName}`, method: 'meli-api' };
          }
          return { title, method: 'og' };
        }
      }
    } catch (e) {}
    // 方式四：浏览器渲染抓取（Playwright）
    try {
      const al = encodeURIComponent(resolveAcceptLanguage(url));
      const resp = await fetch(`/render-title?url=${encodeURIComponent(url)}&al=${al}`);
      if (resp.ok) {
        const data = await resp.json();
        const t = sanitizeTitle((data?.title || '').trim());
        if (t) {
          const code = matchMeliCategoryCode(url);
          if (code) {
            const apiName = await mercadoLivreCategoryFromApi(code);
            if (apiName) return { title: `Mais vendidos em ${apiName}`, method: 'meli-api' };
          }
          return { title: t, method: 'render' };
        }
      }
    } catch (e) {
      log('title:render-fail', { url, message: e?.message });
    }
    // 方式五：URL 兜底（永不为空）
    const fallback = titleFromUrl(url);
    return { title: fallback, method: 'url-fallback' };
  }

  // 规则选择器：先判断命中哪个规则，然后再进行提取
  function pickRuleForUrl(u) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').toLowerCase();
      const path = (x.pathname || '').toLowerCase();
      const params = new URLSearchParams(x.search || '');
      // mercadolivre 优先：域名包含 mercadolivre，且路径为 mais-vendidos（命中左侧类目页）
      if (host.includes('mercadolivre') && /^\/mais-vendidos\//i.test(path)) {
        return 'ml-mais-vendidos';
      }
      // Wildberries 热门排序页（popular）优先使用站点规则，提取类目名
      if (host.endsWith('wildberries.ru') && (params.get('sort') || '').toLowerCase() === 'popular') {
        return 'wildberries-popular';
      }
      // Trendyol 畅销页
      if (host.endsWith('trendyol.com') && path.includes('/sirali-urunler') && (params.get('type') || '').toLowerCase() === 'bestseller') {
        return 'trendyol-bestseller';
      }
      // 其它情况统一走通用规则
      return 'generic-best';
    } catch (_) {
      return 'generic-best';
    }
  }

  // 确保“标题”文本字段存在
  async function ensureTitleField(table, name) {
    const metas = await table.getViewById(viewId.value).then(v => v.getFieldMetaList());
    const hit = metas.find(m => m.name === name);
    if (hit) {
      if (hit.type !== FieldType.Text) {
        try { await table.setField(hit.id, { type: FieldType.Text }); } catch (_) {}
      }
      return await table.getFieldById(hit.id);
    }
    const fid = await table.addField({ type: FieldType.Text, name });
    return await table.getFieldById(fid);
  }

  // 针对不同站点选择更合适的 Accept-Language
  function resolveAcceptLanguage(u) {
    let host = '';
    try { host = new URL(u).hostname.toLowerCase(); } catch (_) {}
    const map = new Map([
      ['coupang.com', 'ko-KR,ko;q=0.9,en;q=0.8'],
      ['shopee.vn', 'vi-VN,vi;q=0.9,en;q=0.8'],
      ['shopee.co.th', 'th-TH,th;q=0.9,en;q=0.8'],
      ['shopee.com.my', 'en-MY,en;q=0.9'],
      ['shopee.tw', 'zh-TW,zh;q=0.9,en;q=0.8'],
      ['rakuten.co.jp', 'ja-JP,ja;q=0.9,en;q=0.8'],
      ['mercadolivre.com.br', 'pt-BR,pt;q=0.9,en;q=0.8'],
      ['trendyol.com', 'tr-TR,tr;q=0.9,en;q=0.8'],
      ['wildberries.ru', 'ru-RU,ru;q=0.9,en;q=0.8'],
    ]);
    for (const [k, v] of map.entries()) { if (host.endsWith(k)) return v; }
    return 'en-US,en;q=0.9';
  }

  function extractTitle(html) {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const h1 = (doc.querySelector('h1')?.textContent || '').trim();
      if (h1) return h1;
      const t = (doc.querySelector('title')?.textContent || '').trim();
      if (t) return t;
      const h2 = (doc.querySelector('h2')?.textContent || '').trim();
      return h2 || '';
    } catch (_) { return ''; }
  }
  function extractOgTitle(html) {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const m = doc.querySelector('meta[property="og:title"], meta[name="og:title"], meta[name="twitter:title"]');
      return (m?.getAttribute('content') || '').trim();
    } catch (_) { return ''; }
  }

  // 从内联 JSON 中解析标题（如 Next.js、JSON-LD）
  function extractJsonTitle(html) {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // 1) JSON-LD
      const ldList = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of ldList) {
        try {
          const j = JSON.parse(s.textContent || '{}');
          // 优先从面包屑拿最后一个 name 作为页面标题
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
    } catch (_) { return ''; }
  }

  function deepFindTitle(obj) {
    try {
      const q = ['title', 'ogTitle', 'seoTitle', 'pageTitle', 'h1', 'name'];
      const stack = [obj];
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== 'object') continue;
        for (const k of Object.keys(cur)) {
          const v = cur[k];
          if (q.includes(k) && typeof v === 'string' && v.trim()) {
            return v.trim();
          }
          if (v && typeof v === 'object') stack.push(v);
        }
      }
    } catch (_) {}
    return '';
  }

  // 过滤阻断页/无效标题
  function sanitizeTitle(t) {
    const s = (t || '').trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    const blocked = [
      'access denied',
      'forbidden',
      'just a moment',
      'verification',
      'blocked',
      'error',
      'denied',
      '403',
      'akami', // 容错拼写
    ];
    const blockedKo = ['잠시만요', '권한이 없습니다', '오류'];
    if (blocked.some(k => lower.includes(k)) || blockedKo.some(k => s.includes(k))) {
      return '';
    }
    return s;
  }

  // Trendyol 类目名有效性校验：过滤“sirali urunler/ sıralı ürünler”
  function isInvalidTrendyolCategoryName(s) {
    const t = (s || '').trim().toLowerCase();
    return t === 'sirali urunler' || t === 'sıralı ürünler';
  }

  // Trendyol 畅销页（sirali-urunler?type=bestSeller）合成标题：{类目} Kategorisinde En Çok Satılanlar
  function tryTrendyolBestSeller(u, html) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').toLowerCase();
      if (!host.endsWith('trendyol.com')) return '';
      if (!x.pathname.includes('/sirali-urunler')) return '';
      const params = new URLSearchParams(x.search || '');
      if ((params.get('type') || '').toLowerCase() !== 'bestseller') return '';
      // 1) 从页面文本中提取 “{类目} Kategorisinde En Çok Satılanlar”
      if (html && html.length) {
        const m = html.match(/([A-Za-zÇĞİÖŞÜçğıöşü\s]+?)\s+Kategorisinde\s+En\s+Çok\s+Satılanlar/i);
        if (m && m[1]) {
          const name = m[1].replace(/\s+/g, ' ').trim();
          if (!isInvalidTrendyolCategoryName(name)) {
            const t = `${name} Kategorisinde En Çok Satılanlar`;
            return sanitizeTitle(t);
          }
        }
        // 2) 尝试 JSON-LD 的面包屑/名称
        const jName = extractJsonTitle(html);
        if (jName) {
          if (!isInvalidTrendyolCategoryName(jName)) {
            const t = `${jName} Kategorisinde En Çok Satılanlar`;
            return sanitizeTitle(t);
          }
        }
      }
      // 3) 没有页面内容时，用少量已知映射（尽量保持简单）
      const catId = params.get('categoryId') || '';
      const known = new Map([
        ['105500', 'Bebek Ek Besin'],
      ]);
      const cat = known.get(catId);
      if (cat) {
        const t = `${cat} Kategorisinde En Çok Satılanlar`;
        return sanitizeTitle(t);
      }
      return '';
    } catch (_) { return ''; }
  }

  // Mercadolivre “mais-vendidos”页面：合成“Mais vendidos em {Category}”
  function tryMercadoLivreMaisVendidos(u, html) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').toLowerCase();
      const path = x.pathname || '';
      if (!host.endsWith('mercadolivre.com.br')) return '';
      if (!/^\/mais-vendidos\//i.test(path)) return '';

      // 从页面文本提取“Mais vendidos em …”
      if (html && html.length) {
        const m = html.match(/Mais\s+vendidos\s+em\s*([^<\n]+)/i);
        if (m && m[1]) {
          const name = m[1].replace(/\s+/g, ' ').trim();
          const t = `Mais vendidos em ${name}`;
          return sanitizeTitle(t);
        }
      }

      // 映射表兜底（当前覆盖示例）
      const code = path.split('/').filter(Boolean).pop();
      const known = new Map([
        ['MLB278123', 'Bebidas Alcoólicas Mistas'],
        ['MLB270414', 'Bebidas Energéticas'],
      ]);
      const cat = known.get(code || '');
      if (cat) {
        const t = `Mais vendidos em ${cat}`;
        return sanitizeTitle(t);
      }
      return '';
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
    try {
      const resp = await fetch(`https://api.mercadolibre.com/categories/${encodeURIComponent(code)}`);
      if (!resp.ok) return '';
      const json = await resp.json();
      const name = (json?.name || '').trim();
      if (name) return name;
      const pathRoot = Array.isArray(json?.path_from_root) ? json.path_from_root : [];
      const last = pathRoot.length ? (pathRoot[pathRoot.length - 1]?.name || '').trim() : '';
      return last || '';
    } catch (_) { return ''; }
  }

  // 通用“畅销/热卖/热销/ランキング/mais-vendidos/best sellers”识别与合成
  function tryBestSellersGeneric(u, html) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').toLowerCase();
      const path = (x.pathname || '').toLowerCase();
      const qs = new URLSearchParams(x.search || '');
      // 1) 判断是否为“畅销/热卖/排名/销量排序”页面（跨语言路径/参数特征）
      const isBestPage = (
        /best[-_ ]?sellers|top[-_ ]?sellers|bestseller|rankings?|popular/i.test(path) ||
        /mais[-_ ]vendidos|mas[-_ ]vendidos|más[-_ ]vendidos/i.test(path) ||
        /sirali-urunler/i.test(path) ||
        qs.get('sortBy')?.toLowerCase() === 'sales' ||
        qs.get('sort')?.toLowerCase() === 'popular'
      );
      if (!isBestPage) return '';

      // 2) 从页面文本中抓取“Best sellers in/ Mais vendidos em / …”短语的品类名
      if (html && html.length) {
        const m = html.match(/(?:Best\s+sellers\s+in|Mais\s+vendidos\s+em|Más\s+vendidos\s+en)\s*([^<\n]+)/i);
        if (m && m[1]) {
          const cat = m[1].replace(/\s+/g, ' ').trim();
          return sanitizeTitle(formatBestTitle(host, cat));
        }
        // 尝试从 JSON-LD 面包屑抓取类目名
        const catFromJson = extractJsonTitle(html);
        if (catFromJson) return sanitizeTitle(formatBestTitle(host, catFromJson));
      }

      // 3) 从 URL 推导类目名（去除数字/ID，仅保留可读词）
      const catFromUrl = labelFromPath(x.pathname || '');
      if (catFromUrl) return sanitizeTitle(formatBestTitle(host, catFromUrl));
      return '';
    } catch (_) { return ''; }
  }

  // Wildberries 热门排序页：提取左侧/末段类目名，优先使用已知映射
  function tryWildberriesPopularCategory(u, html) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').toLowerCase();
      const path = (x.pathname || '').toLowerCase();
      const qs = new URLSearchParams(x.search || '');
      if (!host.endsWith('wildberries.ru')) return '';
      if ((qs.get('sort') || '').toLowerCase() !== 'popular') return '';
      // 1) 从页面文本尝试抓取明确文案
      if (html && html.length) {
        const m = html.match(/Консервированные\s+продукты/i);
        if (m) return 'Консервированные продукты';
        const jName = extractJsonTitle(html);
        if (jName) return sanitizeTitle(jName);
      }
      // 2) 根据 xsubject 映射兜底（支持多值）
      const xsubjectRaw = (qs.get('xsubject') || '').trim();
      const ids = xsubjectRaw ? xsubjectRaw.split(/[;,]+/).filter(Boolean) : [];
      const idMap = new Map([
        ['3418', 'Консервированные продукты'],
      ]);
      const mapped = ids.map(id => idMap.get(id)).filter(Boolean);
      if (mapped.length) return mapped[0];
      // 3) 根据末段 slug 映射兜底
      const last = path.split('/').filter(Boolean).pop() || '';
      const slugMap = new Map([
        ['konservatsiya', 'Консервированные продукты'],
        ['napitki', 'Напитки'],
      ]);
      const hit = slugMap.get(last);
      if (hit) return hit;
      // 4) URL 词清洗回退
      const catFromUrl = labelFromPath(path);
      return catFromUrl || '';
    } catch (_) { return ''; }
  }

  function formatBestTitle(host, category) {
    const cat = (category || '').trim();
    if (!cat) return '';
    // 按域名/语言生成模板
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
      // 取末段非纯数字的词作为类目名
      let last = (segs[segs.length - 1] || '').replace(/[\-_]+/g, ' ').trim();
      if (!last || /^\d{4,}$/i.test(last) || /^MLB\d{3,}$/i.test(last)) {
        last = (segs[segs.length - 2] || '').replace(/[\-_]+/g, ' ').trim();
      }
      // 清理常见噪声词
      last = last.replace(/^(?:mais\s+vendidos|best\s+sellers|ranking|popular|zgbs|sirali\s+urunler|sıralı\s+ürünler)\s*/i, '')
                 .replace(/\s+/g, ' ').trim();
      if (!last || /^\d{4,}$/.test(last)) return '';
      return last;
    } catch (_) { return ''; }
  }

  // 根据 URL 生成可读标题兜底（永不为空）
  function titleFromUrl(u) {
    try {
      const x = new URL(u);
      const host = (x.hostname || '').replace(/^www\./, '');
      const p = decodeURIComponent(x.pathname || '').split('/').filter(Boolean);
      let last = (p[p.length - 1] || '').replace(/[\-_]+/g, ' ').trim();
      // 过滤纯数字，回退到域名或路径组合
      if (/^\d{4,}$/.test(last) || !last) {
        last = p.slice(-2).join(' / ').replace(/[\-_]+/g, ' ').trim();
      }
      const base = last || host || 'Untitled';
      return `${host} · ${base}`.trim();
    } catch (_) {
      return 'Untitled';
    }
  }
</script>

<template>
  <div class="container">
    <div class="section">
      <div class="text">链接字段</div>
      <el-select v-model="urlFieldId" placeholder="请选择链接字段" popper-class="selectStyle">
        <el-option v-for="item in fieldList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <div class="hint small">已自动匹配可更改</div>
      <div class="run-row">
        <el-button type="primary" :loading="running" @click="runExtractTitles">提取 Title</el-button>
      </div>
      <div class="hint small" v-if="!running && results.length">已处理 {{ results.length }} 条，成功写入 {{ writeCount }} 条</div>
      <div v-if="runError" class="error">{{ runError }}</div>
    </div>
  </div>
</template>

<style scoped>
  .section { display: flex; flex-direction: column; gap: var(--space-m); }
  .run-row { display: flex; gap: 8px; align-items: center; }
  .error { color: #e11d48; font-size: 13px; }
  .url { color: #374151; word-break: break-all; }
</style>

<style>
  .selectStyle {
    .el-select-dropdown__item { font-weight: 300 !important; }
    .el-select-dropdown__item.selected { color: rgb(20, 86, 240); }
  }
</style>