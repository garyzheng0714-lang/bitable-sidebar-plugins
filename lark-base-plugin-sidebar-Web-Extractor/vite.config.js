/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-06-21 11:48
 * @LastAuthor : Wang Chao
 * @LastTime   : 2025-02-25 17:23
 * @desc       :
 */

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { URL as NodeURL } from 'node:url';
import { parse as parseUrl } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: true,
    hmr: true, //启动热更新，就是更改了代码自动刷新页面
    // open: true, //代表vite项目在启动时自动打开浏览器
    proxy: {
      '/api': {
        target: 'https://open.feishu.cn',
        //你的需要请求的服务器地址
        changeOrigin: true, // 允许跨域
        secure: false, //忽略安全证书
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径把路径变成空字符,
      },
    },
  },
  plugins: [
    vue(),
    {
      name: 'dev-proxy-fetch',
      configureServer(server) {
        server.middlewares.use('/proxy-fetch', async (req, res) => {
          try {
            const parsed = parseUrl(req.url || '', true);
            const target = parsed.query?.url;
            const al = parsed.query?.al || 'en-US,en;q=0.9';
            if (!target || typeof target !== 'string') {
              res.statusCode = 400;
              res.end('Missing url');
              return;
            }
            let targetUrl = target;
            try { targetUrl = new NodeURL(target).toString(); } catch (_) {}
            const resp = await fetch(targetUrl, {
              headers: {
                'accept-language': String(al),
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
                'referer': (() => { try { return new NodeURL(targetUrl).origin; } catch (_) { return undefined; } })(),
                'upgrade-insecure-requests': '1',
              },
            });
            const text = await resp.text();
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(text);
          } catch (e) {
            res.statusCode = 500;
            res.end(String(e?.message || e || 'Proxy error'));
          }
        });

        // 浏览器渲染端点，解决 Access Denied 等反爬阻断
        server.middlewares.use('/render-title', async (req, res) => {
          const parsed = parseUrl(req.url || '', true);
          const target = parsed.query?.url;
          const al = String(parsed.query?.al || 'en-US');
          if (!target || typeof target !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Missing url' }));
            return;
          }
          let chromium;
          try {
            const pw = await import('playwright');
            chromium = pw.chromium || (pw.default && pw.default.chromium);
          } catch (e) {
            res.statusCode = 501;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Playwright not installed', message: String(e?.message || e) }));
            return;
          }
          if (!chromium) {
            res.statusCode = 501;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Playwright chromium unavailable' }));
            return;
          }
          const timeoutMs = 25000;
          let browser;
          try {
            browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
            const primaryLang = (al.split(',')[0] || 'en-US').trim();
            const tz = primaryLang.startsWith('ko') ? 'Asia/Seoul' : (primaryLang.startsWith('ja') ? 'Asia/Tokyo' : 'UTC');
            const context = await browser.newContext({
              locale: primaryLang,
              timezoneId: tz,
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
              extraHTTPHeaders: {
                'Accept-Language': al,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1',
              },
            });
            const page = await context.newPage();
            await page.goto(String(target), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
            try { await page.waitForLoadState('networkidle', { timeout: 12000 }); } catch (_) {}
            const title = await page.evaluate(() => {
              function pickOg() {
                const m = document.querySelector('meta[property="og:title"], meta[name="og:title"], meta[name="twitter:title"]');
                return (m?.getAttribute('content') || '').trim();
              }
              function pickJsonLd() {
                const lds = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                for (const s of lds) {
                  try {
                    const j = JSON.parse(s.textContent || '{}');
                    const name = (j && typeof j === 'object') ? (j.name || j.headline || '') : '';
                    if (name && String(name).trim()) return String(name).trim();
                  } catch (e) {}
                }
                return '';
              }
              function deepFind() {
                const q = ['title','ogTitle','seoTitle','pageTitle','h1','name'];
                const scripts = Array.from(document.querySelectorAll('script'));
                for (const s of scripts) {
                  const txt = s.textContent || '';
                  if (!txt || txt.length < 80) continue;
                  try {
                    const m = txt.match(/\{[\s\S]*\}/);
                    if (!m) continue;
                    const j = JSON.parse(m[0]);
                    const stack = [j];
                    while (stack.length) {
                      const cur = stack.pop();
                      if (!cur || typeof cur !== 'object') continue;
                      for (const k of Object.keys(cur)) {
                        const v = cur[k];
                        if (q.includes(k) && typeof v === 'string' && v.trim()) return v.trim();
                        if (v && typeof v === 'object') stack.push(v);
                      }
                    }
                  } catch (e) {}
                }
                return '';
              }
              const t = (document.title || '').trim();
              const h1 = (document.querySelector('h1')?.textContent || '').trim();
              return t || pickOg() || h1 || pickJsonLd() || deepFind() || '';
            });
            await context.close();
            await browser.close();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ title: String(title || '') }));
          } catch (e) {
            try { if (browser) await browser.close(); } catch (_) {}
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Render error', message: String(e?.message || e) }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
