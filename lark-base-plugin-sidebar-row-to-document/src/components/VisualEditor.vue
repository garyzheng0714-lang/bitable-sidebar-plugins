<template>
  <div class="visual-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button text @click="$emit('back')" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回模板库
        </el-button>
        <el-divider direction="vertical" />
        <span class="template-name">{{ currentTemplate?.name || '未选择模板' }}</span>
      </div>
      
      <div class="header-right">
        <!-- 导出功能下拉菜单 -->
        <el-dropdown @command="handleExportCommand" :disabled="isExporting">
          <el-button type="primary" size="small" :loading="isExporting" :disabled="isExporting">
            <el-icon><Download /></el-icon>
            导出文档
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="image">
                <el-icon><Camera /></el-icon>
                导出为图片
              </el-dropdown-item>
              <el-dropdown-item command="pdf">
                <el-icon><Document /></el-icon>
                导出为PDF
              </el-dropdown-item>
              <el-dropdown-item command="word">
                <el-icon><EditPen /></el-icon>
                导出为Word
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 全屏编辑按钮 -->
        <el-button @click="toggleFullscreen" size="small" :type="isFullscreen ? 'primary' : 'default'" title="全屏编辑">
          <el-icon><FullScreen v-if="!isFullscreen" /><Aim v-else /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 左侧字段面板 -->
      <div class="fields-sidebar" :class="{ collapsed: fieldsPanelCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-title" v-if="!fieldsPanelCollapsed">
            <el-icon><Grid /></el-icon>
            <span>字段列表</span>
          </div>
          <el-button 
            text 
            size="small" 
            @click="fieldsPanelCollapsed = !fieldsPanelCollapsed"
            class="collapse-btn"
          >
            <el-icon><ArrowLeft v-if="!fieldsPanelCollapsed" /><ArrowRight v-else /></el-icon>
          </el-button>
        </div>
        
        <div class="sidebar-content" v-if="!fieldsPanelCollapsed">
          <!-- 记录选择器 -->
          <div class="record-selector-box">
            <div class="selector-label">
              <el-icon><User /></el-icon>
              <span>选择记录</span>
            </div>
            <el-select
              v-model="selectedRecordId"
              @change="handleRecordChange"
              placeholder="选择要预览的记录"
              size="small"
              class="record-select"
            >
              <el-option
                v-for="record in availableRecords"
                :key="record.recordId"
                :label="getRecordDisplayName(record)"
                :value="record.recordId"
                :title="getRecordDisplayName(record)"
              />
            </el-select>
          </div>
          
          <!-- 搜索框 -->
          <div class="field-search-box">
            <el-input
              v-model="fieldSearchKeyword"
              placeholder="搜索字段"
              size="small"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 字段列表 -->
          <div class="field-list">
            <div
              v-for="field in filteredFields"
              :key="field.id"
              class="field-list-item"
            >
              <div class="field-item-icon">
                <FieldIcon :field-type="field.type" />
              </div>
              <div class="field-item-content">
                <div class="field-item-name">{{ field.name }}</div>
                <div class="field-item-type">{{ getFieldTypeName(field.type) }}</div>
                <div class="field-item-value" v-if="currentRecord">{{ getFieldValue(field.id, field.name) }}</div>
              </div>
              <div class="field-item-actions">
                <el-button 
                  text 
                  size="small" 
                  @click="copyFieldVariable(field)"
                  class="copy-btn"
                  title="复制字段变量"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑器区域 -->
      <div class="editor-content-area">
        <!-- 编辑器工具栏 - 精简版Word风格 -->
        <div class="content-toolbar">
          <div class="toolbar-left">
            <!-- 页面模式切换 -->
            <el-button-group size="small" class="page-mode-group">
              <el-button @click="togglePageMode" :type="isPaginated ? 'primary' : 'default'" title="分页模式">
                <el-icon><Document /></el-icon>
                {{ isPaginated ? '分页' : '整页' }}
              </el-button>
            </el-button-group>
            
            <!-- 文本格式化 -->
            <el-button-group size="small" class="format-group">
              <el-button @click="formatText('bold')" :class="{ active: isFormatActive('bold') }" title="加粗 (Ctrl+B)" class="word-style-btn">
                <strong style="font-family: 'Calibri', sans-serif; font-size: 14px;">B</strong>
              </el-button>
              <el-button @click="formatText('italic')" :class="{ active: isFormatActive('italic') }" title="斜体 (Ctrl+I)" class="word-style-btn">
                <em style="font-family: 'Calibri', sans-serif; font-size: 14px;">I</em>
              </el-button>
              <el-button @click="formatText('underline')" :class="{ active: isFormatActive('underline') }" title="下划线 (Ctrl+U)" class="word-style-btn">
                <u style="font-family: 'Calibri', sans-serif; font-size: 14px;">U</u>
              </el-button>
            </el-button-group>
            
            <!-- 字体和字号 -->
            <el-select v-model="currentFontFamily" @change="changeFontFamily" size="small" class="font-select">
              <el-option label="Calibri" value="Calibri" />
              <el-option label="Arial" value="Arial" />
              <el-option label="Times New Roman" value="Times New Roman" />
              <el-option label="宋体" value="SimSun" />
              <el-option label="微软雅黑" value="Microsoft YaHei" />
            </el-select>
            
            <el-select v-model="currentFontSize" @change="changeFontSize" size="small" class="font-size-select">
              <el-option label="8" value="8pt" />
              <el-option label="9" value="9pt" />
              <el-option label="10" value="10pt" />
              <el-option label="11" value="11pt" />
              <el-option label="12" value="12pt" />
              <el-option label="14" value="14pt" />
              <el-option label="16" value="16pt" />
              <el-option label="18" value="18pt" />
              <el-option label="20" value="20pt" />
              <el-option label="24" value="24pt" />
            </el-select>
            
            <!-- 字体颜色和荧光笔 -->
            <el-button-group size="small" class="color-group">
              <el-popover placement="bottom" trigger="click" width="240">
                <template #reference>
                  <el-button class="word-style-btn" title="字体颜色">
                    <span style="color: red;">A</span>
                  </el-button>
                </template>
                <el-color-picker v-model="currentTextColor" @change="changeTextColor" />
              </el-popover>
              
              <el-popover placement="bottom" trigger="click" width="240">
                <template #reference>
                  <el-button class="word-style-btn" title="荧光笔">
                    <span style="background: yellow; padding: 0 2px;">H</span>
                  </el-button>
                </template>
                <el-color-picker v-model="currentHighlightColor" @change="changeHighlightColor" />
              </el-popover>
            </el-button-group>
            
            <!-- 页面缩放控制 -->
            <el-button-group size="small" class="zoom-group">
              <el-button @click="zoomOut" title="缩小" class="word-style-btn">
                <span style="font-size: 12px;">-</span>
              </el-button>
              <el-button disabled class="zoom-display">
                {{ Math.round(zoomLevel * 100) }}%
              </el-button>
              <el-button @click="zoomIn" title="放大" class="word-style-btn">
                <span style="font-size: 12px;">+</span>
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 编辑器主体 -->
        <div class="editor-body" v-loading="loading">
          <div
            ref="editorRef"
            class="table-like-editor"
            contenteditable="true"
            @input="handleEditorInput"
            @click="handleEditorClick"
            v-html="editorContent"
          ></div>
        </div>
      </div>
    </div>

    <!-- 字段选择对话框 -->
    <el-dialog
      v-model="fieldSelectDialogVisible"
      title="选择字段"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="field-select-content">
        <el-input
          v-model="fieldSelectKeyword"
          placeholder="搜索字段..."
          clearable
          class="field-select-search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <div class="field-select-list">
          <div
            v-for="field in filteredFieldsForSelect"
            :key="field.id"
            class="field-select-item"
            @click="selectField(field)"
          >
            <div class="field-select-icon">
              <FieldIcon :field-type="field.type" />
            </div>
            <div class="field-select-info">
              <div class="field-select-name">{{ field.name }}</div>
              <div class="field-select-type">{{ getFieldTypeName(field.type) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="fieldSelectDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Camera,
  Document,
  Search,
  Grid,
  CopyDocument,
  List,
  Rank,
  Right,
  Back,
  Minus,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  Aim,
  Download,
  EditPen,
  User
} from '@element-plus/icons-vue';
import FieldIcon from './FieldIcon.vue';
import { templateService } from '@/services/templateService';
import { baseService } from '@/services/baseService';
import { debugLogger } from '@/composables/useDebugLogger';

// Props
const props = defineProps({
  templateId: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['back']);

// 响应式数据
const loading = ref(false);
const isExporting = ref(false); // 统一的导出状态
const fieldsPanelCollapsed = ref(false);
const fieldSearchKeyword = ref('');
const fieldSelectKeyword = ref('');
const fieldSelectDialogVisible = ref(false);
const isFullscreen = ref(false);
const zoomLevel = ref(1.0); // 页面缩放级别
const isPaginated = ref(false); // 分页模式
const currentFontFamily = ref('Calibri'); // 当前字体
const currentFontSize = ref('11pt'); // 当前字号
const currentTextColor = ref('#000000'); // 当前字体颜色
const currentHighlightColor = ref('#FFFF00'); // 当前荧光笔颜色

const currentTemplate = ref(null);
const fields = ref([]);
const editorContent = ref('');
const editorRef = ref(null);
const availableRecords = ref([]); // 可选择的记录列表
const selectedRecordId = ref(null); // 当前选中的记录ID
const currentRecord = ref(null); // 当前记录数据，用于实时预览

// 编辑器状态
const currentClickedPlaceholder = ref(null);

// 移除字数统计相关状态
// const wordCount = ref(0);

// 计算属性
const filteredFields = computed(() => {
  if (!fieldSearchKeyword.value) return fields.value;
  const keyword = fieldSearchKeyword.value.toLowerCase();
  return fields.value.filter(field => 
    field.name.toLowerCase().includes(keyword) ||
    getFieldTypeName(field.type).toLowerCase().includes(keyword)
  );
});

const filteredFieldsForSelect = computed(() => {
  if (!fieldSelectKeyword.value) return fields.value;
  const keyword = fieldSelectKeyword.value.toLowerCase();
  return fields.value.filter(field => 
    field.name.toLowerCase().includes(keyword) ||
    getFieldTypeName(field.type).toLowerCase().includes(keyword)
  );
});

// 方法
const loadTemplate = async (templateId) => {
  if (!templateId) return;
  
  try {
    loading.value = true;
    currentTemplate.value = templateService.getTemplate(templateId);
    
    if (currentTemplate.value) {
      // 尝试读取真实的Word文档内容
      try {
        const templateFile = await templateService.getTemplateFile(templateId);
        if (templateFile) {
          // 使用mammoth库将Word文档转换为HTML，保留所有格式
          const mammoth = await import('mammoth');
          const arrayBuffer = await templateFile.arrayBuffer();
          const result = await mammoth.convertToHtml({ 
            arrayBuffer,
            styleMap: [
              // 保留Word中的所有样式映射
              "p[style-name='Normal'] => p:fresh",
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh", 
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "p[style-name='Heading 5'] => h5:fresh",
              "p[style-name='Heading 6'] => h6:fresh",
              "r[style-name='Strong'] => strong:fresh",
              "r[style-name='Emphasis'] => em:fresh",
              "table => table.word-table:fresh",
              // 保留所有字体颜色和背景色
              "r => span:fresh",
              "p => p:fresh"
            ],
            // 保留所有内联样式
            includeDefaultStyleMap: true,
            // 转换嵌入的图片
            convertImage: mammoth.images.imgElement(function(image) {
              return image.read("base64").then(function(imageBuffer) {
                return {
                  src: "data:" + image.contentType + ";base64," + imageBuffer
                };
              });
            })
          });
          
          // 处理转换后的HTML内容，保留所有格式
          let htmlContent = result.value || '';
          
          // 将{{}}格式转换为可点击的占位符，但保留原有格式
          htmlContent = htmlContent.replace(/\{\{([^}]+)\}\}/g, (match, fieldName) => {
            return `<span class="placeholder-token" data-placeholder="${fieldName.trim()}">${match}</span>`;
          });
          
          // 如果文档内容为空，使用默认模板
          if (!htmlContent.trim()) {
            htmlContent = `
              <h1 style="text-align: center;">${currentTemplate.value.name}</h1>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff;">
                <p style="margin: 0; color: #666; font-style: italic;">
                  这是模板 "${currentTemplate.value.name}" 的编辑区域。点击橙色的占位符可以选择具体字段，或从左侧复制字段变量。
                </p>
              </div>
              <p>请在此处开始编辑您的文档内容...</p>
              <p>您可以使用工具栏进行格式化，插入表格等元素。</p>
              <br>
              <p><strong>示例占位符（点击可选择字段）：</strong></p>
              <ul>
                <li>客户姓名：<span class="placeholder-token" data-placeholder="客户姓名">{{客户姓名}}</span></li>
                <li>联系电话：<span class="placeholder-token" data-placeholder="联系电话">{{联系电话}}</span></li>
                <li>地址信息：<span class="placeholder-token" data-placeholder="地址">{{地址}}</span></li>
              </ul>
            `;
          }
          
          editorContent.value = htmlContent;
          console.log('模板内容加载成功，保留所有Word格式:', htmlContent.substring(0, 200) + '...');
        } else {
          throw new Error('无法获取模板文件');
        }
      } catch (docError) {
        console.error('读取Word文档失败:', docError);
        // 降级到默认模板
        editorContent.value = `
          <h1 style="text-align: center;">${currentTemplate.value.name}</h1>
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-style: italic;">
              ⚠️ 无法读取原始Word文档内容，显示默认模板。请检查文档格式是否正确。
            </p>
          </div>
          <p>请在此处开始编辑您的文档内容...</p>
          <p>您可以使用工具栏进行格式化，插入表格等元素。</p>
          <br>
          <p><strong>示例占位符（点击可选择字段）：</strong></p>
          <ul>
            <li>客户姓名：<span class="placeholder-token" data-placeholder="客户姓名">{{客户姓名}}</span></li>
            <li>联系电话：<span class="placeholder-token" data-placeholder="联系电话">{{联系电话}}</span></li>
            <li>地址信息：<span class="placeholder-token" data-placeholder="地址">{{地址}}</span></li>
          </ul>
        `;
      }
    }
  } catch (error) {
    console.error('Failed to load template:', error);
    ElMessage.error('加载模板失败');
  } finally {
    loading.value = false;
  }
};

const loadFields = async () => {
  try {
    fields.value = await baseService.getFields();
    // 同时加载所有记录用于选择
    await loadAvailableRecords();
  } catch (error) {
    console.error('Failed to load fields:', error);
    fields.value = [];
  }
};

// 加载可选择的记录列表
const loadAvailableRecords = async () => {
  try {
    const records = await baseService.getRecords(undefined, undefined, 50); // 最多加载50条记录
    availableRecords.value = records || [];
    
    // 如果有记录，默认选择第一条
    if (availableRecords.value.length > 0) {
      selectedRecordId.value = availableRecords.value[0].recordId;
      currentRecord.value = availableRecords.value[0];
    } else {
      // 如果没有记录，创建示例数据
      const sampleData = { 
        recordId: 'sample',
        fields: {} 
      };
      fields.value.forEach(field => {
        sampleData.fields[field.id] = `示例${field.name}`;
      });
      availableRecords.value = [sampleData];
      selectedRecordId.value = 'sample';
      currentRecord.value = sampleData;
    }
  } catch (error) {
    console.error('Failed to load available records:', error);
    // 创建示例数据作为降级方案
    const sampleData = { 
      recordId: 'sample',
      fields: {} 
    };
    fields.value.forEach(field => {
      sampleData.fields[field.id] = `示例${field.name}`;
    });
    availableRecords.value = [sampleData];
    selectedRecordId.value = 'sample';
    currentRecord.value = sampleData;
  }
};

// 处理记录选择变化
const handleRecordChange = (recordId) => {
  debugLogger.logClick('记录选择器', { recordId, previousRecord: selectedRecordId.value });
  
  selectedRecordId.value = recordId;
  const selectedRecord = availableRecords.value.find(r => r.recordId === recordId);
  if (selectedRecord) {
    currentRecord.value = selectedRecord;
    // 更新所有变量的显示值
    updateAllVariableValues();
    ElMessage.success(`已切换到记录：${recordId}`);
    debugLogger.logState('记录切换成功', { recordId, recordData: selectedRecord });
  } else {
    debugLogger.logError('记录切换失败', { recordId, availableRecords: availableRecords.value.length });
  }
};

// 获取记录的显示名称
const getRecordDisplayName = (record) => {
  if (!record || !record.fields) return record?.recordId || '未知记录';
  
  // 尝试找到第一个文本字段作为显示名称
  const textField = fields.value.find(f => f.type === '1'); // 文本字段
  if (textField && record.fields[textField.id]) {
    const value = record.fields[textField.id];
    const displayValue = typeof value === 'string' ? value : String(value);
    return displayValue.length > 20 ? displayValue.substring(0, 20) + '...' : displayValue;
  }
  
  // 如果没有文本字段，使用记录ID
  return record.recordId || '未知记录';
};

// 根据字段ID获取实际值
const getFieldValue = (fieldId, fieldName) => {
  if (!currentRecord.value || !currentRecord.value.fields) {
    return `示例${fieldName}`;
  }
  
  const value = currentRecord.value.fields[fieldId];
  if (value === null || value === undefined) {
    return `示例${fieldName}`;
  }
  
  // 调试输出
  console.log(`字段 ${fieldName} (${fieldId}) 的原始值:`, value, typeof value);
  
  // 根据字段类型格式化值
  const field = fields.value.find(f => f.id === fieldId);
  if (!field) {
    // 如果是对象，尝试提取有用信息
    if (typeof value === 'object' && value !== null) {
      if (value.text) return String(value.text);
      if (value.name) return String(value.name);
      if (value.value) return String(value.value);
      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'object' && v !== null) {
            return v.text || v.name || v.value || String(v);
          }
          return String(v);
        }).join(', ');
      }
      return JSON.stringify(value);
    }
    return String(value);
  }
  
  switch (field.type) {
    case '1': // 文本
      return String(value);
    case '2': // 数字
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    case '3': // 单选
      if (typeof value === 'object' && value !== null) {
        return value.text || value.name || String(value);
      }
      return String(value);
    case '4': // 多选
      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'object' && v !== null) {
            return v.text || v.name || String(v);
          }
          return String(v);
        }).join(', ');
      }
      return String(value);
    case '5': // 日期
      if (typeof value === 'number') {
        return new Date(value).toLocaleDateString('zh-CN');
      }
      return value ? new Date(value).toLocaleDateString('zh-CN') : '';
    case '7': // 复选框
      return value ? '是' : '否';
    case '11': // 人员
      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'object' && v !== null) {
            return v.name || v.text || String(v);
          }
          return String(v);
        }).join(', ');
      }
      if (typeof value === 'object' && value !== null) {
        return value.name || value.text || String(value);
      }
      return String(value);
    case '17': // 附件
      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'object' && v !== null) {
            return v.name || v.filename || String(v);
          }
          return String(v);
        }).join(', ');
      }
      if (typeof value === 'object' && value !== null) {
        return value.name || value.filename || String(value);
      }
      return String(value);
    default:
      // 对于未知类型，尝试智能解析
      if (typeof value === 'object' && value !== null) {
        if (value.text) return String(value.text);
        if (value.name) return String(value.name);
        if (value.value) return String(value.value);
        if (Array.isArray(value)) {
          return value.map(v => {
            if (typeof v === 'object' && v !== null) {
              return v.text || v.name || v.value || String(v);
            }
            return String(v);
          }).join(', ');
        }
        return JSON.stringify(value);
      }
      return String(value);
  }
};

const getFieldTypeName = (type) => {
  const typeMap = {
    '1': '文本',
    '2': '数字',
    '3': '单选',
    '4': '多选',
    '5': '日期',
    '7': '复选框',
    '11': '人员',
    '13': '电话',
    '15': '链接',
    '17': '附件'
  };
  return typeMap[type] || '未知';
};

// 复制字段变量
const copyFieldVariable = async (field) => {
  debugLogger.logClick('复制字段变量按钮', { fieldId: field.id, fieldName: field.name });
  
  try {
    const variableText = `{{${field.name}}}`;
    await navigator.clipboard.writeText(variableText);
    ElMessage.success(`已复制字段变量：${variableText}`);
    debugLogger.logAction('复制字段变量成功', { fieldId: field.id, fieldName: field.name, variableText });
  } catch (error) {
    debugLogger.logError('复制字段变量失败，使用降级方案', { error, fieldId: field.id });
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = `{{${field.name}}}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    ElMessage.success(`已复制字段变量：{{${field.name}}}`);
    debugLogger.logAction('降级方案复制成功', { fieldId: field.id, fieldName: field.name });
  }
};

// 选择字段 - 参考电子合同平台的交互方式
const selectField = (field) => {
  debugLogger.logClick('字段选择', { fieldId: field.id, fieldName: field.name, fieldType: field.type });
  
  if (!currentClickedPlaceholder.value) {
    debugLogger.logError('选择字段失败', { reason: '没有点击的占位符', field });
    return;
  }
  
  // 获取字段的实际值
  const fieldValue = getFieldValue(field.id, field.name);
  debugLogger.logState('获取字段值', { fieldId: field.id, fieldName: field.name, fieldValue, recordId: selectedRecordId.value });
  
  // 安全地创建新的变量元素，防止XSS攻击
  const newElement = document.createElement('span');
  newElement.className = 'var-token';
  newElement.setAttribute('data-field-id', field.id);
  newElement.setAttribute('data-field-name', field.name);
  newElement.title = `字段：${field.name}，值：${fieldValue}`;
  newElement.textContent = fieldValue; // 使用textContent而不是innerHTML防止XSS
  
  currentClickedPlaceholder.value.parentNode.replaceChild(newElement, currentClickedPlaceholder.value);
  
  ElMessage.success(`已选择字段：${field.name}，当前值：${fieldValue}`);
  debugLogger.logAction('字段绑定成功', { fieldId: field.id, fieldName: field.name, fieldValue });
  
  // 关闭对话框并重置状态
  fieldSelectDialogVisible.value = false;
  currentClickedPlaceholder.value = null;
  
  // 触发编辑器内容更新，确保所有变量都显示最新值
  updateAllVariableValues();
};

// 更新所有变量的显示值
const updateAllVariableValues = () => {
  if (!editorRef.value) return;
  
  const varTokens = editorRef.value.querySelectorAll('.var-token');
  varTokens.forEach(token => {
    const fieldId = token.getAttribute('data-field-id');
    const fieldName = token.getAttribute('data-field-name');
    
    if (fieldId && fieldName) {
      const fieldValue = getFieldValue(fieldId, fieldName);
      token.textContent = fieldValue;
      token.title = `字段：${fieldName}，值：${fieldValue}`;
    }
  });
};

// 处理编辑器点击 - 支持变量的重新选择
const handleEditorClick = (event) => {
  const target = event.target;
  debugLogger.logClick('编辑器区域', { 
    tagName: target.tagName, 
    className: target.className, 
    textContent: target.textContent?.substring(0, 50) 
  });
  
  // 检查是否点击了占位符
  if (target.classList.contains('placeholder-token')) {
    currentClickedPlaceholder.value = target;
    fieldSelectKeyword.value = '';
    fieldSelectDialogVisible.value = true;
    debugLogger.logAction('点击占位符', { 
      placeholder: target.getAttribute('data-placeholder'),
      textContent: target.textContent 
    });
  }
  
  // 检查是否点击了已绑定的变量（支持重新选择）
  if (target.classList.contains('var-token')) {
    currentClickedPlaceholder.value = target;
    fieldSelectKeyword.value = '';
    fieldSelectDialogVisible.value = true;
    debugLogger.logAction('点击已绑定变量', { 
      fieldId: target.getAttribute('data-field-id'),
      fieldName: target.getAttribute('data-field-name'),
      currentValue: target.textContent 
    });
  }
};

// 格式化工具 - 增强功能
const formatText = (command) => {
  try {
    document.execCommand(command, false, null);
    editorRef.value?.focus();
  } catch (error) {
    console.warn('Format command failed:', command, error);
  }
};

const isFormatActive = (command) => {
  try {
    return document.queryCommandState(command);
  } catch (error) {
    return false;
  }
};

// 列表插入功能
const insertList = (listType) => {
  try {
    document.execCommand(listType, false, null);
    editorRef.value?.focus();
  } catch (error) {
    console.warn('List command failed:', listType, error);
  }
};

// 插入分割线
const insertHorizontalRule = () => {
  try {
    document.execCommand('insertHorizontalRule', false, null);
    editorRef.value?.focus();
  } catch (error) {
    // 降级方案：手动插入HR元素
    const hrHtml = '<hr style="margin: 16px 0; border: none; border-top: 1px solid #e0e0e0;">';
    insertHtmlAtCursor(hrHtml);
  }
};

const insertTable = () => {
  const tableHtml = `
    <table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e0e0e0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left; font-weight: 600;">列标题1</th>
          <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left; font-weight: 600;">列标题2</th>
          <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left; font-weight: 600;">列标题3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格1</td>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格2</td>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格3</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格4</td>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格5</td>
          <td style="padding: 12px; border: 1px solid #e0e0e0;">单元格6</td>
        </tr>
      </tbody>
    </table>
  `;
  insertHtmlAtCursor(tableHtml);
};

const insertHtmlAtCursor = (html) => {
  if (!editorRef.value) return;
  
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    
    if (editorRef.value.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      range.insertNode(fragment);
      
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  // 移除字数统计更新调用
};

// 编辑器事件
const handleEditorInput = () => {
  // 移除字数统计更新，简化逻辑
};

// 移除字数统计相关方法
// const updateWordCount = () => {
//   if (editorRef.value) {
//     const text = editorRef.value.innerText || '';
//     wordCount.value = text.trim().length;
//   }
// };

// 统一的导出处理函数
const handleExportCommand = (command) => {
  switch (command) {
    case 'image':
      exportAsImage();
      break;
    case 'pdf':
      exportAsPDF();
      break;
    case 'word':
      exportAsWord();
      break;
    default:
      ElMessage.warning('未知的导出类型');
  }
};

// 优化的图片导出功能 - 支持完整内容和长图
const exportAsImage = async () => {
  try {
    isExporting.value = true;
    
    if (!editorRef.value) {
      throw new Error('编辑器未初始化');
    }

    // 获取编辑器的实际内容区域
    const editorElement = editorRef.value;
    
    // 临时移除滚动条和其他UI元素的影响
    const originalOverflow = editorElement.style.overflow;
    const originalHeight = editorElement.style.height;
    const originalMaxHeight = editorElement.style.maxHeight;
    
    // 设置为完整显示内容
    editorElement.style.overflow = 'visible';
    editorElement.style.height = 'auto';
    editorElement.style.maxHeight = 'none';
    
    // 等待DOM更新
    await nextTick();
    
    // 获取实际内容尺寸
    const rect = editorElement.getBoundingClientRect();
    const scrollHeight = editorElement.scrollHeight;
    const scrollWidth = editorElement.scrollWidth;
    
    // 使用实际内容尺寸进行截图
    const dataUrl = await toPng(editorElement, {
      backgroundColor: '#ffffff',
      width: Math.max(scrollWidth, 794), // 最小A4宽度
      height: scrollHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        overflow: 'visible',
        // 隐藏可能的滚动条
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      },
      // 过滤掉滚动条等UI元素
      filter: (node) => {
        // 排除滚动条、光标等元素
        if (node.classList && (
          node.classList.contains('el-scrollbar') ||
          node.classList.contains('cursor') ||
          node.classList.contains('selection')
        )) {
          return false;
        }
        return true;
      }
    });
    
    // 恢复原始样式
    editorElement.style.overflow = originalOverflow;
    editorElement.style.height = originalHeight;
    editorElement.style.maxHeight = originalMaxHeight;
    
    // 下载图片
    const link = document.createElement('a');
    link.download = `${currentTemplate.value?.name || '文档'}_完整版_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    ElMessage.success('完整图片导出成功');
  } catch (error) {
    console.error('Export image error:', error);
    ElMessage.error('导出图片失败');
  } finally {
    isExporting.value = false;
  }
};

const exportAsPDF = async () => {
  try {
    isExporting.value = true;
    
    if (!editorRef.value) {
      throw new Error('编辑器未初始化');
    }
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 使用优化的图片导出逻辑获取完整内容
    const editorElement = editorRef.value;
    const originalOverflow = editorElement.style.overflow;
    const originalHeight = editorElement.style.height;
    const originalMaxHeight = editorElement.style.maxHeight;
    
    editorElement.style.overflow = 'visible';
    editorElement.style.height = 'auto';
    editorElement.style.maxHeight = 'none';
    
    await nextTick();
    
    const scrollHeight = editorElement.scrollHeight;
    const scrollWidth = editorElement.scrollWidth;
    
    const dataUrl = await toPng(editorElement, {
      backgroundColor: '#ffffff',
      width: Math.max(scrollWidth, 794),
      height: scrollHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        overflow: 'visible'
      }
    });
    
    // 恢复样式
    editorElement.style.overflow = originalOverflow;
    editorElement.style.height = originalHeight;
    editorElement.style.maxHeight = originalMaxHeight;
    
    // 计算图片在PDF中的尺寸
    const imgWidth = pageWidth - 20;
    const imgHeight = (imgWidth * scrollHeight) / Math.max(scrollWidth, 794);
    
    // 如果内容超过一页，分页处理
    if (imgHeight > pageHeight - 20) {
      const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 20));
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) pdf.addPage();
        
        const yOffset = -i * (pageHeight - 20) * (Math.max(scrollWidth, 794) / imgWidth);
        pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST', 0, yOffset);
      }
    } else {
      pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
    }
    
    pdf.save(`${currentTemplate.value?.name || '文档'}_${Date.now()}.pdf`);
    
    ElMessage.success('PDF导出成功');
  } catch (error) {
    console.error('Export PDF error:', error);
    ElMessage.error('导出PDF失败');
  } finally {
    isExporting.value = false;
  }
};

// 新增Word导出功能
const exportAsWord = async () => {
  try {
    isExporting.value = true;
    
    if (!currentTemplate.value) {
      ElMessage.warning('请先选择模板');
      return;
    }
    
    // 获取模板文件
    const templateFile = await templateService.getTemplateFile(currentTemplate.value.id);
    if (!templateFile) {
      ElMessage.error('无法获取模板文件');
      return;
    }
    
    // 创建下载链接
    const url = URL.createObjectURL(templateFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate.value.name}_${Date.now()}.docx`;
    link.click();
    
    // 清理URL对象
    URL.revokeObjectURL(url);
    
    ElMessage.success('Word文档导出成功');
  } catch (error) {
    console.error('Export Word error:', error);
    ElMessage.error('导出Word失败');
  } finally {
    isExporting.value = false;
  }
};

// 分页模式切换
const togglePageMode = () => {
  isPaginated.value = !isPaginated.value;
  applyPageMode();
};

const applyPageMode = () => {
  if (!editorRef.value) return;
  
  const editor = editorRef.value;
  if (isPaginated.value) {
    // 分页模式：按A4纸大小分割
    editor.style.minHeight = '1123px'; // A4高度
    editor.style.pageBreakInside = 'avoid';
    editor.style.overflow = 'visible';
    // 添加分页样式
    editor.classList.add('paginated-mode');
  } else {
    // 整页模式：连续显示
    editor.style.minHeight = 'auto';
    editor.style.pageBreakInside = 'auto';
    editor.style.overflow = 'auto';
    editor.classList.remove('paginated-mode');
  }
};

// 字体相关功能
const changeFontFamily = (fontFamily) => {
  try {
    document.execCommand('fontName', false, fontFamily);
    editorRef.value?.focus();
  } catch (error) {
    console.warn('Font family command failed:', error);
  }
};

const changeFontSize = (fontSize) => {
  try {
    // 将pt转换为px进行设置
    const pxSize = parseInt(fontSize) * 1.33; // 1pt ≈ 1.33px
    document.execCommand('fontSize', false, '7'); // 先设置一个临时大小
    
    // 然后通过CSS设置实际大小
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        // 如果没有选中文本，设置当前位置的字号
        const span = document.createElement('span');
        span.style.fontSize = fontSize;
        range.insertNode(span);
        range.setStart(span, 0);
        range.setEnd(span, 0);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // 如果有选中文本，应用字号
        const contents = range.extractContents();
        const span = document.createElement('span');
        span.style.fontSize = fontSize;
        span.appendChild(contents);
        range.insertNode(span);
      }
    }
    editorRef.value?.focus();
  } catch (error) {
    console.warn('Font size command failed:', error);
  }
};

const changeTextColor = (color) => {
  try {
    document.execCommand('foreColor', false, color);
    editorRef.value?.focus();
  } catch (error) {
    console.warn('Text color command failed:', error);
  }
};

const changeHighlightColor = (color) => {
  try {
    document.execCommand('backColor', false, color);
    editorRef.value?.focus();
  } catch (error) {
    console.warn('Highlight color command failed:', error);
  }
};

// 页面缩放功能
const zoomIn = () => {
  if (zoomLevel.value < 2.0) {
    zoomLevel.value = Math.min(2.0, zoomLevel.value + 0.1);
    applyZoom();
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1);
    applyZoom();
  }
};

const applyZoom = () => {
  if (editorRef.value) {
    editorRef.value.style.transform = `scale(${zoomLevel.value})`;
    editorRef.value.style.transformOrigin = 'top center';
    // 调整容器高度以适应缩放
    const container = editorRef.value.parentElement;
    if (container) {
      container.style.height = `${1123 * zoomLevel.value}px`;
    }
  }
};

// 全屏编辑功能
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  if (isFullscreen.value) {
    // 进入全屏模式
    document.documentElement.requestFullscreen?.() || 
    document.documentElement.webkitRequestFullscreen?.() ||
    document.documentElement.mozRequestFullScreen?.();
  } else {
    // 退出全屏模式
    document.exitFullscreen?.() ||
    document.webkitExitFullscreen?.() ||
    document.mozCancelFullScreen?.();
  }
};

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );
  isFullscreen.value = isCurrentlyFullscreen;
};

// 生命周期
onMounted(async () => {
  debugLogger.logAction('VisualEditor组件挂载开始');
  
  await loadFields();
  if (props.templateId) {
    await loadTemplate(props.templateId);
    debugLogger.logState('模板加载完成', { templateId: props.templateId });
  }
  
  // 应用初始缩放和分页模式
  nextTick(() => {
    applyZoom();
    applyPageMode();
    debugLogger.logState('初始化完成', { zoomLevel: zoomLevel.value, isPaginated: isPaginated.value });
  });
  
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  
  // 启动全局监听并监听表格切换事件
  baseService.startGlobalListening();
  
  // 监听表格切换事件，同步刷新字段列表
  window.addEventListener('table-changed', handleTableChange);
  window.addEventListener('field-changed', handleFieldChange);
  window.addEventListener('view-changed', handleViewChange);
  
  debugLogger.logAction('VisualEditor组件挂载完成', { 
    fieldsCount: fields.value.length,
    recordsCount: availableRecords.value.length,
    selectedRecordId: selectedRecordId.value
  });
});

onUnmounted(() => {
  // 清理全屏事件监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  
  // 清理表格切换监听
  window.removeEventListener('table-changed', handleTableChange);
  window.removeEventListener('field-changed', handleFieldChange);
  window.removeEventListener('view-changed', handleViewChange);
});

// 表格切换时同步刷新字段列表
const handleTableChange = async () => {
  try {
    await loadFields();
    // 更新所有变量的显示值
    updateAllVariableValues();
    ElMessage.success('字段列表已更新');
  } catch (error) {
    console.error('Failed to refresh fields on table change:', error);
    ElMessage.error('字段列表更新失败');
  }
};

// 字段变化时刷新字段列表
const handleFieldChange = async () => {
  try {
    await loadFields();
    // 更新所有变量的显示值
    updateAllVariableValues();
    console.log('Fields refreshed due to field change');
  } catch (error) {
    console.error('Failed to refresh fields on field change:', error);
  }
};

// 视图变化时刷新字段列表
const handleViewChange = async () => {
  try {
    await loadFields();
    // 更新所有变量的显示值
    updateAllVariableValues();
    console.log('Fields refreshed due to view change');
  } catch (error) {
    console.error('Failed to refresh fields on view change:', error);
  }
};

// 暴露方法
defineExpose({
  loadTemplate,
  getContent: () => editorRef.value?.innerHTML || '',
  getEditor: () => editorRef.value
});
</script>

<style scoped>
.visual-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  color: #666;
}

.template-name {
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  gap: 8px;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧字段面板 */
.fields-sidebar {
  width: 240px;
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.fields-sidebar.collapsed {
  width: 48px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  min-height: 48px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.collapse-btn {
  padding: 4px;
  color: #666;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 记录选择器样式 */
.record-selector-box {
  padding: 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 8px;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.record-select {
  width: 100%;
}

.field-search-box {
  padding: 12px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.field-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.field-list-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  margin-bottom: 2px;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.field-list-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
}

.field-item-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}

.field-item-content {
  flex: 1;
  min-width: 0;
}

.field-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.field-item-type {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.field-item-value {
  font-size: 12px;
  color: #1890ff;
  background: #f0f8ff;
  padding: 2px 6px;
  border-radius: 3px;
  word-break: break-all;
  max-height: 40px;
  overflow: hidden;
  line-height: 1.3;
}

.field-item-actions {
  flex-shrink: 0;
}

.copy-btn {
  color: #666;
  padding: 4px;
}

.copy-btn:hover {
  color: #1890ff;
}

/* 右侧编辑器区域 */
.editor-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  min-width: 0;
}

/* 工具栏样式优化 - Word风格 */
.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 16px;
  background: #f1f1f1;
  border-bottom: 1px solid #d1d1d1;
  flex-shrink: 0;
  gap: 8px;
  flex-wrap: wrap;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Word风格按钮组样式 */
.page-mode-group,
.format-group,
.color-group,
.zoom-group {
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #ababab;
  background: #ffffff;
}

.font-select,
.font-size-select {
  width: 120px;
  margin: 0 4px;
}

.font-size-select {
  width: 60px;
}

.word-style-btn {
  border-radius: 0 !important;
  border: none !important;
  border-right: 1px solid #d1d1d1 !important;
  background: #ffffff !important;
  color: #444444 !important;
  padding: 4px 8px !important;
  min-width: 24px !important;
  height: 24px !important;
  font-size: 11px !important;
  transition: all 0.1s ease !important;
}

.word-style-btn:hover {
  background: #e5f3ff !important;
  border-color: #0078d4 !important;
}

.word-style-btn.active {
  background: #0078d4 !important;
  color: #ffffff !important;
  border-color: #0078d4 !important;
}

.word-style-btn:last-child {
  border-right: none !important;
}

.zoom-display {
  background: #f8f8f8 !important;
  color: #666666 !important;
  font-size: 10px !important;
  min-width: 40px !important;
  cursor: default !important;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.word-count-display {
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.editor-body {
  flex: 1;
  position: relative;
  padding: 0;
  background-color: #f5f5f5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-like-editor {
  flex: 1;
  width: 100%;
  min-height: 100%;
  padding: 32px 48px;
  background-color: #fff;
  border: none;
  border-radius: 0;
  outline: none;
  line-height: 1.15;
  font-size: 11pt;
  color: #000;
  font-family: 'Calibri', 'Times New Roman', serif;
  overflow-y: auto;
  box-shadow: none;
  resize: none;
  /* Word文档样式对齐 */
  page-break-inside: avoid;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* A4纸张比例模拟 */
  max-width: 794px;
  margin: 0 auto;
  min-height: 1123px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.table-like-editor:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* 占位符样式 */
:deep(.placeholder-token) {
  background: #fff2e8 !important;
  border: 1px solid #ffbb96 !important;
  padding: 2px 8px !important;
  border-radius: 4px !important;
  color: #d4380d !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  display: inline-block !important;
  margin: 0 2px !important;
  font-size: 13px !important;
  transition: all 0.2s ease !important;
}

:deep(.placeholder-token:hover) {
  background: #ffe7ba !important;
  border-color: #ff9c6e !important;
  transform: scale(1.05) !important;
}

/* 字段变量样式 - 电子合同平台风格 */
:deep(.var-token) {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%) !important;
  border: 1px solid #40a9ff !important;
  padding: 3px 10px !important;
  border-radius: 6px !important;
  color: #1890ff !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  display: inline-block !important;
  margin: 0 3px !important;
  font-size: 13px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1) !important;
  position: relative !important;
}

:deep(.var-token:hover) {
  background: linear-gradient(135deg, #bae7ff 0%, #91d5ff 100%) !important;
  border-color: #1890ff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2) !important;
}

:deep(.var-token:active) {
  transform: translateY(0) !important;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.15) !important;
}

/* 为变量添加小图标指示器 */
:deep(.var-token::before) {
  content: "📊" !important;
  font-size: 10px !important;
  margin-right: 4px !important;
  opacity: 0.8 !important;
}

/* 工具栏按钮激活状态 */
.el-button.active {
  background-color: #1890ff !important;
  color: white !important;
  border-color: #1890ff !important;
}

/* 编辑器内容样式优化 - 完全保留Word格式 */
:deep(.table-like-editor) {
  /* 保留所有内联样式 */
}

:deep(.table-like-editor h1),
:deep(.table-like-editor h2),
:deep(.table-like-editor h3),
:deep(.table-like-editor h4),
:deep(.table-like-editor h5),
:deep(.table-like-editor h6) {
  margin: 12pt 0 6pt 0;
  font-weight: bold;
  line-height: 1.15;
  color: inherit; /* 保留原始颜色 */
  font-family: inherit; /* 保留原始字体 */
}

:deep(.table-like-editor h1) { font-size: 16pt; }
:deep(.table-like-editor h2) { font-size: 14pt; }
:deep(.table-like-editor h3) { font-size: 12pt; }
:deep(.table-like-editor h4) { font-size: 11pt; font-weight: bold; }
:deep(.table-like-editor h5) { font-size: 11pt; }
:deep(.table-like-editor h6) { font-size: 11pt; }

:deep(.table-like-editor p) {
  margin: 0 0 6pt 0;
  line-height: 1.15;
  font-size: inherit; /* 保留原始字号 */
  color: inherit; /* 保留原始颜色 */
  font-family: inherit; /* 保留原始字体 */
}

:deep(.table-like-editor span) {
  /* 保留所有span的内联样式，包括颜色、字体等 */
  color: inherit;
  background-color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-decoration: inherit;
}

:deep(.table-like-editor strong) {
  font-weight: bold;
  color: inherit;
}

:deep(.table-like-editor em) {
  font-style: italic;
  color: inherit;
}

:deep(.table-like-editor u) {
  text-decoration: underline;
  color: inherit;
}

:deep(.table-like-editor ul),
:deep(.table-like-editor ol) {
  margin: 6pt 0;
  padding-left: 18pt;
}

:deep(.table-like-editor li) {
  margin: 0;
  line-height: 1.15;
  font-size: inherit;
  color: inherit;
}

:deep(.table-like-editor blockquote) {
  margin: 6pt 18pt;
  padding: 0;
  font-style: italic;
  color: inherit;
  border: none;
  background: none;
}

:deep(.table-like-editor hr) {
  margin: 6pt 0;
  border: none;
  border-top: 1pt solid #000;
  background: none;
}

:deep(.table-like-editor table),
:deep(.table-like-editor .word-table) {
  margin: 6pt 0;
  border-collapse: collapse;
  width: 100%;
  font-size: inherit;
}

:deep(.table-like-editor th),
:deep(.table-like-editor td) {
  padding: 3pt 6pt;
  border: 1pt solid #000;
  text-align: left;
  vertical-align: top;
  font-size: inherit;
  line-height: 1.15;
  color: inherit;
  background-color: inherit;
}

:deep(.table-like-editor th) {
  font-weight: bold;
  color: inherit;
  background-color: inherit;
}

/* 分页模式样式 */
.paginated-mode {
  /* A4纸张分页样式 */
  page-break-after: always;
  break-after: page;
}

.paginated-mode::after {
  content: '';
  display: block;
  height: 20px;
  border-bottom: 2px dashed #ccc;
  margin: 20px 0;
}

/* 保留Word文档中的所有颜色和背景色 */
:deep(.table-like-editor [style*="color"]) {
  /* 保持原有的内联颜色样式 */
}

:deep(.table-like-editor [style*="background"]) {
  /* 保持原有的内联背景样式 */
}

:deep(.table-like-editor [style*="font-family"]) {
  /* 保持原有的字体样式 */
}

:deep(.table-like-editor [style*="font-size"]) {
  /* 保持原有的字号样式 */
}

:deep(.table-like-editor [style*="font-weight"]) {
  /* 保持原有的字重样式 */
}

:deep(.table-like-editor [style*="text-decoration"]) {
  /* 保持原有的文本装饰样式 */
}

/* 字段选择对话框样式 */
.field-select-content {
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.field-select-search {
  margin-bottom: 16px;
}

.field-select-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.field-select-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.field-select-item:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.field-select-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.field-select-info {
  flex: 1;
}

.field-select-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.field-select-type {
  font-size: 12px;
  color: #999;
}

/* 全屏模式样式 */
.visual-editor:fullscreen {
  background-color: #fff;
}

.visual-editor:fullscreen .fields-sidebar {
  display: none;
}

.visual-editor:fullscreen .editor-content-area {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.visual-editor:fullscreen .table-like-editor {
  padding: 48px 64px;
  font-size: 16px;
  line-height: 1.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-main {
    flex-direction: column;
  }
  
  .fields-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .fields-sidebar.collapsed {
    height: 48px;
    width: 100%;
  }
  
  .field-list {
    max-height: 120px;
  }
  
  .editor-content-area {
    flex: 1;
  }
  
  .editor-body {
    padding: 8px;
  }
  
  .table-like-editor {
    padding: 12px;
    min-height: 300px;
  }
}
</style>