<!--
 * Word模板套版插件主应用
 * 支持模板管理、字段拖拽、渲染输出等功能
-->
<script setup>
  import { onMounted } from 'vue';
  import { Toaster } from 'vue-sonner';
  import { useTheme } from '@/composables/useTheme';
  import MainLayout from './components/MainLayout.vue';

  // 初始化主题
  const { theme } = useTheme();

  onMounted(() => {
    console.log('Word模板套版插件已启动');
  });
</script>

<template>
  <div id="app" class="docx-template-app">
    <!-- 全局消息提示 -->
    <Toaster
      position="top-center"
      richColors
      closeButton
      :duration="3000"
      :toastOptions="{
        style: { 
          width: 'auto', 
          maxWidth: '400px',
          margin: '0 auto',
          fontSize: '14px'
        },
      }"
    />

    <!-- 主布局 -->
    <MainLayout />
  </div>
</template>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Tahoma, 'PingFang SC', 'Microsoft Yahei', Arial, 'Hiragino Sans GB', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

.docx-template-app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color-lighter);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-text-color-secondary);
}

/* 响应式布局 */
@media (max-width: 480px) {
  .docx-template-app {
    font-size: 14px;
  }
}
</style>
