/*
 * @Version    : v1.00
 * @Author     : Wang Chao
 * @Date       : 2025-02-21 13:57
 * @LastAuthor : Wang Chao
 * @LastTime   : 2025-02-23 16:35
 * @desc       : 国际化文案
 */

import { createI18n } from 'vue-i18n';
import en from './en.json';
import zh from './zh.json';
import ja from './ja.json';
import { bitable } from '@lark-base-open/js-sdk';

export const i18n = createI18n({
  locale: 'zh',
  allowComposition: true, // 占位符支持
  messages: {
    en: en,
    zh: zh,
    ja: ja,
  },
});

bitable.bridge.getLanguage().then((lang) => {
  // 仅当宿主语言为中文时，保持中文；否则仍使用中文
  const isZh = lang === 'zh' || lang === 'zh-HK' || lang === 'zh-TW';
  if (isZh) {
    i18n.global.locale = 'zh';
  } else {
    i18n.global.locale = 'zh';
  }
});
