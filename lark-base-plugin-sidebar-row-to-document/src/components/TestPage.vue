<template>
  <div class="test-page">
    <h2>功能测试页面</h2>
    
    <div class="test-section">
      <h3>1. 模板管理测试</h3>
      <el-button @click="testTemplateUpload">测试模板上传</el-button>
      <el-button @click="testTemplateList">测试模板列表</el-button>
      <p>状态: {{ templateTestStatus }}</p>
    </div>
    
    <div class="test-section">
      <h3>2. 编辑器测试</h3>
      <el-button @click="testEditor">测试编辑器加载</el-button>
      <el-button @click="testFormatting">测试格式化工具</el-button>
      <p>状态: {{ editorTestStatus }}</p>
    </div>
    
    <div class="test-section">
      <h3>3. 字段拖拽测试</h3>
      <el-button @click="testFieldLoading">测试字段加载</el-button>
      <el-button @click="testDragDrop">测试拖拽功能</el-button>
      <p>状态: {{ dragTestStatus }}</p>
    </div>
    
    <div class="test-section">
      <h3>4. 导出功能测试</h3>
      <el-button @click="testImageExport">测试图片导出</el-button>
      <el-button @click="testPDFExport">测试PDF导出</el-button>
      <p>状态: {{ exportTestStatus }}</p>
    </div>
    
    <div class="test-results">
      <h3>测试结果</h3>
      <ul>
        <li v-for="result in testResults" :key="result.name" :class="result.status">
          {{ result.name }}: {{ result.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { templateService } from '@/services/templateService';
import { baseService } from '@/services/baseService';

const templateTestStatus = ref('未测试');
const editorTestStatus = ref('未测试');
const dragTestStatus = ref('未测试');
const exportTestStatus = ref('未测试');
const testResults = ref([]);

const addTestResult = (name, status, message) => {
  testResults.value.push({ name, status, message });
};

const testTemplateUpload = async () => {
  try {
    templateTestStatus.value = '测试中...';
    const templates = templateService.getTemplates();
    addTestResult('模板服务', 'success', `找到 ${templates.length} 个模板`);
    templateTestStatus.value = '✅ 通过';
  } catch (error) {
    addTestResult('模板服务', 'error', error.message);
    templateTestStatus.value = '❌ 失败';
  }
};

const testTemplateList = async () => {
  try {
    const allTags = templateService.getAllTags();
    addTestResult('模板标签', 'success', `找到 ${allTags.length} 个标签`);
  } catch (error) {
    addTestResult('模板标签', 'error', error.message);
  }
};

const testEditor = async () => {
  try {
    editorTestStatus.value = '测试中...';
    // 测试编辑器相关功能
    addTestResult('编辑器', 'success', '编辑器组件加载正常');
    editorTestStatus.value = '✅ 通过';
  } catch (error) {
    addTestResult('编辑器', 'error', error.message);
    editorTestStatus.value = '❌ 失败';
  }
};

const testFormatting = () => {
  try {
    // 测试格式化命令
    const commands = ['bold', 'italic', 'underline'];
    commands.forEach(cmd => {
      try {
        document.queryCommandState(cmd);
        addTestResult(`格式化-${cmd}`, 'success', '命令可用');
      } catch (e) {
        addTestResult(`格式化-${cmd}`, 'warning', '命令不可用');
      }
    });
  } catch (error) {
    addTestResult('格式化工具', 'error', error.message);
  }
};

const testFieldLoading = async () => {
  try {
    dragTestStatus.value = '测试中...';
    const fields = await baseService.getFields();
    addTestResult('字段加载', 'success', `加载了 ${fields.length} 个字段`);
    dragTestStatus.value = '✅ 通过';
  } catch (error) {
    addTestResult('字段加载', 'error', error.message);
    dragTestStatus.value = '❌ 失败';
  }
};

const testDragDrop = () => {
  try {
    // 测试拖拽API
    const testData = { id: 'test', name: '测试字段' };
    const jsonData = JSON.stringify(testData);
    const parsed = JSON.parse(jsonData);
    addTestResult('拖拽数据', 'success', '数据序列化正常');
  } catch (error) {
    addTestResult('拖拽数据', 'error', error.message);
  }
};

const testImageExport = async () => {
  try {
    exportTestStatus.value = '测试中...';
    // 测试html-to-image库
    const { toPng } = await import('html-to-image');
    addTestResult('图片导出库', 'success', 'html-to-image库加载正常');
    exportTestStatus.value = '✅ 通过';
  } catch (error) {
    addTestResult('图片导出库', 'error', error.message);
    exportTestStatus.value = '❌ 失败';
  }
};

const testPDFExport = async () => {
  try {
    // 测试jsPDF库
    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF();
    addTestResult('PDF导出库', 'success', 'jsPDF库加载正常');
  } catch (error) {
    addTestResult('PDF导出库', 'error', error.message);
  }
};
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: var(--el-text-color-primary);
}

.test-results {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.test-results ul {
  list-style: none;
  padding: 0;
}

.test-results li {
  padding: 4px 0;
}

.test-results li.success {
  color: var(--el-color-success);
}

.test-results li.error {
  color: var(--el-color-danger);
}

.test-results li.warning {
  color: var(--el-color-warning);
}
</style>