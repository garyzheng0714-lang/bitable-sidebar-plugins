import { ref, onMounted } from 'vue';
import { bitable } from '@lark-base-open/js-sdk';

export const useTheme = () => {
  const theme = ref('');

  const setThemeColor = () => {
    const el = document.documentElement;

    // Define theme styles
    const themeStyles = {
      LIGHT: {
        '--el-color-primary': 'rgb(20, 86, 240)',
        '--el-bg-color': '#ffffff',
        '--el-bg-color-page': '#f5f6f7',
        '--el-text-color-primary': '#1f2329',
        '--el-text-color-regular': '#646a73',
        '--el-text-color-secondary': '#8f959e',
        '--el-border-color-lighter': '#dee0e3',
        '--el-card-bg-color': '#ffffff',
      },
      DARK: {
        '--el-color-primary': '#4571e1',
        '--el-bg-color': '#1f1f1f',
        '--el-bg-color-page': '#121212',
        '--el-text-color-primary': '#eff0f1',
        '--el-text-color-regular': '#a6a6a6',
        '--el-text-color-secondary': '#8f959e', // Adjust if needed
        '--el-border-color-lighter': '#434343',
        '--el-card-bg-color': '#1f1f1f',
      },
    };

    // Default to LIGHT if theme value is unexpected
    const currentTheme = theme.value === 'DARK' ? 'DARK' : 'LIGHT';
    const currentThemeStyles = themeStyles[currentTheme];

    // Set CSS variables
    Object.entries(currentThemeStyles).forEach(([property, value]) => {
      el.style.setProperty(property, value);
    });
  };

  // On mount, get initial theme
  onMounted(async () => {
    try {
      theme.value = await bitable.bridge.getTheme();
      setThemeColor();
    } catch (e) {
      console.warn('Failed to get theme, defaulting to LIGHT', e);
      theme.value = 'LIGHT';
      setThemeColor();
    }
  });

  // Listen for theme changes
  bitable.bridge.onThemeChange((event) => {
    theme.value = event.data.theme;
    setThemeColor();
  });

  return {
    theme
  };
};
