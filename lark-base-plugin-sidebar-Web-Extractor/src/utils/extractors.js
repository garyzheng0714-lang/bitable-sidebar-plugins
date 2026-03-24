/*
 * Extractors: site-specific and generic content parsing
 */

/**
 * Extract title and products (name + reviews) from Amazon bestseller pages.
 * @param {string} html
 * @returns {{title:string, items:Array<{name:string,reviews:number|null}>}}
 */
export function extractFromAmazon(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title = (doc.querySelector('title')?.textContent || '').trim();

  const anchors = Array.from(doc.querySelectorAll('a[href*="/dp/"]'));
  const seen = new Set();
  const items = [];

  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    if (!href || seen.has(href)) continue;
    let name = (a.querySelector('span')?.textContent || a.textContent || '').trim();
    name = normalizeText(name);
    if (!name || name.length < 3) continue;

    const container = a.closest('li, div');
    const reviewsText = findReviewsText(container) || findSiblingReviewsText(a);
    const reviews = reviewsText ? parseInt(extractDigits(reviewsText)) || null : null;

    items.push({ name, reviews });
    seen.add(href);
    if (items.length >= 50) break;
  }

  // Deduplicate by name (coarse) and keep first 30
  const uniq = [];
  const nameSet = new Set();
  for (const it of items) {
    if (nameSet.has(it.name)) continue;
    nameSet.add(it.name);
    uniq.push(it);
    if (uniq.length >= 30) break;
  }

  return { title, items: uniq };
}

/**
 * Generic extraction: title and main text snippet
 * @param {string} html
 * @returns {{title:string, text:string}}
 */
export function extractGeneric(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title = (doc.querySelector('title')?.textContent || '').trim();
  const main =
    doc.querySelector('article') ||
    doc.querySelector('main') ||
    doc.querySelector('div#content, div[class*="content"], section');
  const text = normalizeText((main?.textContent || doc.body?.innerText || '').trim());
  return { title, text };
}

/**
 * Extract ranking JSON with title from <h1> and all product cards.
 * Product name from <a class="a-link-normal"> or <img alt="">.
 * Review count from <a class="a-size-small a-link-normal"> or <span class="a-size-small">.
 * Missing review -> "无评论数信息".
 * @param {string} html
 * @returns {{ranking_title:string, items:Array<{rank:number, product_name:string, review_count:number|string}>}}
 */
export function extractRankingJSON(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const ranking_title = normalizeText((doc.querySelector('h1')?.textContent || '').trim());

  // Find potential product anchors and their containers
  const anchors = Array.from(
    doc.querySelectorAll(
      'a.a-link-normal[href*="/dp/"], a.a-link-normal[href*="/gp/product/"], a[href*="/dp/"]'
    )
  );
  const items = [];
  const nameSeen = new Set();

  const getContainer = (el) => el.closest('li, article, .zg-grid-general-faceout, .a-section, .sg-col, div') || el.parentElement;
  const isRatingText = (text) => {
    const s = (text || '').toLowerCase();
    return /颗星|星级|rating|stars/.test(s);
  };
  const isVariantText = (text) => {
    const s = (text || '').toLowerCase();
    return /另有|其他|版本|变体|选项|颜色|款式|価格|円|オプション|バリエーション|price|from/.test(s);
  };
  const getNameFromAnchor = (a) => {
    // Prefer dedicated title spans
    const titleSpan = a.querySelector('span.a-size-base, span.a-size-medium, span.a-size-large');
    let t = normalizeText((titleSpan?.textContent || a.textContent || '').trim());
    if (isRatingText(t)) t = '';
    if (!t || t.length < 2) {
      const img = a.querySelector('img[alt]') || getContainer(a)?.querySelector('img[alt]');
      t = normalizeText((img?.getAttribute('alt') || '').trim());
    }
    return t;
  };
  const getReviewFromContainer = (c) => {
    if (!c) return '无评论数信息';
    const el = c.querySelector('a.a-size-small.a-link-normal, span.a-size-small');
    const txt = normalizeText((el?.textContent || el?.getAttribute('aria-label') || '').trim());
    const m = txt.match(/\d[\d,.]*/);
    if (!m) return '无评论数信息';
    const num = m[0].replace(/[,.]/g, '');
    return num ? Number(num) : '无评论数信息';
  };

  // Prefer iterating bestseller list items to avoid non-product anchors
  let cards = Array.from(doc.querySelectorAll('ol#zg-ordered-list > li'));
  if (cards.length === 0) {
    // Fallback: broader list items; will filter by presence of product anchors
    cards = Array.from(doc.querySelectorAll('li'));
  }
  for (const c of cards) {
    const a = c.querySelector('a[href*="/dp/"], a[href*="/gp/product/"]');
    if (!a) continue;
    const name = getNameFromAnchor(a);
    if (!name || isRatingText(name) || isVariantText(name)) continue;
    if (nameSeen.has(name)) continue;
    const review_count = getReviewFromContainer(c);
    nameSeen.add(name);
    items.push({ rank: items.length + 1, product_name: name, review_count });
  }

  // If still empty, scan anchors as a fallback
  if (items.length === 0) {
    for (const a of anchors) {
      const rawText = normalizeText((a.textContent || '').trim());
      if (isRatingText(rawText) || isVariantText(rawText)) continue;
      const name = getNameFromAnchor(a);
      if (!name || isVariantText(name)) continue;
      if (nameSeen.has(name)) continue;
      const container = getContainer(a);
      const review_count = getReviewFromContainer(container);
      nameSeen.add(name);
      items.push({ rank: items.length + 1, product_name: name, review_count });
    }
  }

  // If no anchors matched, try image-alts fallback across common card containers
  if (items.length === 0) {
    const cards = Array.from(doc.querySelectorAll('li, article, .zg-grid-general-faceout, .a-section, .sg-col, div'));
    for (const c of cards) {
      const img = c.querySelector('img[alt]');
      const name = normalizeText((img?.getAttribute('alt') || '').trim());
      if (!name || nameSeen.has(name)) continue;
      const review_count = getReviewFromContainer(c);
      nameSeen.add(name);
      items.push({ rank: items.length + 1, product_name: name, review_count });
    }
  }

  return { ranking_title, items };
}

function findReviewsText(container) {
  if (!container) return null;
  // Common patterns around Amazon review counts
  const candidates = [
    ...container.querySelectorAll('span[aria-label], a[aria-label], span.a-size-small, span.a-icon-alt'),
  ];
  for (const el of candidates) {
    const t = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (isReviewLike(t)) return t;
  }
  // Link to reviews page often contains the count
  const reviewsLink = container.querySelector('a[href*="/product-reviews/"]');
  if (reviewsLink) {
    const t = (reviewsLink.getAttribute('aria-label') || reviewsLink.textContent || '').trim();
    if (isReviewLike(t)) return t;
  }
  return null;
}

function findSiblingReviewsText(anchor) {
  // Look around the anchor
  const parent = anchor.closest('li, div') || anchor.parentElement;
  return findReviewsText(parent);
}

function isReviewLike(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  // Japanese / Chinese / English hints
  return (
    /評価|レビュー|件|条评|条评论|口コミ/.test(text) ||
    lower.includes('rating') || lower.includes('ratings') || lower.includes('reviews')
  ) && /\d/.test(text);
}

function extractDigits(text) {
  const m = text && text.match(/([\d,.]+)/);
  if (!m) return '';
  return m[1].replace(/[,\.]/g, '');
}

function normalizeText(t) {
  return (t || '').replace(/\s+/g, ' ').trim();
}

/**
 * Amazon 畅销榜结构化提取：标题、当前分类、侧边链接（识别 zg_bs_nav_* 导航层级）、商品列表（含 URL 与评论数）
 * 目标：稳定筛掉页面顶部/底部的导航噪音，仅输出核心信息。
 * @param {string} html
 * @param {string} baseUrl
 * @returns {{title:string, active_category:string, active_category_id:string, sidebar:Array<{name:string,url:string,nav_level:number|null,nav_ancestor:string|null,category_id:string|null}>, items:Array<{rank:number,product_name:string,review_count:number|null,product_url:string}>}}
 */
export function extractAmazonStructured(html, baseUrl) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const abs = (href) => {
    try {
      return new URL(href, baseUrl).toString();
    } catch (_) {
      return href || '';
    }
  };

  // 标题：优先 h1/zg_banner_text，再尝试从左侧当前分类补全明确分类名；保留站点原始语言
  let title = normalizeText((doc.querySelector('#zg_banner_text')?.textContent || doc.querySelector('h1')?.textContent || '').trim());
  if (!title) {
    title = normalizeText((doc.querySelector('title')?.textContent || '').trim());
  }
  // 提取左侧导航当前选中分类
  let activeCategory = normalizeText((doc.querySelector('#zg_browseRoot .zg_selected a')?.textContent || doc.querySelector('#zg_browseRoot .zg_selected')?.textContent || '').trim());
  if (!activeCategory) {
    const currentLink = doc.querySelector('#zg_browseRoot a[aria-current="true"]');
    activeCategory = normalizeText((currentLink?.textContent || '').trim());
  }
  // 组合完整标题：分类 + 语言对应的“売れ筋ランキング/销售排行榜/Best Sellers”
  // 语言推断：优先域名与路径提示
  let host = '';
  let path = '';
  try {
    const u = new URL(baseUrl);
    host = (u.hostname || '').toLowerCase();
    path = u.pathname || '';
  } catch (_) {}
  const isJP = host.endsWith('.co.jp') || /\/\-\/ja/i.test(path);
  const isZH = /\/\-\/zh/i.test(path);
  const basePhrase = isJP ? '売れ筋ランキング' : (isZH ? '销售排行榜' : 'Best Sellers');
  const ofWord = isJP ? 'の' : (isZH ? '的' : 'in');

  // 当侧边分类缺失时，尝试从 <title> 中解析分类名
  let categoryFromTitle = '';
  const rawTitleTag = normalizeText((doc.querySelector('title')?.textContent || '').trim());
  if (!activeCategory) {
    const zh = rawTitleTag.match(/销售排行榜[:：]\s*(.+?)\s*中最受欢迎的商品/);
    const ja = rawTitleTag.match(/売れ筋ランキング[:：]?\s*(.+)/);
    const en = rawTitleTag.match(/Best Sellers in\s+(.+)/i);
    const m = zh || ja || en;
    if (m) categoryFromTitle = normalizeText((m[1] || '').trim());
  }

  const categoryName = normalizeText(activeCategory || categoryFromTitle || '');
  if (categoryName) {
    // JP/ZH："分类名 + の/的 + 卖得好"；EN："Best Sellers in 分类名"
    title = isJP ? `${categoryName}${ofWord}${basePhrase}` : (isZH ? `${categoryName}${ofWord}${basePhrase}` : `${basePhrase} ${ofWord} ${categoryName}`);
  }

  // 当前页面的品类唯一ID（node）：优先路径段中的数字，其次查询参数 ?node=
  let activeCategoryId = '';
  try {
    const uBase = new URL(baseUrl);
    const segs = (uBase.pathname || '').split('/').filter(Boolean);
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      if (/^\d{4,}$/.test(s)) { activeCategoryId = s; break; }
    }
    if (!activeCategoryId) {
      const nodeParam = uBase.searchParams.get('node');
      if (nodeParam && /^\d{4,}$/.test(nodeParam)) activeCategoryId = nodeParam;
    }
  } catch (_) {}

  // 侧边链接：稳定通过 zg_bs_nav_* ref 参数识别，且不在商品列表内
  const sidebar = [];
  const seen = new Set();
  const sideAnchors = Array.from(doc.querySelectorAll('a[href*="/gp/bestsellers/"]')).filter((a) => {
    const href = a.getAttribute('href') || '';
    if (!/zg_bs_nav_/i.test(href)) return false;
    if (a.closest('ol#zg-ordered-list')) return false;
    const name = normalizeText(a.textContent);
    return !!name && name.length > 1;
  });
  for (const a of sideAnchors) {
    const name = normalizeText(a.textContent);
    const hrefRaw = a.getAttribute('href') || '';
    const url = abs(hrefRaw);
    let nav_level = null;
    let nav_ancestor = null;
    const mNav = hrefRaw.match(/zg_bs_nav_[^_]+_(\d+)_(\d+)/i);
    if (mNav) {
      nav_level = parseInt(mNav[1], 10);
      nav_ancestor = mNav[2] || null;
    } else {
      const mUnv = hrefRaw.match(/zg_bs_unv_[^_]+_(\d+)_(\d+)/i);
      if (mUnv) {
        nav_level = parseInt(mUnv[1], 10);
        nav_ancestor = mUnv[2] || null;
      }
    }
    // 提取该链接指向的品类唯一ID：优先路径段数字，其次 ?node= 参数，最后回退到 ref 中的 ancestor
    let category_id = null;
    try {
      const uHref = new URL(url);
      const segs = (uHref.pathname || '').split('/').filter(Boolean);
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i];
        if (/^\d{4,}$/.test(s)) { category_id = s; break; }
      }
      if (!category_id) {
        const nodeParam = uHref.searchParams.get('node');
        if (nodeParam && /^\d{4,}$/.test(nodeParam)) category_id = nodeParam;
      }
    } catch (_) {}
    if (!category_id && nav_ancestor) category_id = nav_ancestor;
    const key = `${name}@@${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sidebar.push({ name, url, nav_level: Number.isFinite(nav_level) ? nav_level : null, nav_ancestor, category_id });
    if (sidebar.length >= 50) break;
  }

  // 商品列表：优先有序列表 <ol id="zg-ordered-list"> 的 <li>，并覆盖新版网格卡片
  const items = [];
  let cards = Array.from(
    doc.querySelectorAll(
      'ol#zg-ordered-list > li, #zg-ordered-list li, .zg-grid-general-faceout, div[class*="grid-cell"], div[data-testid="grid-cell"]'
    )
  );
  if (cards.length === 0) {
    // 回退：更广泛的容器，但仍以是否存在商品 anchor 为准
    cards = Array.from(doc.querySelectorAll('li, article, .a-section, .sg-col, .zg-grid-general-faceout, div'));
  }
  let rank = 1;
  const seenProduct = new Set(); // 去重：按 URL 或名称
  for (const c of cards) {
    const a = c.querySelector('a[href*="/dp/"], a[href*="/gp/product/"]');
    if (!a) continue;
    let name = '';
    const titleSpan = a.querySelector('span.a-size-base, span.a-size-medium, span.a-size-large');
    name = normalizeText((titleSpan?.textContent || a.textContent || '').trim());
    if (!name || name.length < 2) {
      const img = a.querySelector('img[alt]') || c.querySelector('img[alt]');
      name = normalizeText((img?.getAttribute('alt') || '').trim());
    }
    if (!name) continue;

    const product_url = abs(a.getAttribute('href') || '');
    const dedupKey = product_url || name;
    if (dedupKey && seenProduct.has(dedupKey)) continue;
    if (dedupKey) seenProduct.add(dedupKey);

    // 评论数：常见位置 a.a-size-small.a-link-normal 或 data-hook
    let review_count = null;
    const reviewEl = c.querySelector('.a-size-small.a-link-normal, [data-hook="total-review-count"], span.a-size-small');
    if (reviewEl) {
      const txt = normalizeText((reviewEl.textContent || reviewEl.getAttribute('aria-label') || '').trim());
      const m = txt.match(/\d[\d,\.\s]*/);
      if (m) {
        const n = Number(m[0].replace(/[,\.\s]/g, ''));
        if (!Number.isNaN(n)) review_count = n;
      }
    }

    // 评分文本（如 "4.3 颗星，最多 5 颗星"）
    let rating_text = '';
    const ratingEl = c.querySelector('.a-icon-alt, [aria-label*="星"], [aria-label*="stars"]');
    if (ratingEl) {
      rating_text = normalizeText((ratingEl.getAttribute('aria-label') || ratingEl.textContent || '').trim());
    }

    // 评论页面链接
    let reviews_url = '';
    const reviewsLinkEl = c.querySelector('a[href*="/product-reviews/"]');
    if (reviewsLinkEl) {
      reviews_url = abs(reviewsLinkEl.getAttribute('href') || '');
    }

    // 价格文本，优先 a-price 结构，其次扫描货币模式
    let price_text = '';
    const priceEl = c.querySelector('.a-price');
    if (priceEl) {
      const sym = (priceEl.querySelector('.a-price-symbol')?.textContent || '').trim();
      const whole = (priceEl.querySelector('.a-price-whole')?.textContent || '').trim();
      const frac = (priceEl.querySelector('.a-price-fraction')?.textContent || '').trim();
      price_text = normalizeText(`${sym}${whole}${frac ? '.' + frac : ''}`);
    }
    if (!price_text) {
      const raw = normalizeText(c.textContent || '');
      const m = raw.match(/(JP¥|￥|¥)\s*\d[\d,\.]*/);
      if (m) price_text = m[0].replace(/\s+/g, ' ');
    }

    items.push({ rank: rank++, product_name: name, review_count, product_url, rating_text, reviews_url, price_text });
  }

  // 如果未提取到商品，则尝试锚点回退（扫描全局商品锚点）
  if (items.length === 0) {
    const anchors = Array.from(doc.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]'));
    const seenHref = new Set();
    for (const a of anchors) {
      const href = a.getAttribute('href') || '';
      if (!href || seenHref.has(href)) continue;
      seenHref.add(href);
      // 名称：优先标题 span，其次图片 alt，最后文本
      const titleSpan = a.querySelector('span.a-size-base, span.a-size-medium, span.a-size-large');
      let name = normalizeText((titleSpan?.textContent || a.textContent || '').trim());
      if (!name || name.length < 2) {
        const img = a.querySelector('img[alt]') || (a.closest('li, .zg-grid-general-faceout, .a-section, .sg-col, div')?.querySelector('img[alt]'));
        name = normalizeText((img?.getAttribute('alt') || '').trim());
      }
      if (!name || name.length < 2) continue;
      const product_url = abs(href);
      const container = a.closest('li, .zg-grid-general-faceout, .a-section, .sg-col, div') || a.parentElement;
      // 评论数
      let review_count = null;
      if (container) {
        const reviewEl = container.querySelector('.a-size-small.a-link-normal, [data-hook="total-review-count"], span.a-size-small');
        if (reviewEl) {
          const txt = normalizeText((reviewEl.textContent || reviewEl.getAttribute('aria-label') || '').trim());
          const m = txt.match(/\d[\d,\.\s]*/);
          if (m) {
            const n = Number(m[0].replace(/[,.\s]/g, ''));
            if (!Number.isNaN(n)) review_count = n;
          }
        }
      }
      // 评分、评论链接、价格
      let rating_text = '';
      let reviews_url = '';
      let price_text = '';
      if (container) {
        const ratingEl = container.querySelector('.a-icon-alt, [aria-label*="星"], [aria-label*="stars"]');
        if (ratingEl) rating_text = normalizeText((ratingEl.getAttribute('aria-label') || ratingEl.textContent || '').trim());
        const reviewsLinkEl = container.querySelector('a[href*="/product-reviews/"]');
        if (reviewsLinkEl) reviews_url = abs(reviewsLinkEl.getAttribute('href') || '');
        const priceEl = container.querySelector('.a-price');
        if (priceEl) {
          const sym = (priceEl.querySelector('.a-price-symbol')?.textContent || '').trim();
          const whole = (priceEl.querySelector('.a-price-whole')?.textContent || '').trim();
          const frac = (priceEl.querySelector('.a-price-fraction')?.textContent || '').trim();
          price_text = normalizeText(`${sym}${whole}${frac ? '.' + frac : ''}`);
        }
        if (!price_text) {
          const raw = normalizeText(container.textContent || '');
          const m2 = raw.match(/(JP¥|￥|¥)\s*\d[\d,\.]*/);
          if (m2) price_text = m2[0].replace(/\s+/g, ' ');
        }
      }
      items.push({ rank: rank++, product_name: name, review_count, product_url, rating_text, reviews_url, price_text });
      if (items.length >= 50) break;
    }
  }

  return { title, active_category: categoryName, active_category_id: activeCategoryId, sidebar, items };
}