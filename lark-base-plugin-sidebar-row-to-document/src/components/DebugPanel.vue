<template>
  <div class="debug-panel">
    <!-- 调试面板切换按钮 -->
    <el-button 
      class="debug-toggle-btn"
      type="info"
      size="small"
      circle
      @click="togglePanel"
      title="调试面板"
    >
      <el-icon><Tools /></el-icon>
    </el-button>

    <!-- 调试面板主体 -->
    <el-drawer
      v-model="panelVisible"
      title="调试面板"
      direction="rtl"
      size="600px"
      class="debug-drawer"
    >
      <template #header>
        <div class="debug-header">
          <div class="debug-title">
            <el-icon><Tools /></el-icon>
            <span>调试面板</span>
          </div>
          <div class="debug-controls">
            <el-switch
              v-model="debugLogger.isEnabled.value"
              @change="debugLogger.toggleLogging"
              active-text="启用"
              inactive-text="禁用"
              size="small"
            />
          </div>
        </div>
      </template>

      <!-- 日志摘要 -->
      <div class="debug-summary">
        <h4>日志摘要</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">总计:</span>
            <span class="value">{{ logSummary.total }}</span>
          </div>
          <div class="summary-item">
            <span class="label">点击:</span>
            <span class="value click">{{ logSummary.clicks }}</span>
          </div>
          <div class="summary-item">
            <span class="label">操作:</span>
            <span class="value action">{{ logSummary.actions }}</span>
          </div>
          <div class="summary-item">
            <span class="label">错误:</span>
            <span class="value error">{{ logSummary.errors }}</span>
          </div>
          <div class="summary-item">
            <span class="label">状态:</span>
            <span class="value state">{{ logSummary.states }}</span>
          </div>
          <div class="summary-item">
            <span class="label">API:</span>
            <span class="value api">{{ logSummary.apis }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="debug-actions">
        <el-button-group size="small">
          <el-button @click="debugLogger.clearLogs" type="warning">
            <el-icon><Delete /></el-icon>
            清空日志
          </el-button>
          <el-button @click="debugLogger.exportLogs" type="primary">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
          <el-button @click="copyLogsToClipboard" type="success">
            <el-icon><CopyDocument /></el-icon>
            复制日志
          </el-button>
        </el-button-group>
      </div>

      <!-- 日志过滤 -->
      <div class="debug-filters">
        <el-select
          v-model="selectedLogType"
          placeholder="过滤日志类型"
          size="small"
          clearable
          style="width: 150px"
        >
          <el-option label="全部" value="" />
          <el-option label="点击" value="click" />
          <el-option label="操作" value="action" />
          <el-option label="错误" value="error" />
          <el-option label="状态" value="state" />
          <el-option label="API" value="api" />
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志内容"
          size="small"
          clearable
          style="width: 200px; margin-left: 10px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 日志列表 -->
      <div class="debug-logs">
        <div class="logs-container">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            :class="['log-entry', `log-${log.type}`]"
          >
            <div class="log-header">
              <span class="log-time">{{ log.timestamp }}</span>
              <span :class="['log-type', `type-${log.type}`]">{{ log.type.toUpperCase() }}</span>
              <span class="log-category">{{ log.category }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.element" class="log-element">
              <el-icon><Pointer /></el-icon>
              元素: {{ log.element }}
            </div>
            <div v-if="log.data" class="log-data">
              <el-collapse size="small">
                <el-collapse-item title="查看数据" :name="log.id">
                  <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="filteredLogs.length === 0" description="暂无日志记录" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Tools,
  Delete,
  Download,
  CopyDocument,
  Search,
  Pointer
} from '@element-plus/icons-vue';
import { debugLogger } from '@/composables/useDebugLogger';

// 响应式数据
const panelVisible = ref(false);
const selectedLogType = ref('');
const searchKeyword = ref('');

// 计算属性
const logSummary = computed(() => debugLogger.getLogSummary());

const filteredLogs = computed(() => {
  let logs = debugLogger.logs.value;
  
  // 按类型过滤
  if (selectedLogType.value) {
    logs = logs.filter(log => log.type === selectedLogType.value);
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(keyword) ||
      log.category.toLowerCase().includes(keyword) ||
      (log.element && log.element.toLowerCase().includes(keyword))
    );
  }
  
  return logs;
});

// 方法
const togglePanel = () => {
  panelVisible.value = !panelVisible.value;
  debugLogger.logClick('调试面板切换按钮', { visible: panelVisible.value });
};

const copyLogsToClipboard = async () => {
  try {
    const formattedLogs = debugLogger.getFormattedLogs();
    await navigator.clipboard.writeText(formattedLogs);
    ElMessage.success('日志已复制到剪贴板');
    debugLogger.logAction('复制日志到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
    debugLogger.logError('复制日志失败', error);
  }
};

// 生命周期
onMounted(() => {
  debugLogger.logAction('调试面板组件已挂载');
});
</script>

<style scoped>
.debug-panel {
  position: relative;
}

.debug-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.debug-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.debug-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.debug-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.debug-summary h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #e0e0e0;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
}

.summary-item .value {
  font-weight: 600;
  font-size: 14px;
}

.value.click { color: #409EFF; }
.value.action { color: #67C23A; }
.value.error { color: #F56C6C; }
.value.state { color: #E6A23C; }
.value.api { color: #909399; }

.debug-actions {
  margin-bottom: 16px;
}

.debug-filters {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.debug-logs {
  flex: 1;
  overflow: hidden;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #e0e0e0;
  background: #fafafa;
}

.log-entry.log-click { border-left-color: #409EFF; }
.log-entry.log-action { border-left-color: #67C23A; }
.log-entry.log-error { border-left-color: #F56C6C; }
.log-entry.log-state { border-left-color: #E6A23C; }
.log-entry.log-api { border-left-color: #909399; }

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.log-time {
  font-size: 11px;
  color: #999;
  font-family: monospace;
}

.log-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  color: white;
}

.type-click { background: #409EFF; }
.type-action { background: #67C23A; }
.type-error { background: #F56C6C; }
.type-state { background: #E6A23C; }
.type-api { background: #909399; }

.log-category {
  font-size: 11px;
  color: #666;
  background: #e0e0e0;
  padding: 2px 6px;
  border-radius: 3px;
}

.log-message {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.log-element {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}

.log-data {
  margin-top: 8px;
}

.log-data pre {
  font-size: 11px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.debug-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.debug-drawer .el-drawer__body) {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
}
</style>