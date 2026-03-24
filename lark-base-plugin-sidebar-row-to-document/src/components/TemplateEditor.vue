<template>
  <div class="template-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <!-- 新增：返回按钮 -->
        <el-button text size="small" @click="$emit('back')" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回模板管理
        </el-button>

        <el-select
          v-model="selectedTemplateId"
          placeholder="选择要编辑的模板"
          clearable
          filterable
          @change="handleTemplateChange"
          class="template-select"
        >
          <el-option
            v-for="template in templates"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          >
            <div class="template-option">
              <span class="template-name">{{ template.name }}</span>
              <span class="template-version">v{{ template.version }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      
      <div class="toolbar-right">
        <el-button 
          v-if="selectedTemplate"
          class="primary-action-btn download-btn"
          type="primary"
          size="large"
          :loading="downloading"
          @click="downloadRendered"
        >
          <el-icon><Download /></el-icon>
          下载渲染结果
        </el-button>
      </div>
    </div>

    <!-- 主体内容：选择 + 预览 -->
    <div class="editor-content" v-if="selectedTemplate">
      <!-- 预览模式：渲染 DOCX 后转 HTML 展示（默认） -->
      <div class="preview-mode" v-if="false">
        <div class="preview-header">
          <h3>模板预览</h3>
          <div class="preview-actions">
            <el-button @click="generatePreview" size="small" :loading="loadingPreview">
              <el-icon><Refresh /></el-icon>
              刷新预览
            </el-button>
          </div>
        </div>
        
        <div class="preview-area" v-loading="loadingPreview">
          <div 
            v-if="previewHtml" 
            class="preview-content"
            v-html="previewHtml"
          ></div>
          <el-empty 
            v-else 
            description="暂无预览内容"
            :image-size="80"
          />
        </div>
      </div>

      <!-- 字段绑定映射 -->
      <div class="binding-section" v-if="placeholders && placeholders.length">
        <div class="preview-header">
          <h3>字段绑定</h3>
          <div class="preview-actions">
            <span class="placeholder-count">共 {{ placeholders.length }} 个 · 已绑定 {{ boundCount }} · 未绑定 {{ unboundCount }}</span>
            <el-button @click="refreshFields" size="small" :loading="refreshingFields" class="refresh-fields-btn">
              <el-icon><Refresh /></el-icon>
              刷新字段
            </el-button>
           <el-button @click="autoMatchMapping" size="small" class="auto-match-btn" :disabled="(placeholders || []).length === 0 || (uniqueFields || []).length === 0">
             <el-icon><Search /></el-icon>
             自动匹配
           </el-button>
          </div>
        </div>

        <!-- 新增：筛选工具条（去掉紧凑模式开关） -->
        <div class="binding-tools">
          <el-input
            v-model="bindingFilterKeyword"
            placeholder="筛选占位符..."
            clearable
            size="small"
            class="tool-item"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="bindingFilterStatus" size="small" class="tool-item" style="width: 140px">
            <el-option label="全部" value="all" />
            <el-option label="已绑定" value="bound" />
            <el-option label="未绑定" value="unbound" />
          </el-select>
          <!-- 紧凑模式已移除，根据反馈简化选项 -->
        </div>

        <!-- 可调高度：拖拽条 + 映射列表面板 -->
        <div class="binding-resizer" @mousedown="startResizeMapping" title="拖动调整列表高度">
          <span class="resizer-handle"></span>
        </div>
        <div class="mapping-panel" :style="{ height: mappingPanelHeight + 'px' }">
          <div class="mapping-table">
            <div class="field-binding-row" :class="{ bound: !!mapping[ph], unbound: !mapping[ph] }" v-for="ph in filteredPlaceholders" :key="ph">
              <span class="ph-key">{{ ph }}</span>
              <el-select v-model="mapping[ph]" placeholder="选择字段" filterable clearable size="default" class="bind-select" :class="{ 'is-bound': !!mapping[ph] }">
                <el-option 
                  v-for="f in uniqueFields" 
                  :key="f.id" 
                  :label="f.name" 
                  :value="f.id"
                  :title="f.name"
                />
              </el-select>
            </div>
            </div>
          </div>
                </div>
        </div>
 
      <!-- 空状态 -->
    <div v-if="!selectedTemplate" class="empty-editor">
      <el-empty description="请选择要编辑的模板">
        <el-button type="primary" @click="$emit('create-template')">
          创建新模板
        </el-button>
      </el-empty>
     </div>
      <!-- 更清晰的字段搜索弹窗：保留直接输入搜索，同时提供可视化列表选择 -->
      <el-dialog 
        v-if="false"
        v-model="fieldSearchDialogVisible" 
        width="520px" 
        :append-to-body="true" 
        class="field-search-dialog"
      >
        <template #header>
          <div class="dialog-title">
            <el-icon><Search /></el-icon>
            <span>搜索字段</span>
            <span class="ph-tip" v-if="activeSearchPlaceholderKey"> · 绑定到 {{ activeSearchPlaceholderKey }}</span>
          </div>
        </template>

        <div class="field-search-box">
          <el-input
            ref="fieldSearchInputRef"
            v-model="fieldSearchKeyword"
            placeholder="搜索字段名称..."
            clearable
            size="small"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 顶部“搜索”按钮 + 分割线，然后再展示选项列表 -->
        <div class="search-action-bar">
          <el-button size="small" type="primary" @click="doFieldSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <el-divider style="margin: 8px 0;" />

        <div class="field-search-list">
          <div 
            class="field-search-item" 
            v-for="f in filteredFieldsForSearch" 
            :key="f.id"
            @click="chooseFieldForPlaceholder(f)"
          >
            <div class="fi">
              <FieldIcon :field-type="f.type" />
            </div>
            <div class="info">
              <div class="name">{{ f.name }}</div>
              <div class="meta" v-if="false">ID: {{ f.id }}</div>
            </div>
            <el-icon class="pick-icon"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="filteredFieldsForSearch.length === 0" description="未找到匹配字段" :image-size="80" />
        </div>

        <template #footer>
          <span class="tips-small">提示：你也可以直接在下拉框中输入搜索（名称）。</span>
        </template>
      </el-dialog>

     <!-- 移除：之前的右侧抽屉字段选择器 -->
     <el-drawer 
       v-if="false"
       v-model="fieldPickerVisible"
       direction="rtl"
       size="360px"
       :with-header="true"
       class="field-picker-drawer"
     >
       <template #header>
         <div class="dialog-title">
           <el-icon><Search /></el-icon>
           <span>选择字段</span>
           <span class="ph-tip" v-if="fieldPickerPlaceholderKey"> · 绑定到 {{ fieldPickerPlaceholderKey }}</span>
         </div>
       </template>

       <!-- 搜索框位于选项上方，并带提示文字 -->
       <div class="field-search-box">
         <el-input
           v-model="fieldPickerKeyword"
           placeholder="搜索"
           clearable
           size="small"
           class="search-input-modern"
         >
           <template #prefix>
             <el-icon><Search /></el-icon>
           </template>
         </el-input>
         
       </div>

       <el-divider style="margin: 8px 0;" />

       <div class="field-picker-list">
         <el-radio-group v-model="fieldPickerSelection" @change="handlePickerChange">
           <el-radio 
             v-for="f in filteredFieldsForPicker" 
             :key="f.id" 
             :label="f.name"
             class="field-picker-item"
           >
             <div class="info">
               <div class="name">{{ f.name }}</div>
               <div class="meta" v-if="false">ID: {{ f.id }}</div>
             </div>
           </el-radio>
         </el-radio-group>
         <el-empty v-if="filteredFieldsForPicker.length === 0" description="未找到匹配字段" :image-size="80" />
       </div>
     </el-drawer>
  
   </div>
 </template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Edit,
  Download,
  Search,
  Refresh,
  ArrowLeft,
  ArrowRight,
  UploadFilled
} from '@element-plus/icons-vue';
import { templateService } from '@/services/templateService';
import { renderService } from '@/services/renderService';
import { baseService } from '@/services/baseService';
import mammoth from 'mammoth';
import FieldIcon from './FieldIcon.vue';

// 事件声明（模板里直接用 $emit，这里仅声明以利类型提示）
const emit = defineEmits(['create-template', 'back']);

// 本地存储键
const LOCAL_EDIT_STORAGE_KEY = 'template_text_edits_v1';
const MAPPING_STORAGE_KEY = 'template_placeholder_mapping_v1';

// 基础状态
const templates = ref([]);
const selectedTemplateId = ref(null);
const selectedTemplate = ref(null);
const previewMode = ref('preview'); // 'edit' | 'preview'
const downloading = ref(false);
const loadingPreview = ref(false);
const templateContent = ref(''); // 提取出来的纯文本
const previewHtml = ref('');

const loadTemplates = () => {
  try {
    templates.value = templateService.getTemplates();
  } catch (_) {
    templates.value = [];
  }
};

const isNarrow = ref(false);
const viewportWidth = ref(1024);
const updateIsNarrow = () => {
  try {
    const w = window.innerWidth || 0;
    isNarrow.value = w <= 768;
    viewportWidth.value = w;
  } catch (_) {
    isNarrow.value = false;
    viewportWidth.value = 1024;
  }
};

// 根据视口计算绑定弹层合适宽度，严格遵循400px最小宽度适配
const bindPopoverWidth = computed(() => {
  const vw = viewportWidth.value || 1024;
  // 400px以下超窄屏适配 - 确保弹层内容完整显示
  if (vw <= 400) return Math.max(320, vw - 12);
  // 480px以下窄屏适配
  if (vw <= 480) return Math.max(360, vw - 20);
  // 768px以下平板适配
  if (vw <= 768) return Math.min(480, vw - 32);
  // 桌面端固定舒适宽度
  return 520;
});

// 字段、记录与映射
const fields = ref([]);
const oneRecord = ref(null);
const placeholders = ref([]); // e.g. ['甲方','乙方']
const mapping = ref({}); // { 占位符: 字段ID }
// 新增：监听映射对象变化，持久化到本地
watch(mapping, persistMapping, { deep: true });

// 新增：映射列表面板高度与拖拽调整
const MAPPING_HEIGHT_KEY = 'template_editor_mapping_height_v1';
const mappingPanelHeight = ref(parseInt(localStorage.getItem(MAPPING_HEIGHT_KEY) || '360', 10) || 360);
let mappingResizing = false;
const startResizeMapping = (e) => {
  try {
    e.preventDefault();
    mappingResizing = true;
    document.addEventListener('mousemove', onResizeMapping);
    document.addEventListener('mouseup', stopResizeMapping, { once: true });
  } catch (_) {}
};
const onResizeMapping = (e) => {
  if (!mappingResizing) return;
  try {
    const next = Math.min(640, Math.max(200, mappingPanelHeight.value + (e.movementY || 0)));
    mappingPanelHeight.value = next;
  } catch (_) {}
};
const stopResizeMapping = () => {
  mappingResizing = false;
  try { localStorage.setItem(MAPPING_HEIGHT_KEY, String(mappingPanelHeight.value || 360)); } catch (_) {}
  document.removeEventListener('mousemove', onResizeMapping);
};
const extracting = ref(false);
const refreshingFields = ref(false);
const fileInputRef = ref(null);

// 新增：绑定区筛选与布局密度
const bindingFilterKeyword = ref('');
const bindingFilterStatus = ref('all'); // all | bound | unbound
const bindingCompact = ref(false);

const filteredPlaceholders = computed(() => {
  const kw = (bindingFilterKeyword.value || '').trim().toLowerCase();
  const status = bindingFilterStatus.value;
  const list = placeholders.value || [];
  return list.filter((ph) => {
    const matchKw = !kw || String(ph).toLowerCase().includes(kw);
    const isBound = !!(mapping.value && mapping.value[ph]);
    const matchStatus = status === 'all' || (status === 'bound' ? isBound : !isBound);
    return matchKw && matchStatus;
  });
});

const boundCount = computed(() => {
  const list = placeholders.value || [];
  return list.reduce((acc, ph) => acc + (mapping.value && mapping.value[ph] ? 1 : 0), 0);
});
const unboundCount = computed(() => {
  const total = (placeholders.value || []).length;
  return Math.max(0, total - boundCount.value);
});

// 新增：去重后的字段列表（按ID去重）
const uniqueFields = computed(() => {
  const map = new Map();
  (fields.value || []).forEach((f) => {
    if (f?.id && !map.has(f.id)) map.set(f.id, f);
  });
  return Array.from(map.values());
});

// ========== 自定义“绑定字段”下拉（顶部固定搜索框） ==========
const bindVisibleMap = reactive({}); // 每一行（占位符）一个可见状态
const activeBindKey = ref('');
const bindSearchKeyword = ref('');
const bindTempSelection = ref('');

const filteredBindFields = computed(() => {
  const kw = (bindSearchKeyword.value || '').trim().toLowerCase();
  const list = uniqueFields.value || [];
  if (!kw) return list;
  return list.filter(
    (f) => String(f?.name || '').toLowerCase().includes(kw) || String(f?.id || '').toLowerCase().includes(kw)
  );
});

const openBindDropdown = (placeholderKey) => {
  Object.keys(bindVisibleMap).forEach(k => bindVisibleMap[k] = false);
  activeBindKey.value = placeholderKey || '';
  bindSearchKeyword.value = '';
  bindTempSelection.value = mapping.value?.[placeholderKey] || '';
  nextTick(() => { bindVisibleMap[placeholderKey] = true; });
};

const onBindShow = (placeholderKey) => {
  activeBindKey.value = placeholderKey || '';
  bindSearchKeyword.value = '';
  bindTempSelection.value = mapping.value?.[placeholderKey] || '';
  // 只保留当前这一行的下拉处于打开状态，避免多个实例相互影响导致闪烁/关闭
  Object.keys(bindVisibleMap).forEach(k => { bindVisibleMap[k] = (k === placeholderKey); });
  nextTick(() => {
    try { document.querySelector('.bind-popover input')?.focus?.(); } catch (_) {}
  });
};

const onBindPick = (newVal) => {
  if (!activeBindKey.value) return;
  const m = { ...(mapping.value || {}) };
  m[activeBindKey.value] = newVal;
  mapping.value = m;
  persistMapping();
  bindVisibleMap[activeBindKey.value] = false; // 关闭
  const pickedName = getFieldNameById(newVal) || newVal;
  ElMessage.success(`已绑定到字段：${pickedName}`);
};

// ========== 字段搜索弹窗 ==========
const fieldSearchDialogVisible = ref(false);
const fieldSearchKeyword = ref('');
const activeSearchPlaceholderKey = ref('');
const fieldSearchInputRef = ref(null);

const filteredFieldsForSearch = computed(() => {
  const kw = (fieldSearchKeyword.value || '').trim().toLowerCase();
  const list = uniqueFields.value || [];
  if (!kw) return list;
  return list.filter(
    (f) => String(f?.name || '').toLowerCase().includes(kw) || String(f?.id || '').toLowerCase().includes(kw)
  );
});

const doFieldSearch = () => {
  nextTick(() => { try { fieldSearchInputRef.value?.focus?.(); } catch (_) {} });
};

const chooseFieldForPlaceholder = (f) => {
  if (!activeSearchPlaceholderKey.value || !f?.id) return;
  const m = { ...(mapping.value || {}) };
  m[activeSearchPlaceholderKey.value] = f.id;
  mapping.value = m;
  persistMapping();
  fieldSearchDialogVisible.value = false;
  ElMessage.success(`已绑定到字段：${f.name || f.id}`);
};

// 新增：打开字段搜索弹窗（来自映射行的“选择字段”）
const openFieldSearch = (placeholderKey) => {
  activeSearchPlaceholderKey.value = placeholderKey || '';
  fieldSearchKeyword.value = '';
  fieldSearchDialogVisible.value = true;
  nextTick(() => { try { fieldSearchInputRef.value?.focus?.(); } catch (_) {} });
};

// ========== 右侧抽屉（保留但默认不用） ==========
const fieldPickerVisible = ref(false);
const fieldPickerKeyword = ref('');
const fieldPickerPlaceholderKey = ref('');
const fieldPickerSelection = ref('');

const filteredFieldsForPicker = computed(() => {
  const kw = (fieldPickerKeyword.value || '').trim().toLowerCase();
  const list = uniqueFields.value || [];
  if (!kw) return list;
  return list.filter(
    (f) => String(f?.name || '').toLowerCase().includes(kw) || String(f?.id || '').toLowerCase().includes(kw)
  );
});

const handlePickerChange = (newVal) => {
  if (!fieldPickerPlaceholderKey.value) return;
  const m = { ...(mapping.value || {}) };
  m[fieldPickerPlaceholderKey.value] = newVal;
  mapping.value = m;
  persistMapping();
  fieldPickerVisible.value = false;
  ElMessage.success(`已绑定到字段：${getFieldNameById(newVal) || newVal}`);
};

// ======== 工具方法 ========
const getFieldNameById = (id) => {
  const f = (fields.value || []).find(x => x.id === id);
  return f?.name || '';
};
const getFieldLabelById = (id) => {
  const f = (fields.value || []).find(x => x.id === id);
  return f ? `${f.name}（${f.id}）` : '';
};

// 读取/保存本地编辑内容
const loadSavedEdit = (templateId) => {
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_EDIT_STORAGE_KEY) || '{}');
    return map?.[templateId] || '';
  } catch (_) { return ''; }
};
const saveEditToLocal = (templateId, text) => {
  try {
    const map = JSON.parse(localStorage.getItem(LOCAL_EDIT_STORAGE_KEY) || '{}');
    if (templateId) map[templateId] = text || '';
    localStorage.setItem(LOCAL_EDIT_STORAGE_KEY, JSON.stringify(map));
  } catch (_) {}
};

// 本地映射读写
const loadSavedMapping = (templateId) => {
  try {
    const map = JSON.parse(localStorage.getItem(MAPPING_STORAGE_KEY) || '{}');
    return (templateId && map[templateId]) ? map[templateId] : {};
  } catch (_) { return {}; }
};
const saveMappingToLocal = (templateId, obj) => {
  try {
    const map = JSON.parse(localStorage.getItem(MAPPING_STORAGE_KEY) || '{}');
    if (templateId) map[templateId] = obj || {};
    localStorage.setItem(MAPPING_STORAGE_KEY, JSON.stringify(map));
  } catch (_) {}
};
function persistMapping() {
  if (!selectedTemplate.value) return;
  saveMappingToLocal(selectedTemplate.value.id, mapping.value || {});
}

// 新增：监听映射变化（包括el-select直接修改），自动持久化
const onOpenTemplateEditor = (e) => {
  try {
    const id = e?.detail?.id;
    if (id) {
      selectedTemplateId.value = id;
      handleTemplateChange(id);
    }
  } catch (_) {}
};
onMounted(() => { window.addEventListener('open-template-editor', onOpenTemplateEditor); });
onUnmounted(() => { window.removeEventListener('open-template-editor', onOpenTemplateEditor); });

 // 切换模板
 const handleTemplateChange = async (templateId) => {
   if (!templateId) {
     selectedTemplate.value = null; 
     selectedTemplateId.value = null;
     templateContent.value = ''; 
     previewHtml.value = ''; 
     placeholders.value = []; 
     mapping.value = {};
     return;
   }
   
   const t = templateService.getTemplate(templateId);
   if (t) {
     selectedTemplate.value = t;
     try {
       await Promise.all([
         loadTemplateContent(t),
         loadFieldsAndRecord(),
       ]);
       mapping.value = loadSavedMapping(t.id);
     } catch (error) {
       console.error('Failed to load template:', error);
       ElMessage.error('加载模板失败');
     }
   }
 };

 // 载入模板内容并提取占位符
 const loadTemplateContent = async (template) => {
   try {
     extracting.value = true;
     const file = await templateService.getTemplateFile(template.id);
     if (file) {
       const arrayBuffer = await file.arrayBuffer();
       const result = await mammoth.extractRawText({ arrayBuffer });
       templateContent.value = result.value || '';
     } else {
       templateContent.value = '';
     }
   } catch (e) {
     console.error('loadTemplateContent failed:', e);
     ElMessage.error('加载模板内容失败');
   } finally {
     extracting.value = false;
     refreshPlaceholders();
   }
 };

 // 提取 {{ key }}
 const refreshPlaceholders = () => {
   const text = templateContent.value || '';
   const found = new Set();
   text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, key) => { const k = String(key).trim(); if (k) found.add(k); return _; });
   placeholders.value = Array.from(found);
   const m = { ...(mapping.value || {}) };
   Object.keys(m).forEach(k => { if (!found.has(k)) delete m[k]; });
   mapping.value = m;
   persistMapping();
 };

 // 加载字段与一条记录
 const loadFieldsAndRecord = async () => {
   try { fields.value = await baseService.getFields(); } catch (_) { fields.value = []; }
   let recordList = [];
   try { recordList = await baseService.getSelectedRecords(); } catch (_) {
     try { recordList = await baseService.getRecords(undefined, undefined, 1); } catch (_) { recordList = []; }
   }
   let rd = recordList?.[0];
   if (!rd) {
     const demo = { recordId: 'demo', fields: {} };
     (fields.value || []).forEach(f => { demo.fields[f.id] = `示例-${f.name}`; });
     rd = demo;
   }
   oneRecord.value = rd;
 };

 // 刷新字段
 const refreshFields = async () => {
   try {
     refreshingFields.value = true;
     await loadFieldsAndRecord();
     ElMessage.success('字段已刷新');
   } catch (e) {
     ElMessage.error('刷新字段失败');
   } finally { refreshingFields.value = false; }
 };

  // 自动匹配：根据占位符与字段名称进行智能匹配
  const normalize = (s) => String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[\-_.()（）\[\]【】"'“”‘’`，,。！!？?：:;；/\\]/g, '');

  const autoMatchMapping = () => {
    const phList = placeholders.value || [];
    const fieldList = uniqueFields.value || [];
    if (!phList.length || !fieldList.length) {
      ElMessage.warning('暂无占位符或字段可匹配');
      return;
    }

    const nameToFieldIds = new Map();
    const normToFieldIds = new Map();
    const idSet = new Set(fieldList.map(f => f.id));

    fieldList.forEach(f => {
      const name = String(f?.name || '');
      const norm = normalize(name);
      if (!nameToFieldIds.has(name)) nameToFieldIds.set(name, []);
      nameToFieldIds.get(name).push(f.id);
      if (!normToFieldIds.has(norm)) normToFieldIds.set(norm, []);
      normToFieldIds.get(norm).push(f.id);
    });

    let updated = 0;
    let skippedBound = 0;
    let unmatched = 0;
    const nextMap = { ...(mapping.value || {}) };

    phList.forEach(ph => {
      if (nextMap[ph]) { skippedBound += 1; return; }

      let chosenId = undefined;

      // 1) 按字段名完全一致（区分大小写）
      const byExact = nameToFieldIds.get(ph);
      if (byExact && byExact.length === 1) {
        chosenId = byExact[0];
      }

      // 2) 占位符就是字段ID
      if (!chosenId && idSet.has(ph)) {
        chosenId = ph;
      }

      // 3) 归一化后名称一致
      if (!chosenId) {
        const nph = normalize(ph);
        const byNorm = normToFieldIds.get(nph);
        if (byNorm && byNorm.length === 1) {
          chosenId = byNorm[0];
        } else {
          // 4) 唯一包含关系（避免多匹配导致误判）
          const candidates = fieldList.filter(f => {
            const nf = normalize(f.name);
            return nf && (nf === nph || nf.includes(nph) || nph.includes(nf));
          });
          if (candidates.length === 1) chosenId = candidates[0].id;
        }
      }

      if (chosenId) {
        nextMap[ph] = chosenId;
        updated += 1;
      } else {
        unmatched += 1;
      }
    });

    mapping.value = nextMap;
    persistMapping();
    ElMessage.success(`自动匹配完成：更新 ${updated} 项，已绑定跳过 ${skippedBound} 项，未匹配 ${unmatched} 项`);
  };

 // 重新上传为新版本
 const triggerReupload = () => {
   if (!selectedTemplate.value) { ElMessage.warning('请先选择模板'); return; }
   fileInputRef.value && fileInputRef.value.click();
 };
 const handleReuploadChange = async (e) => {
   try {
     const file = e?.target?.files?.[0];
     e.target.value = '';
     if (!file) return;
     if (!/\.docx$/i.test(file.name)) { ElMessage.error('请上传 .docx 文件'); return; }
     const old = selectedTemplate.value;
     const oldMapping = { ...(mapping.value || {}) };
     const created = await templateService.uploadTemplate(file, old.name, old.tags, old.notes);
     const bump = (ver) => { 
       const m = String(ver || '1.0.0').split('.').map(n => parseInt(n, 10) || 0); 
       while (m.length < 3) m.push(0); 
       m[2] += 1; 
       return `${m[0]}.${m[1]}.${m[2]}`; 
     };
     templateService.updateTemplate(created.id, { version: bump(old.version) });
     loadTemplates();
     selectedTemplateId.value = created.id;
     selectedTemplate.value = templateService.getTemplate(created.id);
     await loadTemplateContent(selectedTemplate.value);
     mapping.value = oldMapping; // 迁移
     refreshPlaceholders();
     persistMapping();
     ElMessage.success('新版本已上传并提取占位符');
   } catch (err) {
     console.error('handleReuploadChange error:', err);
     ElMessage.error('重新上传失败');
   }
 };

 // 取某占位符在示例记录中的值
 const getPreviewValue = (phKey) => {
   try {
     // 优先用已绑定的字段ID；否则把占位符本身当作字段ID试一遍
     const candidateId = mapping.value?.[phKey] || phKey;
     const rec = oneRecord.value || {};
     const byName = findFieldNameById(candidateId);
     const raw = (
       rec.fields?.[candidateId] ?? // 直接按字段ID取
       rec.fields?.[phKey] ??       // 再尝试占位符原样
       (byName ? rec.fields?.[byName] : undefined) // 有些数据按字段名称存
     );
     if (raw === null || raw === undefined) return '';
     if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
     if (Array.isArray(raw)) return raw.map(x => (x?.text || x?.name || x)).join(', ');
     if (typeof raw === 'object') return (raw.text || raw.name || JSON.stringify(raw));
     return String(raw);
   } catch (e) { return ''; }
 };
 const findFieldNameById = (fid) => { const f = (fields.value || []).find(x => x.id === fid); return f ? f.name : ''; };

 // 生成预览
 const buildRenderData = () => {
   const data = {};
   (placeholders.value || []).forEach(ph => { data[ph] = getPreviewValue(ph); });
   return data;
 };
 const generatePreview = async () => {
   if (!selectedTemplate.value) return;
   loadingPreview.value = true;
   try {
     if (!fields.value || fields.value.length === 0 || !oneRecord.value) { await loadFieldsAndRecord(); }
     const data = buildRenderData();
     const blob = await renderService.renderWithData(selectedTemplate.value.id, data);
     const ab = await blob.arrayBuffer();
     const htmlRes = await mammoth.convertToHtml({ 
       arrayBuffer: ab,
       styleMap: [
         // Word样式映射，确保显示效果对齐
         "p[style-name='Normal'] => p:fresh",
         "p[style-name='Heading 1'] => h1:fresh",
         "p[style-name='Heading 2'] => h2:fresh",
         "p[style-name='Heading 3'] => h3:fresh",
         "r[style-name='Strong'] => strong",
         "table => table.word-table:fresh"
       ]
     });
     
     // 应用Word文档样式
     let styledHtml = htmlRes.value || '';
     styledHtml = `
       <div class="word-preview-content">
         ${styledHtml}
       </div>
     `;
     
     previewHtml.value = styledHtml;
   } catch (e) {
     console.error('generatePreview failed:', e);
     ElMessage.error('生成预览失败，请检查占位符绑定');
   } finally { loadingPreview.value = false; }
 };

 // 生成预览（按钮）并滚动到预览区域
 const handlePreviewClick = async () => {
   await generatePreview();
   try {
     const el = document.querySelector('.preview-area');
     el && el.scrollIntoView({ behavior: 'smooth', block: 'start' });
   } catch (_) {}
 };

 // 下载渲染
 const downloadRendered = async () => {
   if (!selectedTemplate.value) { ElMessage.warning('请先选择模板'); return; }
   try {
     downloading.value = true;
     if (!fields.value || fields.value.length === 0 || !oneRecord.value) { await loadFieldsAndRecord(); }
     const data = buildRenderData();
     const blob = await renderService.renderWithData(selectedTemplate.value.id, data);
     const rid = oneRecord.value?.recordId ? `_${oneRecord.value.recordId}` : '';
     const filename = `${selectedTemplate.value.name || '文档'}${rid}_${Date.now()}.docx`;
     renderService.downloadFile(blob, filename);
     ElMessage.success('已开始下载渲染文件');
   } catch (e) {
     console.error('downloadRendered failed:', e);
     ElMessage.error('渲染下载失败，请检查占位符绑定');
   } finally { downloading.value = false; }
 };

 // 监听
 watch(previewMode, async (mode) => { if (mode === 'preview' && selectedTemplate.value) { await generatePreview(); } });
 watch(templateContent, (val) => { if (!selectedTemplate.value) return; try { const id = selectedTemplate.value.id; const map = JSON.parse(localStorage.getItem(LOCAL_EDIT_STORAGE_KEY) || '{}'); map[id] = val || ''; localStorage.setItem(LOCAL_EDIT_STORAGE_KEY, JSON.stringify(map)); } catch (_) {} });

 onMounted(() => {
   loadTemplates();
   updateIsNarrow();
   window.addEventListener('resize', updateIsNarrow);
   window.addEventListener('template-uploaded', loadTemplates);
   // 监听表格切换事件，同步刷新字段列表
   window.addEventListener('table-changed', handleTableChange);
 });
 onUnmounted(() => {
   window.removeEventListener('resize', updateIsNarrow);
   window.removeEventListener('template-uploaded', loadTemplates);
   // 清理表格切换监听
   window.removeEventListener('table-changed', handleTableChange);
 });

 // 表格切换时同步刷新字段列表
 const handleTableChange = async () => {
   try {
     await loadFieldsAndRecord();
     ElMessage.success('字段列表已更新');
   } catch (error) {
     console.error('Failed to refresh fields on table change:', error);
     ElMessage.error('字段列表更新失败');
   }
 };
</script>

<style scoped>
.back-btn { margin-right: 12px; }
.template-editor { height: 100%; display: flex; flex-direction: column; }
.editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--el-border-color-lighter); background-color: var(--el-bg-color); }
.template-select { width: 300px; }
.template-option { display: flex; justify-content: space-between; align-items: center; }
.template-name { flex: 1; }
.template-version { font-size: 12px; color: var(--el-text-color-secondary); background-color: var(--el-fill-color-light); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
.toolbar-right { display: flex; gap: 12px; align-items: center; }
.editor-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.edit-mode, .preview-mode { flex: 1; display: flex; flex-direction: column; padding: 16px; }
/* 苹果风格的简洁设计 */
.edit-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: -0.01em;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.placeholder-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.upload-btn {
  color: var(--el-color-primary);
  font-weight: 500;
}

.upload-btn:hover {
  background-color: var(--el-color-primary-light-9);
}

.preview-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16px; 
}

.preview-header h3 { 
  margin: 0; 
  color: var(--el-text-color-primary); 
}

/* 主操作按钮样式：更大尺寸、蓝色底色、对比清晰 */
.toolbar-right .primary-action-btn {
  --btn-height: 40px; /* 桌面：40px */
  height: var(--btn-height);
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.25);
}
.toolbar-right .primary-action-btn .el-icon { font-size: 16px; }
.toolbar-right .primary-action-btn:hover { filter: brightness(1.03); }
.toolbar-right .primary-action-btn:active { transform: translateY(0.5px); box-shadow: 0 4px 10px rgba(64, 158, 255, 0.25); }
.preview-btn,
.download-btn { transition: all .2s ease; }
@media (max-width: 480px) {
  .toolbar-right .primary-action-btn { --btn-height: 36px; padding: 0 14px; font-size: 13px; }
}

.mapping-table { 
  flex: 1; 
  min-height: 300px;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-extra-light);
}
/* 表格列头样式 */
.field-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.refresh-fields-btn {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.refresh-fields-btn:hover {
  background-color: var(--el-color-primary-light-9);
}

/* 苹果风格表格样式 */
:deep(.clean-table) {
  border: none;
  background: transparent;
}

:deep(.clean-table .el-table__header) {
  background: var(--el-fill-color-extra-light);
}

:deep(.clean-table .el-table__header th) {
  background: transparent;
  border: none;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
  padding: 16px 12px;
}

:deep(.clean-table .el-table__body tr) {
  background: transparent;
  transition: background-color 0.2s ease;
}

:deep(.clean-table .el-table__body tr:hover) {
  background-color: var(--el-fill-color-extra-light);
}

:deep(.clean-table .el-table__body td) {
  border: none;
  padding: 16px 12px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}

:deep(.clean-table .el-table__body tr:last-child td) {
  border-bottom: none;
}

.ph-key { 
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; 
  background: var(--el-fill-color-light); 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.value-preview { 
  color: var(--el-text-color-regular);
  font-size: 14px;
}
.preview-area { flex: 1; border: 1px solid var(--el-border-color-lighter); border-radius: 6px; overflow: auto; background-color: var(--el-bg-color); }
.preview-content { padding: 24px; max-width: 800px; margin: 0 auto; line-height: 1.7; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; }
.preview-content :deep(p) { margin: 0 0 6pt 0; line-height: 1.15; font-size: 11pt; color: #000; font-family: 'Calibri', sans-serif; }
.preview-content :deep(h1), .preview-content :deep(h2), .preview-content :deep(h3) { margin: 12pt 0 6pt 0; color: #000; font-family: 'Calibri', sans-serif; font-weight: bold; line-height: 1.15; }
.preview-content :deep(h1) { font-size: 16pt; }
.preview-content :deep(h2) { font-size: 14pt; }
.preview-content :deep(h3) { font-size: 12pt; }
.preview-content :deep(table) { width: 100%; border-collapse: collapse; margin: 6pt 0; font-size: 11pt; }
.preview-content :deep(td), .preview-content :deep(th) { border: 1pt solid #000; padding: 3pt 6pt; text-align: left; vertical-align: top; font-size: 11pt; line-height: 1.15; }
.preview-content :deep(th) { background-color: transparent; font-weight: bold; color: #000; }

/* Word预览内容样式 */
.word-preview-content {
  font-family: 'Calibri', 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.15;
  color: #000;
  max-width: 794px;
  margin: 0 auto;
  padding: 32px 48px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.empty-editor { flex: 1; display: flex; align-items: center; justify-content: center; }

/* 绑定行与搜索按钮 */
.field-binding-row { display: flex; align-items: center; gap: 8px; }
.clearer-search-btn { padding: 0 6px; }

/* 新增：绑定工具条与网格布局样式（覆盖默认表格布局，使内容更疏朗） */
.binding-tools { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.binding-tools .tool-item { min-width: 160px; }

/* 覆盖默认 mapping-table 样式为响应式网格 */
.mapping-table { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
  gap: 12px; 
  padding: 4px;
  border: none; 
  background: transparent;
}
@media (max-width: 480px) {
  .mapping-table { grid-template-columns: 1fr; }
}

/* 行项卡片化，提升可读性与点按区域 */
.field-binding-row { 
  background: var(--el-bg-color); 
  border: 1px solid var(--el-border-color-extra-light); 
  border-radius: 8px; 
  padding: 12px; 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 8px; 
}
.field-binding-row .bind-select { width: 100%; }

/* 紧凑模式下的缩进与字号微调 */
.mapping-table.compact .field-binding-row { padding: 8px; gap: 6px; }
.mapping-table.compact .ph-key { font-size: 12px; }
.mapping-table.compact .bound-label { font-size: 12px; }

/* 新增：可拖拽高度调整条与面板样式 */
.binding-resizer {
  height: 8px;
  cursor: row-resize;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
  border-left: none;
  border-right: none;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.binding-resizer .resizer-handle {
  width: 36px;
  height: 3px;
  background: var(--el-border-color);
  border-radius: 2px;
  opacity: .8;
}
.mapping-panel {
  overflow: auto;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  padding: 6px;
}

/* 结束新增样式 */
/* 状态可视化增强 */
.field-binding-row.bound { border-left: 4px solid var(--el-color-success); }
.field-binding-row.unbound { border-left: 4px solid var(--el-color-warning); }
.status-line { display: flex; align-items: center; gap: 8px; min-height: 22px; }
.status-tag { --el-tag-border-color: transparent; }
.bound-detail { color: var(--el-text-color-regular); font-size: 12px; }
.bind-select.is-bound :deep(.el-input__wrapper) { border-color: var(--el-color-success) !important; box-shadow: 0 0 0 1px var(--el-color-success) inset; }
</style>