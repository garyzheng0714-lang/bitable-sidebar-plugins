/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-06-21 11:48
 * @LastAuthor : Wang Chao
 * @LastTime   : 2025-02-25 17:23
 * @desc       : 链接转附件插件配置
 */

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: true,
    hmr: true, // 启动热更新
    proxy: {
      '/api': {
        target: 'https://open.feishu.cn',
        changeOrigin: true, // 允许跨域
        secure: false, // 忽略安全证书
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
      },
    },
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd']
        }
      }
    }
  }
});
