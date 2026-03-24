/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-25 20:55
 * @LastAuthor : itchaox
 * @LastTime   : 2024-01-20 16:44
 * @desc       :
 */
import { createApp } from 'vue';
import App from './App.vue';
import 'element-plus/dist/index.css';
import './assets/main.css';

import { i18n } from './locales/i18n.js';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';

const app = createApp(App);

app.use(ElementPlus);
app.use(i18n); // 注入国际化函数$t

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
