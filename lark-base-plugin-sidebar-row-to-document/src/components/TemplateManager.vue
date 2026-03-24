<template>
  <div class="template-manager">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称或说明..."
          clearable
          size="large"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <!-- 上传模板按钮移到搜索框旁边，二者始终同一行 -->
        <el-button type="primary" size="large" class="upload-btn" @click="$emit('upload')">
          <el-icon><Plus /></el-icon>
          上传模板
        </el-button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="template-list" v-loading="loading">
      <div class="list-header">
        <div class="list-actions">
          <el-button-group size="small" class="action-buttons">
            <el-button @click.stop="exportTemplates" text>
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click.stop="triggerImport" text>
              导入
            </el-button>
          </el-button-group>
          <!-- 筛选图标弹层保持不变 -->
          <el-popover placement="bottom-end" trigger="click" :width="320">
            <template #reference>
              <span class="filter-icon" title="筛选" role="button" aria-label="筛选">
                <el-icon><Filter /></el-icon>
              </span>
            </template>
            <div class="filter-content">
              <div class="filter-row">
                <span class="filter-label">标签筛选</span>
                <el-select
                  v-model="selectedTags"
                  placeholder="选择标签"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  clearable
                  class="tag-select"
                  size="small"
                >
                  <el-option
                    v-for="tag in allTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </div>
              <div class="filter-actions">
                <el-button size="small" @click="selectedTags = []">清空</el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <!-- 仅保留网格视图 -->
      <div class="grid-view">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          @click="openEditor(template)"
        >
          <div class="card-header">
            <div class="template-icon">
              <el-icon><Document /></el-icon>
            </div>
            
            <!-- 悬停显示的操作区：编辑、下载、删除 -->
            <div class="card-actions">
              <span class="icon-action" title="编辑" role="button" aria-label="编辑" @click.stop="editTemplate(template)">
                <el-icon><Edit /></el-icon>
              </span>
              <span class="icon-action" title="下载" role="button" aria-label="下载" @click.stop="downloadTemplate(template)">
                <el-icon><Download /></el-icon>
              </span>
              <span class="icon-action delete-action" title="删除" role="button" aria-label="删除" @click.stop="deleteTemplate(template)">
                <el-icon><Delete /></el-icon>
              </span>
            </div>
          </div>
          
          <div class="card-body">
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-description" v-if="template.notes">{{ template.notes }}</p>
            <div class="template-tags" v-if="template.tags && template.tags.length > 0">
              <el-tag 
                v-for="tag in (template.tags || []).slice(0, 3)" 
                :key="tag" 
                size="small" 
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="template-meta">
              <span class="version">v{{ template.version }}</span>
              <span class="update-time">{{ formatDate(template.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 移除列表视图 -->
    </div>

    <!-- 隐藏导入文件选择器 -->
    <input 
      ref="importInputRef" 
      type="file" 
      accept="application/json,.json" 
      style="display:none" 
      @change="handleImportFileChange" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Document,
  MoreFilled,
  Edit,
  CopyDocument,
  Download,
  Delete,
  Plus,
  Filter,
} from '@element-plus/icons-vue';
import { saveAs } from 'file-saver';
import { templateService } from '@/services/templateService';

// 定义事件
const emit = defineEmits(['select-template', 'edit-template', 'upload', 'open-editor']);

// 本地映射键（与编辑页保持一致）
const MAPPING_STORAGE_KEY = 'template_placeholder_mapping_v1';

// 响应式数据
const loading = ref(false);
const templates = ref([]);
const searchKeyword = ref('');
const selectedTags = ref([]);

// 计算属性
const allTags = computed(() => {
  // 依赖 templates，确保当模板集合变化时，标签选项会刷新
  const _ = templates.value.length;
  return templateService.getAllTags();
});

const filteredTemplates = computed(() => {
  // 依赖 templates，确保当模板集合变化时，筛选结果会刷新
  const _ = templates.value.length;
  return templateService.searchTemplates(searchKeyword.value, selectedTags.value);
});

// ... existing code ...

const loadTemplates = () => {
  loading.value = true;
  try {
    templates.value = templateService.getTemplates();
  } catch (error) {
    console.error('Failed to load templates:', error);
    ElMessage.error('加载模板列表失败');
  } finally {
    loading.value = false;
  }
};

const selectTemplate = (template) => {
  emit('select-template', template);
};

const openEditor = (template) => {
  emit('open-editor', template);
};

const editTemplate = (template) => {
  emit('edit-template', template);
};

const duplicateTemplate = async (template) => {
  try {
    const templateFile = await templateService.getTemplateFile(template.id);
    if (templateFile) {
      await templateService.uploadTemplate(
        templateFile,
        `${template.name} - 副本`,
        template.tags,
        template.notes
      );
      loadTemplates();
      ElMessage.success('模板复制成功');
    }
  } catch (error) {
    console.error('Failed to duplicate template:', error);
    ElMessage.error('模板复制失败');
  }
};

const downloadTemplate = async (template) => {
  try {
    const templateFile = await templateService.getTemplateFile(template.id);
    if (templateFile) {
      const url = URL.createObjectURL(templateFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success('模板下载成功');
    }
  } catch (error) {
    console.error('Failed to download template:', error);
    ElMessage.error('模板下载失败');
  }
};

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    templateService.deleteTemplate(template.id);
    loadTemplates();
    ElMessage.success('模板删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete template:', error);
      ElMessage.error('模板删除失败');
    }
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 监听模板上传事件
const handleTemplateUploaded = () => {
  loadTemplates();
};

// 组件挂载时加载模板
onMounted(() => {
  loadTemplates();
  // 监听全局上传事件
  window.addEventListener('template-uploaded', handleTemplateUploaded);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('template-uploaded', handleTemplateUploaded);
});

// 暴露刷新方法
defineExpose({
  refresh: loadTemplates
});

// 方法：导出/导入
const exportTemplates = () => {
  try {
    const blob = templateService.exportTemplatesBlob();
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `templates_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
    saveAs(blob, filename);
  } catch (e) {
    ElMessage.error('导出失败');
  }
};

const importInputRef = ref(null);
const triggerImport = () => {
  importInputRef.value && importInputRef.value.click();
};

const handleImportFileChange = async (e) => {
  const file = e.target?.files?.[0];
  if (!file) return;
  
  console.log('开始导入文件:', file.name);
  
  try {
    const text = await file.text();
    console.log('文件内容读取成功，长度:', text.length);
    
    const { imported, skipped } = templateService.importTemplatesFromJSON(text);
    console.log('导入结果:', { imported, skipped });
    
    ElMessage.success(`导入成功 ${imported} 个，跳过 ${skipped} 个`);
    
    // 刷新列表
    loadTemplates();
  } catch (error) {
    console.error('Import failed:', error);
    ElMessage.error(error?.message || '导入失败');
  } finally {
    // 允许连续选择同一个文件
    e.target.value = '';
  }
};
</script>

<style scoped>
.template-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-section { margin-bottom: 16px; }

/* 顶部搜索与上传：一行，绝不换行 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap; /* 关键：不换行 */
}
.search-input {
  flex: 1 1 auto; /* 关键：可缩放 */
  min-width: 0;   /* 允许在窄屏时收缩 */
}
.upload-btn { white-space: nowrap; }

/* 标签筛选单独一行 */
.search-extra { margin-top: 10px; }
.tag-select { width: 360px; max-width: 100%; }

.template-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 12px; /* 列表区域左右留白，增强"呼吸感" */
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: none; /* 去除横线 */
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons { margin-right: 4px; }

.result-info {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px; /* 留白更充足 */
  overflow-y: auto;
  padding: 8px 0;
}

.template-card {
  position: relative;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 10px; /* 轻微圆角 */
  padding: 14px; /* 更舒适的留白 */
  background: #fff; /* 纯白背景 */
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04); /* 浅阴影 */
}
.template-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08); /* 悬停更柔和的提升感 */
}

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.template-icon { width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--el-fill-color-lighter); color: var(--el-text-color-secondary); }

/* 右上角操作：默认隐藏，悬停显示 */
.card-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; opacity: 0; pointer-events: none; transition: opacity .15s ease; }
.template-card:hover .card-actions { opacity: 1; pointer-events: auto; }
.icon-action { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; color: var(--el-text-color-secondary); background: transparent; transition: color .15s ease, background-color .15s ease; }
.icon-action:hover { background: var(--el-fill-color-lighter); color: var(--el-color-primary); }
.icon-action.delete-action:hover { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }

.card-body { flex: 1; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.template-name { font-size: 15px; font-weight: 600; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--el-text-color-primary); }
.template-description { font-size: 12px; color: var(--el-text-color-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.template-tags { display: flex; gap: 6px; flex-wrap: wrap; max-height: 28px; overflow: hidden; }

.card-footer { border-top: none; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; }
.template-meta { display: flex; gap: 10px; color: var(--el-text-color-secondary); font-size: 12px; }
.version { background-color: var(--el-fill-color-light); padding: 2px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.list-view { display: none; }
.template-table { height: 100%; }

.template-info { display: flex; align-items: center; gap: 8px; }
.template-info .template-icon { font-size: 16px; color: var(--el-color-primary); }
.template-info .template-name { font-weight: 500; margin-bottom: 2px; }
.template-info .template-description { font-size: 12px; color: var(--el-text-color-secondary); margin: 0; }

.no-tags { color: var(--el-text-color-placeholder); font-size: 12px; }

.empty-state { flex: 1; display: flex; align-items: center; justify-content: center; }

/* 预览对话框样式 */
.preview-container { max-height: 70vh; overflow: auto; background: var(--el-fill-color-light); padding: 12px; border-radius: 6px; }
.preview-html :deep(p) { margin: 8px 0; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; }
.primary-download-btn { height: 40px; }

/* 响应式：保持搜索+上传始终同一行 */
@media (max-width: 768px) {
  .search-section { margin-bottom: 12px; }
  .search-bar { gap: 8px; }
  .search-input { min-width: 0; }
  .tag-select { width: 100%; }
  .grid-view { grid-template-columns: 1fr; gap: 12px; }
  .list-header { flex-direction: column; align-items: stretch; gap: 8px; }
  .action-buttons { justify-content: center; }
}

@media (max-width: 480px) {
  .upload-btn { height: 36px; padding: 0 12px; }
  .search-bar { gap: 6px; }
  .search-input { font-size: 14px; }
  .tag-select { font-size: 14px; }
  .grid-view { gap: 8px; padding: 4px 0; }
  .template-card { padding: 12px; border-radius: 6px; }
  .template-name { font-size: 14px; }
  .template-description { font-size: 12px; -webkit-line-clamp: 2; }
  .list-header { gap: 6px; }
  .result-info { font-size: 12px; }
  .primary-download-btn { height: 36px; }
}

@media (max-width: 400px) {
  .search-input { font-size: 13px; }
  .tag-select { font-size: 13px; }
  .template-card { padding: 8px; }
  .card-header { margin-bottom: 8px; }
  .card-body { margin-bottom: 8px; }
  .template-name { font-size: 13px; }
  .template-description { font-size: 11px; }
  .template-tags .el-tag { font-size: 10px; padding: 1px 4px; }
  .action-buttons .el-button { padding: 2px 6px; font-size: 11px; }
}
/* 新增：筛选弹层样式（轻量） */
.filter-icon { display: inline-flex; align-items: center; padding: 6px; cursor: pointer; color: var(--el-text-color-secondary); }
.filter-icon:hover { color: var(--el-color-primary); }
.filter-content { display: flex; flex-direction: column; gap: 8px; }
.filter-row { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: var(--el-text-color-secondary); }
.filter-content .tag-select { width: 100%; }

/* 保留其余样式不变 */
</style>
