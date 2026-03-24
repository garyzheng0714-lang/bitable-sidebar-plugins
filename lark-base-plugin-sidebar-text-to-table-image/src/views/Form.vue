<template>
  <div class="plugin-container">
    <el-scrollbar height="100vh">
      <div class="content-wrapper">
        <h2 class="title">{{ t('title') }}</h2>
        
        <!-- Configuration Section -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('storageConfig') }}</span>
            </div>
          </template>
          
          <el-form label-position="top" size="small">
            <el-form-item :label="t('provider')">
              <el-radio-group v-model="config.provider">
                <el-radio label="oss">Aliyun OSS</el-radio>
                <el-radio label="tos">Volcengine TOS</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="AccessKeyId" required>
              <el-input v-model="config.ak" placeholder="AccessKeyId" />
            </el-form-item>
            <el-form-item label="AccessKeySecret" required>
              <el-input v-model="config.sk" type="password" placeholder="AccessKeySecret" show-password />
            </el-form-item>
            <el-form-item label="Bucket" required>
              <el-input v-model="config.bucket" placeholder="Bucket Name" />
            </el-form-item>
            <el-form-item label="Region" required>
              <el-input v-model="config.region" placeholder="Region (e.g., oss-cn-beijing)" />
            </el-form-item>
            <el-form-item :label="t('endpoint') + ' (' + t('optional') + ')'">
              <el-input v-model="config.endpoint" placeholder="Endpoint" />
            </el-form-item>
            
            <el-button type="primary" link @click="saveConfig">{{ t('saveConfig') }}</el-button>
          </el-form>
        </el-card>

        <el-divider />

        <!-- Operation Section -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('generateConfig') }}</span>
            </div>
          </template>
          
          <el-form label-position="top" size="small">
            <el-form-item :label="t('sourceField')">
              <el-select v-model="selectedSourceFieldId" :placeholder="t('selectField')" style="width: 100%">
                <el-option v-for="field in textFields" :key="field.id" :label="field.name" :value="field.id" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('targetField')">
              <el-select v-model="selectedTargetFieldId" :placeholder="t('selectField')" style="width: 100%">
                <el-option v-for="field in textFields" :key="field.id" :label="field.name" :value="field.id" />
              </el-select>
              <div class="tips">{{ t('targetFieldTip') }}</div>
            </el-form-item>

            <el-button type="primary" class="action-btn" @click="handleBatchProcess" :loading="loading" :disabled="!isReady">
              {{ t('generateAndUpload') }} ({{ t('batch') }})
            </el-button>
            
            <el-button 
              v-if="loading" 
              type="danger" 
              class="action-btn" 
              style="margin-left: 0; margin-top: 8px;" 
              @click="handleStop"
            >
              {{ t('stop') }}
            </el-button>
            
            <div v-if="loading" class="progress-bar">
              <el-progress :percentage="progress" :format="progressFormat" />
            </div>

             <div v-if="processStatus" class="status-text">{{ processStatus }}</div>
          </el-form>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { bitable, FieldType } from '@lark-base-open/js-sdk';
import { useI18n } from 'vue-i18n';
import OSS from 'ali-oss';
import TOS from '@volcengine/tos-sdk';
import html2canvas from 'html2canvas';
import { TableParser } from '../utils/TableParser.mjs';

const { t } = useI18n();

// State
const config = ref({
  provider: 'oss',
  ak: '',
  sk: '',
  bucket: '',
  region: '',
  endpoint: ''
});

const textFields = ref([]);
const selectedSourceFieldId = ref('');
const selectedTargetFieldId = ref('');
const loading = ref(false);
const processStatus = ref('');
const progress = ref(0);
const totalRecords = ref(0);
const processedRecords = ref(0);

// Computed
const isReady = computed(() => {
  return config.value.ak && config.value.sk && config.value.bucket && config.value.region && 
         selectedSourceFieldId.value && selectedTargetFieldId.value;
});

const progressFormat = (percentage) => {
  return `${processedRecords.value}/${totalRecords.value} (${percentage}%)`;
};

// Lifecycle
onMounted(async () => {
  loadConfig();
  await refreshFields();
  
  // Listen for selection change to update fields if view changes
  bitable.base.onSelectionChange(async () => {
    // Optionally refresh fields if table/view changed
    await refreshFields();
  });
});

// Methods
const loadConfig = () => {
  const saved = localStorage.getItem('lark-plugin-config');
  if (saved) {
    try {
      config.value = { ...config.value, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load config', e);
    }
  }
};

const saveConfig = () => {
  localStorage.setItem('lark-plugin-config', JSON.stringify(config.value));
  ElMessage.success(t('configSaved'));
};

const refreshFields = async () => {
  const table = await bitable.base.getActiveTable();
  const fieldMetaList = await table.getFieldMetaList();
  // Filter for Text fields (for both source and target)
  // Target could technically be URL or Attachment, but README says Text Link
  textFields.value = fieldMetaList.filter(field => field.type === FieldType.Text);
};

const uploadToOSS = async (blob, filename) => {
  const client = new OSS({
    region: config.value.region,
    accessKeyId: config.value.ak,
    accessKeySecret: config.value.sk,
    bucket: config.value.bucket,
    secure: true // Use HTTPS
  });
  
  const result = await client.put(filename, blob);
  return result.url; // OSS returns url
};

const uploadToTOS = async (blob, filename) => {
  // Fix: @volcengine/tos-sdk browser usage
  // The SDK might need careful instantiation in browser
  const client = new TOS({
    accessKeyId: config.value.ak,
    accessKeySecret: config.value.sk,
    region: config.value.region,
    endpoint: config.value.endpoint || `tos-${config.value.region}.volces.com`,
  });

  await client.putObject({
    bucket: config.value.bucket,
    key: filename,
    body: blob,
  });

  // Construct URL manually or use SDK method if available
  // TOS usually: https://{bucket}.{endpoint}/{key}
  const endpoint = config.value.endpoint || `tos-${config.value.region}.volces.com`;
  return `https://${config.value.bucket}.${endpoint}/${filename}`;
};

const stopRequested = ref(false);

const handleStop = () => {
  stopRequested.value = true;
};

// Simple p-limit implementation for concurrency control
const pLimit = (concurrency) => {
  const queue = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()();
    }
  };

  const run = async (fn, resolve, reject) => {
    activeCount++;
    const result = (async () => fn())();
    try {
      const res = await result;
      resolve(res);
    } catch (err) {
      reject(err);
    }
    next();
  };

  const enqueue = (fn, resolve, reject) => {
    queue.push(run.bind(null, fn, resolve, reject));
    if (activeCount < concurrency && queue.length > 0) {
      queue.shift()();
    }
  };

  const generator = (fn) =>
    new Promise((resolve, reject) => {
      enqueue(fn, resolve, reject);
    });

  return generator;
};

const handleBatchProcess = async () => {
  if (!isReady.value) return;
  
  loading.value = true;
  stopRequested.value = false; // Reset stop flag
  processStatus.value = t('processing');
  processedRecords.value = 0;
  totalRecords.value = 0;
  progress.value = 0;

  try {
    const table = await bitable.base.getActiveTable();
    // Use visibleRecordIdList to get all records in current view
    const view = await table.getActiveView();
    const recordIdList = await view.getVisibleRecordIdList();
    
    totalRecords.value = recordIdList.length;
    
    if (totalRecords.value === 0) {
       ElMessage.warning(t('noRecords'));
       loading.value = false;
       return;
    }

    // Process with concurrency limit (e.g., 3 concurrent tasks)
    const limit = pLimit(3);
    const tasks = recordIdList.map(recordId => limit(async () => {
       if (stopRequested.value) return; // Skip if stopped

       try {
         await processOneRecord(table, recordId);
       } catch (err) {
         console.warn(`Record ${recordId} failed:`, err);
       } finally {
         processedRecords.value++;
         progress.value = Math.round((processedRecords.value / totalRecords.value) * 100);
       }
    }));

    await Promise.all(tasks);
    
    if (stopRequested.value) {
        ElMessage.warning(t('stopped'));
        processStatus.value = t('stopped');
    } else {
        ElMessage.success(t('success'));
        processStatus.value = t('done');
    }
    
  } catch (error) {
    console.error(error);
    ElMessage.error(error.message || t('error'));
    processStatus.value = t('error') + ': ' + error.message;
  } finally {
    loading.value = false;
    stopRequested.value = false;
  }
};

// Helper for escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const processOneRecord = async (table, recordId) => {
    // 1. Get Text
    const sourceVal = await table.getCellValue(selectedSourceFieldId.value, recordId);
    
    // Skip if empty
    if (!sourceVal) {
       return; 
    }
    
    // Handle array of segments (Bitable Text field structure)
    // Join all segments to get full text
    const text = Array.isArray(sourceVal) 
      ? sourceVal.map(segment => segment.text).join('') 
      : (sourceVal.text || '');
      
    if (!text) return;
    
    // 2. Parse
    const parser = new TableParser();
    console.log('[Form] Parsing text length:', text.length);
    const { headers, rows, metadata } = parser.parse(text);
    console.log('[Form] Parsed result:', { headers: headers.length, rows: rows.length, metadata });
    
    if (headers.length === 0 && rows.length === 0) {
      console.warn('[Form] No headers or rows found.');
      return;
    }

    // Determine final headers and body
    let finalHeaders = headers;
    let finalRows = rows;
    
    // Determine style based on format
    const isMarkdown = metadata?.isMarkdown;

    // Fallback: If no explicit headers found but rows exist, use first row as header
    // ONLY if NOT Markdown format. For Markdown (KV list style), we keep all data in body.
    if (!isMarkdown && finalHeaders.length === 0 && finalRows.length > 0) {
       finalHeaders = finalRows[0];
       finalRows = finalRows.slice(1);
    }

    console.log('[Form] Final structure:', { headers: finalHeaders, rows: finalRows });

    // 3. Create DOM for screenshot programmatically
    // This avoids Vue template reactivity issues and ensures clean state
    const container = document.createElement('div');
    
    // Style the container to be off-screen or invisible but renderable
    // Using fixed position off-screen is better than opacity 0 for html2canvas
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.zIndex = '-1000';
    // container.style.opacity = '0'; // opacity: 0 can sometimes cause blank renders
    container.style.backgroundColor = '#ffffff'; // Important for transparent backgrounds
    container.style.padding = '20px';
    container.style.width = 'fit-content';
    container.style.pointerEvents = 'none';

    // Construct Table HTML
    let tableHtml = '<table class="styled-table">';
    // Header
    if (finalHeaders.length > 0) {
        tableHtml += '<thead><tr>';
        finalHeaders.forEach(cell => {
            tableHtml += `<th>${escapeHtml(cell)}</th>`;
        });
        tableHtml += '</tr></thead>';
    }
    // Body
    if (finalRows.length > 0) {
        tableHtml += '<tbody>';
        for (const row of finalRows) {
            tableHtml += '<tr>';
            row.forEach(cell => {
                tableHtml += `<td>${escapeHtml(cell)}</td>`;
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';
    }
    tableHtml += '</table>';

    // Define CSS based on format
    let cssContent = '';
    
    if (isMarkdown) {
        // User requested Markdown Style
        cssContent = `
        .styled-table { 
          border-collapse: collapse; 
          width: 100%; 
          font-family: system-ui, -apple-system, BlinkMacSystemFont; 
          background-color: white;
        } 
        
        .styled-table th, 
        .styled-table td { 
          border-bottom: 1px solid #e0e0e0; 
          padding: 10px 8px; 
          text-align: left; 
          background: transparent; 
          font-weight: normal; 
          border-left: none;
          border-right: none;
          border-top: none;
        } 
        
        .styled-table thead { 
          display: none; 
        }
        
        /* Ensure cells can wrap */
        .styled-table td {
          max-width: 400px;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        `;
    } else {
        // Default Style (Nutritional Label etc.)
        cssContent = `
        .styled-table {
          border-collapse: collapse;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          min-width: 300px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
          background-color: white;
        }
        .styled-table thead tr {
          background-color: #f2f3f5;
          color: #1f2329;
          text-align: center;
          font-weight: bold;
        }
        .styled-table th,
        .styled-table td {
          padding: 12px 15px;
          border: 1px solid #dee0e3;
        }
        .styled-table tbody tr {
          border-bottom: 1px solid #dddddd;
        }
        .styled-table tbody tr:nth-of-type(even) {
          background-color: #f3f3f3;
        }
        .styled-table tbody tr:last-of-type {
          border-bottom: 2px solid #009879;
        }
        .styled-table td {
          max-width: 300px;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        `;
    }

    // Inject CSS directly into the container
    const style = `
      <style>
        ${cssContent}
      </style>
    `;

    container.innerHTML = style + tableHtml;
    document.body.appendChild(container);
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 200)); 
    
    try {
        const canvas = await html2canvas(container, {
            scale: 2, // 2x scale for sharpness
            backgroundColor: '#ffffff',
            useCORS: true
        });
        
        // 4. Convert to Blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // 5. Upload
        const filename = `table_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
        let url = '';
        
        if (config.value.provider === 'oss') {
          url = await uploadToOSS(blob, filename);
        } else {
          url = await uploadToTOS(blob, filename);
        }
        
        // 6. Write back
        // Target is Text field, write as text (URL)
        await table.setCellValue(selectedTargetFieldId.value, recordId, [
          { type: 'text', text: url }
        ]);
    } catch (err) {
        console.error('[Form] Error processing record:', err);
        throw err;
    } finally {
        // Clean up DOM
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

</script>

<style scoped>
.plugin-container {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
}

.title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.box-card {
  margin-bottom: 16px;
  background-color: var(--el-card-bg-color);
  border-color: var(--el-border-color-lighter);
}

.card-header {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.action-btn {
  width: 100%;
  margin-top: 16px;
}

.tips {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.status-text {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-align: center;
}

.progress-bar {
  margin-top: 16px;
}

.config-status {
  margin-bottom: 16px;
}
</style>
