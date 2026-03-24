<template>
  <div class="main-layout">
    <!-- 顶部品牌横幅：横向铺满，可点击跳转 -->
    <div class="brand-banner">
      <a
        href="https://ark-auto-2103212774-cn-beijing-default.tos-cn-beijing.volces.com/assistant_image/%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE/FBIF%20%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE.jpeg"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="品牌横幅"
      >
        <img
          class="brand-banner-img"
          src="https://ark-auto-2103212774-cn-beijing-default.tos-cn-beijing.volces.com/assistant_image/%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE/FBIF%20%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE.jpeg"
          alt="品牌横幅"
        />
      </a>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="content-header">
        <!-- 已移除面包屑与“模板管理”文字 -->

        <!-- 顶部导航（模块切换）已移除 -->

        <div class="header-actions">
          <!-- 添加测试按钮 -->
          <el-button text size="small" @click="activeMenu = 'test'">
            <el-icon><Setting /></el-icon>
            功能测试
          </el-button>
        </div>
      </div>

      <div class="content-body">
        <!-- 模板管理页面（一级默认展示） -->
        <TemplateManager v-if="activeMenu === 'templates'" 
                         @select-template="openEditor"
                         @edit-template="openEditor"
                         @open-editor="openEditor"
                         @upload="showUploadDialog = true"/>
        
        <!-- 可视化编辑器页面 -->
        <VisualEditor v-else-if="activeMenu === 'editor'" 
                      :template-id="selectedTemplateId"
                      @back="backToTemplates" />
        
        <!-- 测试页面 -->
        <TestPage v-else-if="activeMenu === 'test'" />
        
        <!-- 模板编辑页面（保留原有功能） -->
        <TemplateEditor v-else-if="activeMenu === 'legacy-editor'" @back="activeMenu = 'templates'" />
        
        <!-- 默认页面 -->
        <div v-else class="welcome-page">
          <div class="welcome-content">
            <h2>欢迎使用Word模板编辑器</h2>
            <p>这是一个多维表格的Word模板编辑插件，支持：</p>
            <ul>
              <li>📄 模板管理和上传</li>
              <li>✏️ Word风格的可视化编辑</li>
              <li>🔗 字段拖拽插入动态变量</li>
              <li>📤 导出为图片和PDF</li>
            </ul>
            
            <div class="welcome-actions">
              <el-button type="primary" size="large" @click="activeMenu = 'templates'">
                <el-icon><Document /></el-icon>
                开始使用
              </el-button>
              
              <!-- 演示模板创建 -->
              <DemoTemplate @open-editor="openEditor" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传模板对话框：接收新模板并自动跳转编辑 -->
    <UploadDialog v-model="showUploadDialog" @uploaded="handleTemplateUploaded" />
    
    <!-- 调试面板 -->
    <DebugPanel />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { 
  Document, 
  Folder, 
  EditPen, 
  Download, 
  Plus,
  Setting
} from '@element-plus/icons-vue';

// 导入组件
import TemplateManager from './TemplateManager.vue';
import TemplateEditor from './TemplateEditor.vue';
import VisualEditor from './VisualEditor.vue';
import TestPage from './TestPage.vue';
import DemoTemplate from './DemoTemplate.vue';
import UploadDialog from './UploadDialog.vue';
import DebugPanel from './DebugPanel.vue';

// 响应式数据
const activeMenu = ref('templates');
const showUploadDialog = ref(false);
const selectedTemplateId = ref(null);

onMounted(() => {
  // 侧边栏已视觉移除，无需自适应逻辑
});

onUnmounted(() => {
  // no-op
});

// 已移除 currentPageTitle，避免出现“模板管理”文字

// 打开编辑器并选中模板（来自模板管理页的点击）
const openEditor = (template) => {
  if (!template) return;
  selectedTemplateId.value = template.id;
  activeMenu.value = 'editor';
};

// 返回模板库
const backToTemplates = () => {
  selectedTemplateId.value = null;
  activeMenu.value = 'templates';
};

// 调整：拿到新模板对象，并自动跳到编辑器并选中它
const handleTemplateUploaded = (createdTemplate) => {
  showUploadDialog.value = false;
  // 触发模板列表刷新
  const templateManager = document.querySelector('.template-manager');
  if (templateManager && templateManager.__vueParentComponent) {
    templateManager.__vueParentComponent.exposed?.refresh?.();
  }
  // 同时用事件总线同步给编辑器刷新列表
  window.dispatchEvent(new CustomEvent('template-uploaded'));

  // 自动跳转编辑页并选中刚上传的模板
  if (createdTemplate?.id) {
    selectedTemplateId.value = createdTemplate.id;
    activeMenu.value = 'editor';
  }
};
</script>

<style scoped>
/* Base开放设计规范 - 统一样式变量（保留原有变量） */
:root {
  --base-border-radius: 6px;
  --base-border-radius-small: 4px;
  --base-spacing-xs: 4px;
  --base-spacing-sm: 8px;
  --base-spacing-md: 12px;
  --base-spacing-lg: 16px;
  --base-spacing-xl: 24px;
  --base-font-size-xs: 11px;
  --base-font-size-sm: 12px;
  --base-font-size-md: 14px;
  --base-font-size-lg: 16px;
  --base-shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --base-shadow-medium: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, Tahoma, PingFang SC, Microsoft Yahei, Arial, Hiragino Sans GB, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
}

/* 侧边栏视觉移除，确保不占空间 */
.sidebar { display: none !important; width: 0 !important; }

/* 顶部品牌横幅 */
.brand-banner {
  width: 100%;
  background: var(--el-bg-color-page);
  border-bottom: none; /* 去掉横线，实现与正文无缝衔接 */
}
.brand-banner-img {
  display: block;
  width: 100%;
  max-height: 72px; /* 调高，避免图片被盖住 */
  object-fit: cover;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 8px 16px; /* 紧凑化 */
  border-bottom: none; /* 去掉横线，与banner无缝衔接 */
  display: grid;
  grid-template-columns: 1fr auto; /* 面包屑 | 操作 */
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--el-bg-color);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: saturate(180%) blur(12px);
}

.header-actions { display: flex; gap: 8px; }
.header-actions .el-button { height: 32px; padding: 0 10px; font-size: 12px; }

@media (max-width: 768px) {
  .content-header { padding: 6px 10px; gap: 6px; grid-template-columns: 1fr auto; }
}

@media (max-width: 480px) {
  .content-header { padding: 6px 8px; gap: 6px; grid-template-columns: 1fr auto; }
}
.breadcrumb { flex: 1; min-width: 160px; }

.content-body {
  flex: 1;
  padding: 24px 32px; /* 增加左右留白，提升“呼吸感” */
  overflow: auto;
  background-color: var(--el-fill-color-lighter);
}

.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-content h2 {
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.welcome-content ul {
  text-align: left;
  margin: 20px 0;
  padding-left: 20px;
}

.welcome-content li {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

.welcome-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb { display: none; }
}

@media (max-width: 480px) {
  .header-actions { gap: 8px; }
  .header-actions .el-button { padding: 6px 10px; font-size: 12px; }
}
</style>