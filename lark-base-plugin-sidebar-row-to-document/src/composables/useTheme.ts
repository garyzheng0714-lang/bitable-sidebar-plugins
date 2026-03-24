import { ref, onMounted } from 'vue';
import { bitable } from '@lark-base-open/js-sdk';
import type { ThemeMode } from '@/types';

export const useTheme = () => {
  const theme = ref<ThemeMode>('LIGHT');

  const setThemeColor = () => {
    const el = document.documentElement;

    // 处理主要样式
    const themeStyles = {
      LIGHT: {
        '--el-color-primary': 'rgb(20, 86, 240)',
        '--el-bg-color': '#fff',
        '--el-border-color-lighter': '#dee0e3',
        '--el-text-color-primary': '#303133',
        '--el-text-color-regular': '#606266',
        '--el-text-color-secondary': '#909399',
        '--el-fill-color-light': '#f5f7fa',
        '--el-fill-color-lighter': '#fafafa',
      },
      DARK: {
        '--el-color-primary': '#4571e1',
        '--el-bg-color': '#252525',
        '--el-border-color-lighter': '#434343',
        '--el-text-color-primary': '#e5eaf3',
        '--el-text-color-regular': '#cfd3dc',
        '--el-text-color-secondary': '#a3a6ad',
        '--el-fill-color-light': '#363637',
        '--el-fill-color-lighter': '#2b2b2c',
      },
    };

    const currentThemeStyles = themeStyles[theme.value];

    // 设置样式变量
    Object.entries(currentThemeStyles).forEach(([property, value]) => {
      el.style.setProperty(property, value);
    });
  };

  // 挂载时处理
  onMounted(async () => {
    try {
      theme.value = await bitable.bridge.getTheme();
      setThemeColor();
    } catch (error) {
      console.warn('Failed to get theme:', error);
      theme.value = 'LIGHT';
      setThemeColor();
    }
  });

  // 主题修改时处理
  try {
    bitable.bridge.onThemeChange((event) => {
      theme.value = event.data.theme;
      setThemeColor();
    });
  } catch (error) {
    console.warn('Failed to listen theme change:', error);
  }

  // 抛出当前主题变量
  return {
    theme,
    setThemeColor,
  };
};