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
import { bitable } from '@lark-base-open/js-sdk';

export const i18n = createI18n({
  locale: 'en',
  allowComposition: true, // 占位符支持
  messages: {
    en: en,
    zh: zh,
  },
});

bitable.bridge.getLanguage().then((lang) => {
  i18n.global.locale = lang;
});
