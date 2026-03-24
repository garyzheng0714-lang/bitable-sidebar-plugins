import { bitable } from '@lark-base-open/js-sdk';
import { ref, onMounted } from 'vue';

export const useTheme = () => {
  const theme = ref('');

  const setThemeColor = () => {
    const el = document.documentElement;
    const themeStyles = {
      LIGHT: {
        '--el-color-primary': 'rgb(20, 86, 240)',
        '--el-bg-color': '#fff',
        '--el-border-color-lighter': '#dee0e3',
      },
      DARK: {
        '--el-color-primary': '#4571e1',
        '--el-bg-color': '#252525',
        '--el-border-color-lighter': '#434343',
      },
    };
    const current = themeStyles[theme.value] || themeStyles.LIGHT;
    Object.entries(current).forEach(([prop, val]) => {
      el.style.setProperty(prop, val);
    });
  };

  onMounted(async () => {
    try {
      theme.value = await bitable.bridge.getTheme();
    } catch (_) { theme.value = 'LIGHT'; }
    setThemeColor();
  });

  bitable.bridge.onThemeChange((event) => {
    theme.value = event.data.theme;
    setThemeColor();
  });

  return { theme };
};