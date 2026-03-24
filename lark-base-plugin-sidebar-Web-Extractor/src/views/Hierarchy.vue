<script setup>
  import { bitable, FieldType } from '@lark-base-open/js-sdk';
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { fetchHtmlWithReader } from '../services/reader.js';
  import { extractAmazonStructured } from '../utils/extractors.js';
  import { log, error as logError, getLogs } from '../utils/logger.js';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const base = bitable.base;

  // 组件激活状态（用于切换到该模块时触发首列自动选择）
  const props = defineProps({ active: { type: Boolean, default: false } });

  // 上下文与视图字段
  const databaseId = ref();
  const viewId = ref();
  const fieldList = ref([]);
  const running = ref(false);
  const paused = ref(false);
  let abortCtrl = null;
  const progress = ref({ done: 0, total: 0 });
  const runError = ref('');

  const seedFieldId = ref(''); // 一级榜单链接字段
  const maxDepth = ref(10);

  // 日志面板
  const runtimeLogs = ref([]);
  const logViewRef = ref();
  const logAutoScroll = ref(true);
  let logTimer = null;
  const formattedRuntimeText = computed(() => {
    const tail = (runtimeLogs.value || []).slice(-300);
    const prog = progress.value || { done: 0, total: 0 };
    const fmt = (ts) => {
      try { const d = new Date(ts); return d.toLocaleTimeString(); } catch (_) { return ts; }
    };
    const msgOf = (l) => {
      const e = String(l.event || '');
      const d = l.data || {};
      // 友好文案映射
      if (e === 'hier:start') return `启动提取 · 总记录 ${d.seeds} · 最大层级 ${d.maxDepth}`;
      if (e === 'hier:node') return `处理父类「${d.parentName || '未命名品类'}」 · 层级 ${d.level} · 子项 ${d.childCount}`;
      if (e === 'hier:overlay-first-child-general') return `首行写入父类到列 · 层级 ${d.level + 1}`;
      if (e === 'hier:record-added-for-first-child') return `新增标准行（首子项） · 目标层级 ${d.childLevel} · 子类「${d.child || ''}」`;
      if (e === 'hier:record-added') return `新增行 · 链路 ${Array.isArray(d.chain) ? d.chain.join(' > ') : ''}`;
      if (e === 'hier:end') return `完成 · 新增 ${d.created} 行 · 处理 ${d.seeds} 记录`;
      if (e.startsWith('hier:') && l.level === 'error') return `错误 · ${d.message || '未知错误'}`;
      return `${e}`;
    };
    return tail.map((l) => {
      const lvl = String(l.level || 'info').toUpperCase();
      return `[${fmt(l.ts)}] 进度 ${prog.done}/${prog.total} · ${lvl} · ${msgOf(l)}`;
    }).join('\n');
  });
  function startLogStreaming() { if (logTimer) return; logTimer = setInterval(() => { runtimeLogs.value = getLogs(); }, 500); }
  function stopLogStreaming() { if (logTimer) { clearInterval(logTimer); logTimer = null; } }
  onMounted(async () => {
    const selection = await base.getSelection();
    databaseId.value = selection.tableId;
    viewId.value = selection.viewId;
    log('hier:init', { tableId: databaseId.value, viewId: viewId.value });
    await initFieldList();
    autoSelectFirstField();
    startLogStreaming();
  });
  onUnmounted(() => { stopLogStreaming(); });
  watch(runtimeLogs, () => { if (!logAutoScroll.value) return; const el = logViewRef.value; if (el) el.scrollTop = el.scrollHeight; });
  base.onSelectionChange(async (event) => {
    databaseId.value = event.data.tableId;
    viewId.value = event.data.viewId;
    await initFieldList();
    autoSelectFirstField();
  });

  // 切换到该模块时自动选择首列
  watch(() => props.active, (val) => {
    if (val) autoSelectFirstField();
  });

  // 日志下载
  function downloadLogs() {
    try {
      const payload = { progress: progress.value, logs: getLogs() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plugin-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      log('hier:logs-downloaded', { count: (payload.logs || []).length });
    } catch (e) {
      logError('hier:logs-download-error', e);
    }
  }

  async function initFieldList() {
    if (!databaseId.value) return;
    const table = await base.getTable(databaseId.value);
    const view = await table.getViewById(viewId.value);
    fieldList.value = await view.getFieldMetaList();
  }

  function autoSelectFirstField() {
    try {
      if (seedFieldId.value) return; // 用户已选择则不覆盖
      const first = (fieldList.value || [])[0];
      if (first && first.id) {
        seedFieldId.value = first.id;
        log('hier:auto-select-seed-field', { fieldId: first.id, fieldName: first.name });
      }
    } catch (_) { /* 忽略 */ }
  }

  // 复用语言与 UA 逻辑（与 Form.vue 保持一致）
  const UA_POOL = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1'
  ];
  const pickUA = () => UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

  const outputLangMode = ref('auto');
  const LANG_OPTIONS = [
    { value: 'auto', label: '按域名（自动）' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'en-AU', label: 'English (AU)' },
    { value: 'en-CA', label: 'English (CA)' },
    { value: 'en-SG', label: 'English (SG)' },
    { value: 'en-IN', label: 'English (IN)' },
    { value: 'ja-JP', label: '日本語 (JP)' },
    { value: 'zh-CN', label: '中文 (简体)' },
    { value: 'de-DE', label: 'Deutsch (DE)' },
    { value: 'fr-FR', label: 'Français (FR)' },
    { value: 'it-IT', label: 'Italiano (IT)' },
    { value: 'es-ES', label: 'Español (ES)' },
    { value: 'es-MX', label: 'Español (MX)' },
    { value: 'nl-NL', label: 'Nederlands (NL)' },
    { value: 'sv-SE', label: 'Svenska (SE)' },
    { value: 'pl-PL', label: 'Polski (PL)' },
    { value: 'tr-TR', label: 'Türkçe (TR)' },
    { value: 'pt-PT', label: 'Português (PT)' },
    { value: 'pt-BR', label: 'Português (BR)' },
    { value: 'ru-RU', label: 'Русский (RU)' },
    { value: 'ko-KR', label: '한국어 (KR)' },
    { value: 'ar-AE', label: 'العربية (AE)' },
    { value: 'ar-SA', label: 'العربية (SA)' },
    { value: 'ar-EG', label: 'العربية (EG)' }
  ];
  function resolveAcceptLanguage(url) {
    let host = ''; let path = '';
    try { const u = new URL(url); host = u.hostname.toLowerCase(); path = u.pathname || ''; } catch (_) {}
    const mode = outputLangMode.value;
    const map = {
      'en-US': 'en-US,en;q=0.9',
      'en-GB': 'en-GB,en;q=0.9',
      'en-AU': 'en-AU,en;q=0.9',
      'en-CA': 'en-CA,en;q=0.9',
      'en-SG': 'en-SG,en;q=0.9',
      'en-IN': 'en-IN,en;q=0.9',
      'ja-JP': 'ja-JP,ja;q=0.9,en;q=0.8',
      'zh-CN': 'zh-CN,zh;q=0.9,en;q=0.8',
      'de-DE': 'de-DE,de;q=0.9,en;q=0.8',
      'fr-FR': 'fr-FR,fr;q=0.9,en;q=0.8',
      'it-IT': 'it-IT,it;q=0.9,en;q=0.8',
      'es-ES': 'es-ES,es;q=0.9,en;q=0.8',
      'es-MX': 'es-MX,es;q=0.9,en;q=0.8',
      'nl-NL': 'nl-NL,nl;q=0.9,en;q=0.8',
      'sv-SE': 'sv-SE,sv;q=0.9,en;q=0.8',
      'pl-PL': 'pl-PL,pl;q=0.9,en;q=0.8',
      'tr-TR': 'tr-TR,tr;q=0.9,en;q=0.8',
      'pt-PT': 'pt-PT,pt;q=0.9,en;q=0.8',
      'pt-BR': 'pt-BR,pt;q=0.9,en;q=0.8',
      'ru-RU': 'ru-RU,ru;q=0.9,en;q=0.8',
      'ko-KR': 'ko-KR,ko;q=0.9,en;q=0.8',
      'ar-AE': 'ar-AE,ar;q=0.9,en;q=0.8',
      'ar-SA': 'ar-SA,ar;q=0.9,en;q=0.8',
      'ar-EG': 'ar-EG,ar;q=0.9,en;q=0.8'
    };
    if (mode && mode !== 'auto') return map[mode] || map['en-US'];
    // 域名默认语言
    const defaultByHost = () => {
      if (host.endsWith('.co.jp')) return 'ja-JP';
      if (host.endsWith('.co.uk') || host.endsWith('.uk')) return 'en-GB';
      if (host.endsWith('.com.au') || host.endsWith('.au')) return 'en-AU';
      if (host.endsWith('.ca')) return 'en-CA';
      if (host.endsWith('.sg')) return 'en-SG';
      if (host.endsWith('.in')) return 'en-IN';
      if (host.endsWith('.cn')) return 'zh-CN';
      if (host.endsWith('.de')) return 'de-DE';
      if (host.endsWith('.fr')) return 'fr-FR';
      if (host.endsWith('.it')) return 'it-IT';
      if (host.endsWith('.es')) return 'es-ES';
      if (host.endsWith('.nl')) return 'nl-NL';
      if (host.endsWith('.se')) return 'sv-SE';
      if (host.endsWith('.pl')) return 'pl-PL';
      if (host.endsWith('.tr')) return 'tr-TR';
      if (host.endsWith('.com.br')) return 'pt-BR';
      if (host.endsWith('.pt')) return 'pt-PT';
      if (host.endsWith('.mx')) return 'es-MX';
      if (host.endsWith('.ae')) return 'ar-AE';
      if (host.endsWith('.sa')) return 'ar-SA';
      if (host.endsWith('.eg')) return 'ar-EG';
      return 'en-US';
    };
    const lang = defaultByHost();
    return map[lang] || map['en-US'];
  }

  function resolveLocaleForUrl(url) {
    let host = ''; try { host = new URL(url).hostname.toLowerCase(); } catch (_) {}
    const mode = (outputLangMode.value || 'auto');
    const langHeaderMap = {
      'en-US': 'en-US', 'en-GB': 'en-GB', 'en-AU': 'en-AU', 'en-CA': 'en-CA', 'en-SG': 'en-SG', 'en-IN': 'en-IN',
      'ja-JP': 'ja-JP', 'zh-CN': 'zh-CN', 'de-DE': 'de-DE', 'fr-FR': 'fr-FR', 'it-IT': 'it-IT', 'es-ES': 'es-ES', 'es-MX': 'es-MX',
      'nl-NL': 'nl-NL', 'sv-SE': 'sv-SE', 'pl-PL': 'pl-PL', 'tr-TR': 'tr-TR', 'pt-PT': 'pt-PT', 'pt-BR': 'pt-BR', 'ru-RU': 'ru-RU', 'ko-KR': 'ko-KR',
      'ar-AE': 'ar-AE', 'ar-SA': 'ar-SA', 'ar-EG': 'ar-EG'
    };
    const localeParamMap = {
      'en-US': 'en_US', 'en-GB': 'en_GB', 'en-AU': 'en_AU', 'en-CA': 'en_CA', 'en-SG': 'en_SG', 'en-IN': 'en_IN',
      'ja-JP': 'ja_JP', 'zh-CN': 'zh_CN', 'de-DE': 'de_DE', 'fr-FR': 'fr_FR', 'it-IT': 'it_IT', 'es-ES': 'es_ES', 'es-MX': 'es_MX',
      'nl-NL': 'nl_NL', 'sv-SE': 'sv_SE', 'pl-PL': 'pl_PL', 'tr-TR': 'tr_TR', 'pt-PT': 'pt_PT', 'pt-BR': 'pt_BR', 'ru-RU': 'ru_RU', 'ko-KR': 'ko_KR',
      'ar-AE': 'ar_AE', 'ar-SA': 'ar_SA', 'ar-EG': 'ar_EG'
    };
    const currencyByTld = (h) => {
      if (h.endsWith('.co.jp')) return 'JPY';
      if (h.endsWith('.cn')) return 'CNY';
      if (h.endsWith('.de') || h.endsWith('.fr') || h.endsWith('.it') || h.endsWith('.es') || h.endsWith('.nl') || h.endsWith('.pt')) return 'EUR';
      if (h.endsWith('.pl')) return 'PLN';
      if (h.endsWith('.se')) return 'SEK';
      if (h.endsWith('.tr')) return 'TRY';
      if (h.endsWith('.co.uk') || h.endsWith('.uk')) return 'GBP';
      if (h.endsWith('.com.au') || h.endsWith('.au')) return 'AUD';
      if (h.endsWith('.ca')) return 'CAD';
      if (h.endsWith('.mx')) return 'MXN';
      if (h.endsWith('.br')) return 'BRL';
      if (h.endsWith('.ae')) return 'AED';
      if (h.endsWith('.sa')) return 'SAR';
      if (h.endsWith('.eg')) return 'EGP';
      if (h.endsWith('.in')) return 'INR';
      if (h.endsWith('.sg')) return 'SGD';
      return 'USD';
    };
    let headerLang;
    if (mode !== 'auto') headerLang = langHeaderMap[mode] || 'en-US';
    else {
      // 默认语言按域名
      if (host.endsWith('.co.jp')) headerLang = 'ja-JP';
      else if (host.endsWith('.co.uk') || host.endsWith('.uk')) headerLang = 'en-GB';
      else if (host.endsWith('.com.au') || host.endsWith('.au')) headerLang = 'en-AU';
      else if (host.endsWith('.ca')) headerLang = 'en-CA';
      else if (host.endsWith('.sg')) headerLang = 'en-SG';
      else if (host.endsWith('.in')) headerLang = 'en-IN';
      else if (host.endsWith('.cn')) headerLang = 'zh-CN';
      else if (host.endsWith('.de')) headerLang = 'de-DE';
      else if (host.endsWith('.fr')) headerLang = 'fr-FR';
      else if (host.endsWith('.it')) headerLang = 'it-IT';
      else if (host.endsWith('.es')) headerLang = 'es-ES';
      else if (host.endsWith('.nl')) headerLang = 'nl-NL';
      else if (host.endsWith('.se')) headerLang = 'sv-SE';
      else if (host.endsWith('.pl')) headerLang = 'pl-PL';
      else if (host.endsWith('.tr')) headerLang = 'tr-TR';
      else if (host.endsWith('.mx')) headerLang = 'es-MX';
      else if (host.endsWith('.br')) headerLang = 'pt-BR';
      else if (host.endsWith('.pt')) headerLang = 'pt-PT';
      else if (host.endsWith('.ae')) headerLang = 'ar-AE';
      else if (host.endsWith('.sa')) headerLang = 'ar-SA';
      else if (host.endsWith('.eg')) headerLang = 'ar-EG';
      else headerLang = 'en-US';
    }
    const localeParam = localeParamMap[headerLang] || 'en_US';
    const currency = currencyByTld(host);
    const amazonPathLang = (function () {
      // 仅 co.jp 使用 /-/<lang> 样式，其它域名保持原路径
      if (host.endsWith('.co.jp')) {
        if (headerLang === 'ja-JP') return 'ja';
        if (headerLang === 'zh-CN') return 'zh';
        return 'en';
      }
      return '';
    })();
    return { headerLang, localeParam, currency, amazonPathLang };
  }

  function applyLanguageToUrl(input) {
    try {
      const u = new URL(input);
      const host = (u.hostname || '').toLowerCase();
      const { headerLang, localeParam, currency, amazonPathLang } = resolveLocaleForUrl(input);
      const langQ = u.searchParams.get('language');
      if (!langQ || (langQ && langQ.toLowerCase() !== localeParam.toLowerCase())) u.searchParams.set('language', localeParam);
      const curQ = u.searchParams.get('currency');
      if (!curQ || (curQ && curQ.toUpperCase() !== currency.toUpperCase())) u.searchParams.set('currency', currency);
      if (/amazon\.co\.jp$/i.test(host)) {
        let p = u.pathname || '';
        const desired = amazonPathLang || 'en';
        if (/^\/-\/[a-z]{2}(?:[-_][a-z]{2})?\//i.test(p)) p = p.replace(/^\/-\/[a-z]{2}(?:[-_][a-z]{2})?\//i, `/-/${desired}/`);
        else p = `/-/${desired}${p.startsWith('/') ? '' : '/'}${p}`;
        u.pathname = p;
      }
      return u.toString();
    } catch (_) { return input; }
  }

  function normalizeAmazonUrl(input) {
    try {
      const u = new URL(input);
      const host = (u.hostname || '').toLowerCase();
      if (!host.includes('amazon.')) return input;
      try {
        const keepKeys = new Set(['language', 'currency', 'hl', 'gl', 'locale', 'lang']);
        const nextParams = new URLSearchParams();
        u.searchParams.forEach((v, k) => { if (keepKeys.has(k)) nextParams.set(k, v); });
        const nextSearch = nextParams.toString();
        u.search = nextSearch ? `?${nextSearch}` : '';
      } catch (_) { u.search = ''; }
      u.hash = '';
      let p = u.pathname || '';
      const before = p;
      const refIdx = p.indexOf('/ref=');
      if (refIdx !== -1) u.pathname = p.slice(0, refIdx); else u.pathname = p;
      if (before !== u.pathname) log('hier:language:path-cleaned', { host, pathBefore: before, pathAfter: u.pathname });
      return `${u.origin}${u.pathname}${u.search || ''}`;
    } catch (_) { return input; }
  }

  // 规范化URL的去重键：仅 origin+pathname，用于跨变体去重
  function canonicalUrlKey(input) {
    try {
      const u = new URL(input);
      return `${u.origin}${u.pathname}`;
    } catch (_) { return input; }
  }

  // 提取 Amazon 品类唯一ID（node）：优先路径段中的数字，其次查询参数 ?node=
  function extractAmazonCategoryIdFromUrl(input) {
    try {
      const u = new URL(input);
      const segs = (u.pathname || '').split('/').filter(Boolean);
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i];
        if (/^\d{4,}$/.test(s)) return s;
      }
      const nodeParam = u.searchParams.get('node');
      if (nodeParam && /^\d{4,}$/.test(nodeParam)) return nodeParam;
    } catch (_) {}
    return '';
  }

  function buildHeadersForUrl(url) {
    let host = ''; try { host = new URL(url).hostname.toLowerCase(); } catch (_) {}
    const isAmazon = /amazon\./i.test(host);
    const waitSelector = isAmazon ? 'ol#zg-ordered-list > li, #zg-ordered-list li, .zg-grid-general-faceout, div[class*="grid-cell"], div[data-testid="grid-cell"]' : 'h1, article, main';
    const headers = {
      'x-wait-for-selector': waitSelector,
      'x-timeout-ms': isAmazon ? '8000' : '10000',
      'x-user-agent': isAmazon ? UA_POOL[0] : pickUA(),
      'accept-language': resolveAcceptLanguage(url),
      'x-accept-language': resolveAcceptLanguage(url),
      ...(isAmazon ? { 'referer': 'https://www.amazon.co.jp/' } : {})
    };
    log('hier:headers-built', { url, host, isAmazon, userAgent: headers['x-user-agent'], acceptLanguage: headers['accept-language'] });
    return headers;
  }

  function isAmazonDoorHtml(html) {
    if (!html) return false;
    return /CAPTCHA/i.test(html) || /下のボタンをクリックしてショッピングを続けてください/.test(html) || /Continue shopping/i.test(html);
  }

  async function refetchAmazonHtmlIfDoor(url, headers, html) {
    if (!isAmazonDoorHtml(html)) {
      const st = extractAmazonStructured(html, url);
      return { html, structured: st, refetched: false };
    }
    log('hier:door-detected-html', { url });
    const altHeaders = { 'x-timeout-ms': '7000', 'x-user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0', 'accept-language': resolveAcceptLanguage(url), 'x-accept-language': resolveAcceptLanguage(url) };
    try {
      const h2 = await fetchHtmlWithReader(url, altHeaders, { signal: abortCtrl?.signal });
      const st2 = extractAmazonStructured(h2, url);
      return { html: h2, structured: st2, refetched: true };
    } catch (e) {
      // 若为用户中止，向上抛出以停止后续写入
      if (abortCtrl?.signal?.aborted || (e && (e.name === 'AbortError' || /aborted/i.test(e.message || '')))) {
        log('hier:reader:aborted', { url });
        throw e;
      }
      logError('hier:door-refetch-fail-html', e, { url });
      const st0 = extractAmazonStructured(html, url);
      return { html, structured: st0, refetched: false };
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
      try {
        const json = JSON.stringify(val);
        const m = json.match(/https?:\/\/[^\s"'<>]+/i);
        return m ? m[0] : '';
      } catch (_) { return ''; }
    }
    return '';
  }

  // 提取首个 URL 与其对应的原始文本标签
  function extractUrlAndLabel(val) {
    const pickFromText = (text) => {
      if (!text) return { url: '', label: '' };
      const m = text.match(/https?:\/\/\S+/i);
      if (!m) return { url: '', label: '' };
      const url = m[0];
      const idx = text.indexOf(url);
      const label = (idx > 0 ? text.slice(0, idx) : text).trim();
      return { url, label };
    };
    if (Array.isArray(val)) {
      for (const seg of val) {
        if (seg && typeof seg === 'object') {
          if (seg.link && /^https?:\/\//i.test(seg.link)) {
            return { url: seg.link, label: (seg.text || seg.value || '').trim() };
          }
          const picked = pickFromText(seg.text || seg.value || '');
          if (picked.url) return picked;
        } else if (typeof seg === 'string') {
          const picked = pickFromText(seg);
          if (picked.url) return picked;
        }
      }
      return { url: '', label: '' };
    }
    if (typeof val === 'string') return pickFromText(val);
    if (typeof val === 'object') {
      if (val.link && /^https?:\/\//i.test(val.link)) return { url: val.link, label: (val.text || val.value || '').trim() };
      if (val.url && /^https?:\/\//i.test(val.url)) return { url: val.url, label: (val.text || val.value || '').trim() };
      try {
        const json = JSON.stringify(val);
        const m = json.match(/https?:\/\/[^\s"'<>]+/i);
        if (m) return { url: m[0], label: (val.text || val.value || '').trim() };
      } catch (_) {}
      return { url: '', label: '' };
    }
    return { url: '', label: '' };
  }

  async function ensureDomainInterval(url) {
    const minInterval = /amazon\./i.test((() => { try { return new URL(url).hostname.toLowerCase(); } catch(_) { return ''; } })()) ? 1200 : 300;
    const now = Date.now();
    const last = lastFetchAtByHost.get((() => { try { return new URL(url).hostname.toLowerCase(); } catch(_) { return ''; } })()) || 0;
    const needWait = Math.max(0, minInterval - (now - last));
    if (needWait > 0) { await new Promise((r) => setTimeout(r, needWait)); }
    const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch(_) { return ''; } })();
    lastFetchAtByHost.set(host, Date.now());
  }
  const lastFetchAtByHost = new Map();

  function parseCategoryFromTitle(title) {
    const zh = title.match(/销售排行榜[:：]\s*(.+?)\s*中最受欢迎的商品/);
    const ja = title.match(/売れ筋ランキング[:：]?\s*(.+)/);
    const en = title.match(/Best Sellers in\s+(.+)/i);
    const m = zh || ja || en;
    return m ? (m[1] || '').trim() : '';
  }

  // 名称去重用的规范化
  function normalizeLabel(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

  // 清洗“Bestseller/Best Sellers/売れ筋/畅销榜/Meilleures ventes/Los más vendidos”等各语言前缀
  function cleanCategoryLabel(raw) {
    let s = (raw || '').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    const patterns = [
      /^(?:best\s*sellers?)(?:\s+(?:in|for|of))?\s*[:：-]?\s*/i, // EN
      /^(?:bestseller)(?:\s+(?:in|für|von|im|in\s+der|in\s+den|in\s+das))?\s*[:：-]?\s*/i, // DE
      /^(?:meilleures?\s+ventes?)(?:\s+(?:dans|de))?\s*[:：-]?\s*/i, // FR
      /^(?:(?:los\s+)?(?:más|mas)\s+vendidos?)(?:\s+(?:en|de))?\s*[:：-]?\s*/i, // ES
      /^(?:(?:i\s+)?più\s+venduti)(?:\s+(?:in|di))?\s*[:：-]?\s*/i, // IT
      /^(?:mais\s+vendidos)(?:\s+(?:em|de))?\s*[:：-]?\s*/i, // PT
      /^(?:best\s*verkocht(?:e)?|bestsellers)(?:\s+(?:in|van))?\s*[:：-]?\s*/i, // NL
      /^(?:bästsäljare(?:n)?)(?:\s+(?:i|av))?\s*[:：-]?\s*/i, // SV
      /^(?:bestsellery)(?:\s+(?:w|z))?\s*[:：-]?\s*/i, // PL
      /^(?:en\s*çok\s*satanlar)(?:\s+(?:içinde|de))?\s*[:：-]?\s*/i, // TR
      /^(?:畅销榜|热销|热卖|畅销)\s*[:：-]?\s*/i, // ZH
      /^(?:売れ筋ランキング|売れ筋)\s*[:：-]?\s*/i, // JA
      /^(?:الأكثر\s+مبيعًا|الاكثر\s+مبيعا)\s*[:：-]?\s*/i, // AR
    ];
    for (const re of patterns) s = s.replace(re, '');
    s = s.replace(/^[·|,\-:：]+/, '').replace(/[·|,\-:：]+$/, '');
    return s.replace(/\s+/g, ' ').trim();
  }

  // 当抓取到的名称为空时，从URL推导一个可读标签（避免返回纯数字/裸链接）
  function labelFromUrl(u) {
    try {
      const x = new URL(u);
      const p = decodeURIComponent(x.pathname || '').split('/').filter(Boolean);
      const last = (p[p.length - 1] || '').replace(/[-_]+/g, ' ').trim();
      const guess = cleanCategoryLabel(last);
      // 避免把品类ID当作标签
      if (guess && !/^\d{4,}$/.test(guess) && !/^https?:/i.test(guess)) return guess;
      // 回退为域名（去掉 www.）
      const hostLabel = (x.hostname || '').replace(/^www\./, '');
      return hostLabel || '';
    } catch (_) { return ''; }
  }

  // 标签有效性校验：过滤纯数字或疑似URL的文本
  function isInvalidCategoryLabel(s) {
    const t = cleanCategoryLabel(s);
    if (!t) return true;
    if (/^https?:/i.test(t)) return true;
    if (/^\d{4,}$/.test(t)) return true;
    return false;
  }

  // 显示文本统一为“品类1 + 当前层”，避免出现三段或更多层显示
  function formatPairLabel(root, child) {
    const r = cleanCategoryLabel(root);
    const c = cleanCategoryLabel(child);
    if (!r) return c;
    if (!c) return r;
    const rl = r.toLowerCase();
    const cl = c.toLowerCase();
    // 若子名已包含根名（如“Baby Food Getränke”），则不重复前缀
    if (cl.includes(rl)) return c;
    return `${r} ${c}`;
  }

  // 字段创建与获取
  async function ensureTextField(table, name) {
    const metas = await table.getViewById(viewId.value).then(v => v.getFieldMetaList());
    const hit = metas.find(m => m.name === name);
    if (hit) return await table.getFieldById(hit.id);
    const fid = await table.addField({ type: FieldType.Text, name });
    return await table.getFieldById(fid);
  }

  async function ensureUrlField(table, name) {
    const metas = await table.getViewById(viewId.value).then(v => v.getFieldMetaList());
    const hit = metas.find(m => m.name === name);
    if (hit) {
      if (hit.type !== FieldType.Url) {
        try { await table.setField(hit.id, { type: FieldType.Url }); } catch (_) {}
      }
      return await table.getFieldById(hit.id);
    }
    const fid = await table.addField({ type: FieldType.Url, name });
    return await table.getFieldById(fid);
  }

  // 新增：确保“品类N”字段，兼容旧字段名“N级榜单”，并自动重命名
  async function ensureCategoryUrlField(table, n) {
    const metas = await table.getViewById(viewId.value).then(v => v.getFieldMetaList());
    const newName = `品类${n}`;
    const legacyName = `${n}级榜单`;
    let hit = metas.find(m => m.name === newName) || metas.find(m => m.name === legacyName);
    if (hit) {
      // 若为旧名，尝试改名
      if (hit.name === legacyName) {
        try { await table.setField(hit.id, { name: newName }); } catch (_) {}
      }
      if (hit.type !== FieldType.Url) {
        try { await table.setField(hit.id, { type: FieldType.Url }); } catch (_) {}
      }
      return await table.getFieldById(hit.id);
    }
    const fid = await table.addField({ type: FieldType.Url, name: newName });
    return await table.getFieldById(fid);
  }

  async function ensureStatusField(table) {
    // 需求变更：删除状态列，不再维护提取状态
    const metas = await table.getViewById(viewId.value).then(v => v.getFieldMetaList());
    const hit = metas.find(m => m.name === '状态');
    if (hit) {
      try { await table.deleteField(hit.id); log('hier:status-field-deleted', { fieldId: hit.id }); } catch (e) { logError('hier:status-field-delete-error', e, { fieldId: hit.id }); }
    }
    return null;
  }

  async function runHierarchyExtraction() {
    runError.value = '';
    if (!seedFieldId.value) { runError.value = '请选择品类1链接字段'; return; }
    running.value = true; paused.value = false; progress.value = { done: 0, total: 0 };
    abortCtrl = new AbortController();
    try {
      const table = await base.getTable(databaseId.value);
      const view = await table.getViewById(viewId.value);
      const recordIds = (await view.getVisibleRecordIdList?.()) || [];
      if (!recordIds.length) { runError.value = '当前视图没有可更新的记录'; return; }
      await ensureStatusField(table); // 删除“状态”列（如果存在）
      const seedMeta = (fieldList.value || []).find(m => m.id === seedFieldId.value);
      // 若种子字段名是旧名，尝试改名为“品类1”
      try {
        if (seedMeta && (/^(1|一)级榜单/.test(seedMeta.name) || seedMeta.name === '1级榜单')) {
          await table.setField(seedMeta.id, { name: '品类1' });
        }
      } catch (_) {}
      const levelFields = [];
      for (let i = 2; i <= maxDepth.value; i++) {
        const f = await ensureCategoryUrlField(table, i);
        levelFields.push(f);
      }
      // 构建初始种子（逐个一级榜单顺序处理）
      const seeds = [];
      for (const rid of recordIds) {
        try {
          const val = await table.getCellValue(seedFieldId.value, rid);
          const { url, label } = extractUrlAndLabel(val);
          if (url) seeds.push({ level: 1, chain: [], chainUrls: [url], url, parentRecordId: rid, seedRid: rid, seedLabel: label });
        } catch (_) {}
      }
      progress.value.total = seeds.length;
      log('hier:start', { seeds: seeds.length, maxDepth: maxDepth.value });

      let created = 0;
      // 全局去重：在整个运行中，同一“品类1 + 子链接”的组合只写一次
      const globalChildKeySet = new Set();

      // 关键：逐个处理一级榜单；并且首子项重合写入父级最后一行
      for (const seed of seeds) {
        if (paused.value || (abortCtrl && abortCtrl.signal?.aborted)) { log('hier:aborted'); break; }
        const visited = new Set();
        const lastRowByChainKey = new Map(); // key: seedRid|name1|name2|...

        function makeChainKey(seedRid, chainArray, uptoDepth) {
          const segs = [String(seedRid)];
          for (let i = 0; i < Math.min(uptoDepth, chainArray.length); i++) {
            const v = chainArray[i]; if (v) segs.push(String(v));
          }
          return segs.join('|');
        }

        async function processNode(node) {
          if (paused.value || (abortCtrl && abortCtrl.signal?.aborted)) return;
          const langUrl = applyLanguageToUrl(node.url);
          const normalized = normalizeAmazonUrl(langUrl);
          const chainUrls = Array.isArray(node.chainUrls) ? [...node.chainUrls] : [];
          if (node.level === 1) chainUrls[0] = normalized;
          await ensureDomainInterval(normalized);
          const headers = buildHeadersForUrl(normalized);
          const html0 = await fetchHtmlWithReader(normalized, headers, { signal: abortCtrl.signal });
          const { html, structured } = await refetchAmazonHtmlIfDoor(normalized, headers, html0);
          const title = (structured?.title || '').trim();
          const parentName = node.level === 1 ? (parseCategoryFromTitle(title) || title) : (node.chain[node.chain.length - 1] || '');
          const side = Array.isArray(structured?.sidebar) ? structured.sidebar : [];
          // 将“当前榜单”作为首个品类2子项（仅当处理一级时）
          let sideWithCurrent = side;
          if (node.level === 1) {
            const currentName = (structured?.active_category || '').trim() || parentName;
            const currentId = (structured?.active_category_id || extractAmazonCategoryIdFromUrl(normalized) || '');
            if (currentName && normalized) {
              const currentChild = { name: currentName, url: normalized, nav_level: 2, category_id: currentId };
              sideWithCurrent = [currentChild, ...side];
            }
          }
          log('hier:node', { level: node.level, parentName, childCount: sideWithCurrent.length, url: normalized });

          // 回填一级榜单到原字段：保持原始粘贴的文本，不用采集到的分类名
          if (node.level === 1 && seedMeta) {
            try {
              const seedField = await table.getFieldById(seedFieldId.value);
              const valSeg = { type: 'url', text: (node.seedLabel || '').trim(), link: normalized };
              if (seedMeta.type === FieldType.Url) {
                await seedField.setValue(node.parentRecordId, valSeg);
              } else if (seedMeta.type === FieldType.Text) {
                await seedField.setValue(node.parentRecordId, [valSeg]);
              }
              log('hier:level1-backfill', { recordId: node.parentRecordId, name: (node.seedLabel || '').trim(), url: normalized });
            } catch (e) { logError('hier:level1-backfill-error', e, { recordId: node.parentRecordId }); }
          }

          // 逐子项：首子项重合写入父级最后一行，其余新增
          let childIndex = 0;
          const seenChildByUrl = new Set();
          const seenChildByName = new Set();
          for (const s of sideWithCurrent) {
            if (!s || !(s.name || '').trim() || !(s.url || '').trim()) continue;
            const childName = (s.name || '').trim();
            const childUrlRaw = (s.url || '').trim();
            const childUrl = normalizeAmazonUrl(applyLanguageToUrl(childUrlRaw));
            // 去重一：优先使用品类唯一ID，其次 canonical URL（忽略查询参数）
            const canKey = canonicalUrlKey(childUrl);
            const childIdKey = (s.category_id || extractAmazonCategoryIdFromUrl(childUrl) || canKey);
            if (seenChildByUrl.has(childIdKey)) { childIndex++; continue; }
            seenChildByUrl.add(childIdKey);
            // 去重二：同名（在同一父级下），防止名称重复的多链接情况
            const nameKey = normalizeLabel(childName);
            if (seenChildByName.has(nameKey)) { childIndex++; continue; }
            seenChildByName.add(nameKey);

            // 全局去重三：同一品类1 + 子链接组合在整个运行中只写入一次
            const parentIdKey = extractAmazonCategoryIdFromUrl(chainUrls[0] || node.url || seed.url || '') || canonicalUrlKey(chainUrls[0] || node.url || seed.url || '');
            const globalKey = `${parentIdKey}@@${childIdKey}`;
            if (globalChildKeySet.has(globalKey)) { childIndex++; continue; }
            globalChildKeySet.add(globalKey);
            const nextChain = [...node.chain];
            if (node.level === 1) nextChain[0] = parentName;
            const navLevel = (typeof s.nav_level === 'number' && s.nav_level >= 2) ? s.nav_level : (node.level + 1);
            const chainIdx = Math.max(1, navLevel - 1);
            nextChain[chainIdx] = childName;
            const nextChainUrls = [...chainUrls];
            nextChainUrls[chainIdx] = childUrl;
            const rootForPair = nextChain[0] || node.rootName || parentName;

            // 计算要写入的字段（当前子层的字段），仅当子层级 <= maxDepth
            const childLevel = navLevel; // 使用导航层级映射到“品类N”
            const fieldIdx = childLevel - 2; // 品类2=>0, 品类3=>1, ...
            const targetField = childLevel <= maxDepth.value ? levelFields[fieldIdx] : null;
          const childText = cleanCategoryLabel(childName);
          const urlSeg = { type: 'url', text: childText, link: childUrl };

            let recordIdForThisChain;
            if (childIndex === 0 && targetField) {
              // 首子项：写进父级的“最后一行”——若无，则用父记录本身
              let targetRid;
              const parentKey = makeChainKey(node.seedRid || seed.seedRid, nextChain, Math.max(1, chainIdx)); // up to parent level by chainIdx
              const lastRid = lastRowByChainKey.get(parentKey);
              targetRid = lastRid || node.parentRecordId;
              try {
                // 通用规则：首行在父记录中仅填“下一列=父层本身”，不再扩展下一列，避免冗余列
                const parentChainIdx = Math.max(0, node.level - 1);
                const parentUrlForWrite = nextChainUrls[parentChainIdx] || chainUrls[parentChainIdx] || normalized;
                let parentText = cleanCategoryLabel(parentName || nextChain[parentChainIdx] || '') || cleanCategoryLabel((structured?.active_category || '').trim());
                if (isInvalidCategoryLabel(parentText)) {
                  parentText = cleanCategoryLabel((node.seedLabel || '').trim()) || cleanCategoryLabel(parentName || '') || '未命名品类';
                }
                const parentSeg = { type: 'url', text: parentText, link: parentUrlForWrite };
                await targetField.setValue(targetRid, parentSeg);
                log('hier:overlay-first-child-general', { targetRid, level: node.level, parent: cleanCategoryLabel(parentName) });

                // 为后续递归与其余子项准备“标准行”：使其父记录为该新行
                if (childLevel <= maxDepth.value) {
                  const fieldsPayload = {};
                  for (let i = 0; i < levelFields.length; i++) {
                    const f = levelFields[i];
                    const ci = i + 1;
                    const nameSeg = nextChain[ci];
                    const linkSeg = nextChainUrls[ci];
                    if (linkSeg) {
                      const txt = cleanCategoryLabel(nameSeg || '') || '未命名品类';
                      fieldsPayload[f.id] = { type: 'url', text: txt, link: linkSeg };
                    }
                  }
                  // 种子字段（一级）
                  if (seedMeta && nextChainUrls[0]) {
                    const seg = { type: 'url', text: (seed.seedLabel || '').trim(), link: nextChainUrls[0] };
                    if (seedMeta.type === FieldType.Url) fieldsPayload[seedMeta.id] = seg; else if (seedMeta.type === FieldType.Text) fieldsPayload[seedMeta.id] = [seg];
                  }
                  const rid = await table.addRecord({ fields: fieldsPayload });
                  created++;
                  recordIdForThisChain = rid;
                  const thisKey = makeChainKey(node.seedRid || seed.seedRid, nextChain, childLevel);
                  lastRowByChainKey.set(thisKey, rid);
                  log('hier:record-added-for-first-child', { rid, childLevel, child: cleanCategoryLabel(childName) });
                } else {
                  recordIdForThisChain = targetRid;
                  const thisKey = makeChainKey(node.seedRid || seed.seedRid, nextChain, childLevel);
                  lastRowByChainKey.set(thisKey, targetRid);
                }
              } catch (e) { logError('hier:overlay-error', e, { targetRid, level: node.level + 1, name: childName }); }
            } else {
              if (childLevel > maxDepth.value) {
                // 超出最大层级：不再新增记录，仅停止在此层
                childIndex++;
                continue;
              }
              // 其余子项：新增一行（无法指定位置，但保持同父链字段以便视图相邻）
              const fieldsPayload = {};
              // 填二级及以上字段
              for (let i = 0; i < levelFields.length; i++) {
                const f = levelFields[i];
                const chainIdx = i + 1;
                const nameSeg = nextChain[chainIdx];
                const linkSeg = nextChainUrls[chainIdx];
                if (linkSeg) {
                  const txt = cleanCategoryLabel(nameSeg || '') || '未命名品类';
                  fieldsPayload[f.id] = { type: 'url', text: txt, link: linkSeg };
                }
              }
              // 种子字段（一级）：保持原始粘贴文本
              if (seedMeta && nextChainUrls[0]) {
                const seg = { type: 'url', text: (seed.seedLabel || '').trim(), link: nextChainUrls[0] };
                if (seedMeta.type === FieldType.Url) fieldsPayload[seedMeta.id] = seg; else if (seedMeta.type === FieldType.Text) fieldsPayload[seedMeta.id] = [seg];
              }
              try {
                const rid = await table.addRecord({ fields: fieldsPayload });
                created++;
                recordIdForThisChain = rid;
                const thisKey = makeChainKey(node.seedRid || seed.seedRid, nextChain, childLevel);
                lastRowByChainKey.set(thisKey, rid);
                log('hier:record-added', { rid, chain: nextChain.filter(Boolean) });
              } catch (e) { logError('hier:record-add-error', e, { chain: nextChain.filter(Boolean) }); }
            }

            // 递归深入下一层（第一项已重合，其余为新增），继续以“最后一行”为父
            if (childLevel <= maxDepth.value) {
              const key = childIdKey;
              if (!visited.has(key)) {
                visited.add(key);
                const thisKey = makeChainKey(node.seedRid || seed.seedRid, nextChain, childLevel);
                const parentRidForNext = lastRowByChainKey.get(thisKey) || recordIdForThisChain;
                queue.push({ level: childLevel, chain: nextChain, chainUrls: nextChainUrls, url: childUrl, parentRecordId: parentRidForNext, seedRid: seed.seedRid, seedLabel: seed.seedLabel, rootName: rootForPair });
              }
            }
            childIndex++;
          }
        }

        // 针对当前种子，使用局部队列深度优先处理，直到该一级榜单完成
        const queue = [{ ...seed }];
        while (queue.length) {
          if (paused.value || (abortCtrl && abortCtrl.signal?.aborted)) { log('hier:aborted'); break; }
          const node = queue.shift();
          try { await processNode(node); } catch (e) { logError('hier:process-node-error', e, { url: node?.url, level: node?.level }); }
        }
        progress.value.done++;
      }

      log('hier:end', { created, seeds: seeds.length });
    } catch (e) {
      runError.value = (e && e.message) ? e.message : '提取失败';
      logError('hier:error', e);
    } finally {
      running.value = false; paused.value = false; abortCtrl = null;
    }
  }

  function pauseRun() {
    try {
      if (!running.value) return;
      paused.value = true;
      if (abortCtrl) { try { abortCtrl.abort(); } catch (_) {} }
      // 不立即关闭 running，保持进度与暂停按钮显示
      log('hier:paused', { done: progress.value.done, total: progress.value.total });
    } catch (e) { logError('hier:pause-error', e); }
  }

</script>

<template>
  <div class="hier">
    <div class="section">
      <div class="text">品类1所在字段</div>
      <el-select v-model="seedFieldId" placeholder="请选择字段" popper-class="selectStyle">
      <el-option v-for="item in fieldList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <div class="hint small">默认进入自动选择首列，可手动调整</div>
      <div class="text">最大提取层级</div>
      <el-input-number v-model="maxDepth" :min="1" :max="15" />

      <div class="text">输出语言</div>
      <el-select v-model="outputLangMode" placeholder="选择语言" popper-class="selectStyle">
        <el-option v-for="opt in LANG_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>

      <div class="run-row">
        <el-button type="primary" :loading="running && !paused" @click="runHierarchyExtraction">启动提取</el-button>
        <el-button type="warning" v-if="running" @click="pauseRun">暂停</el-button>
        <div v-if="running" class="progress">{{ progress.done }} / {{ progress.total }}</div>
      </div>
      <div v-if="runError" class="error">{{ runError }}</div>
    </div>

    <div class="runtime-panel">
      <div class="runtime-header">
        <div>运行日志</div>
        <div class="runtime-actions">
          <el-switch v-model="logAutoScroll" active-text="自动滚动" />
          <el-tooltip content="下载日志" placement="top">
            <el-button link @click="downloadLogs">
              <span class="icon-download" aria-hidden="true">⬇︎</span>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="runtime-body" ref="logViewRef">
        <pre class="runtime-pre">{{ formattedRuntimeText }}</pre>
      </div>
      <div class="runtime-tip">如有问题，请下载日志文件并发给 gary。</div>
    </div>
  </div>
</template>

<style scoped>
  .section { display: flex; flex-direction: column; gap: var(--space-m); }
  .run-row { display: flex; gap: 8px; align-items: center; }
  .error { color: #e11d48; font-size: 13px; }
  .runtime-panel { margin-top: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-muted); }
  .runtime-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid var(--border-color); font-size: 13px; color: #374151; }
  .runtime-actions { display: flex; gap: 8px; align-items: center; }
  .runtime-body { max-height: 220px; overflow: auto; padding: 8px 10px; background: var(--el-bg-color, #ffffff); }
  .runtime-pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; margin: 0; }
  .runtime-tip { padding: 6px 10px; font-size: 12px; color: var(--text-weak); border-top: 1px dashed var(--border-color); }
  .icon-download { display: inline-block; width: 16px; height: 16px; line-height: 16px; text-align: center; }
</style>

<style>
  .selectStyle {
    .el-select-dropdown__item { font-weight: 300 !important; }
    .el-select-dropdown__item.selected { color: rgb(20, 86, 240); }
  }
</style>