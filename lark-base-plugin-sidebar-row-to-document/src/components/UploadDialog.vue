<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传模板"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      label-width="80px"
      class="upload-form"
    >
      <!-- 文件上传 -->
      <el-form-item label="模板文件">
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".docx"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
        >
          <div v-if="!selectedFile" class="upload-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <p>将 Word 文档拖拽到此处，或<em>点击上传</em></p>
              <p class="upload-hint">只支持 .docx 格式文件，且不超过 3.5MB</p>
            </div>
          </div>
          <div v-else class="file-info">
            <el-icon class="file-icon"><Document /></el-icon>
            <div class="file-details">
              <div class="file-name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
            <el-button 
              text 
              type="danger" 
              @click.stop="removeFile"
              class="remove-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </el-upload>
      </el-form-item>

      <!-- 模板名称 -->
      <el-form-item label="模板名称" prop="name">
        <el-input 
          v-model="form.name" 
          placeholder="请输入模板名称"
          clearable
        />
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          placeholder="选择或输入标签"
          multiple
          filterable
          allow-create
          default-first-option
          class="tag-select"
        >
          <el-option
            v-for="tag in existingTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <!-- 说明 -->
      <el-form-item label="说明">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入模板说明（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleUpload" 
          :loading="uploading"
          :disabled="!selectedFile"
        >
          {{ uploading ? '上传中...' : '上传模板' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Document, Close } from '@element-plus/icons-vue';
import { templateService } from '@/services/templateService';
import { saveAs } from 'file-saver';

// 定义props和emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'uploaded']);

// 响应式数据
const formRef = ref();
const uploadRef = ref();
const uploading = ref(false);
const selectedFile = ref(null);

const form = ref({
  name: '',
  tags: [],
  notes: ''
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 1, max: 50, message: '模板名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const existingTags = computed(() => {
  return templateService.getAllTags();
});

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    resetForm();
  }
});

// 方法
const resetForm = () => {
  form.value = {
    name: '',
    tags: [],
    notes: ''
  };
  selectedFile.value = null;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const handleFileChange = (file) => {
  const raw = file?.raw || file;
  if (!beforeUpload(raw)) {
    selectedFile.value = null;
    if (uploadRef.value) uploadRef.value.clearFiles();
    return;
  }
  selectedFile.value = raw;
  // 自动填充模板名称
  if (!form.value.name && file.name) {
    form.value.name = file.name.replace(/\.docx$/i, '');
  }
};

const beforeUpload = (file) => {
  // 检查文件类型
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.name.toLowerCase().endsWith('.docx');
  
  if (!isDocx) {
    ElMessage.error('只能上传 .docx 格式的文件');
    return false;
  }

  // 检查文件大小（限制为 3.5MB，避免base64后超过localStorage上限）
  const isLt35M = file.size / 1024 / 1024 < 3.5;
  if (!isLt35M) {
    ElMessage.error('文件大小不能超过 3.5MB（受浏览器本地存储限制）');
    return false;
  }

  return true;
};

const removeFile = () => {
  selectedFile.value = null;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择要上传的文件');
    return;
  }
  // 二次校验所选文件
  if (!beforeUpload(selectedFile.value)) {
    return;
  }

  // 表单验证
  try {
    await formRef.value.validate();
  } catch (error) {
    return;
  }

  uploading.value = true;
  
  try {
    // 重要：拿到新建的模板对象（含 id），用于外部自动打开编辑页
    const createdTemplate = await templateService.uploadTemplate(
      selectedFile.value,
      form.value.name,
      form.value.tags,
      form.value.notes
    );
    
    ElMessage.success('模板上传成功');
    // 将新模板对象作为参数抛出，方便外部直接跳转编辑
    emit('uploaded', createdTemplate);
    handleClose();
  } catch (error) {
    console.error('Upload failed:', error);
    const msg = error?.message || '模板上传失败';
    // 如果是存储空间不足，给出兜底：允许用户一键导出再清理
    if (/存储空间不足|quota|配额|QuotaExceeded/i.test(msg)) {
      try {
        await ElMessageBox.confirm(
          '检测到浏览器本地存储空间不足，无法保存新的模板。是否先导出当前所有模板为文件，清理后再试？',
          '空间不足提醒',
          {
            confirmButtonText: '立即导出',
            cancelButtonText: '稍后',
            type: 'warning'
          }
        );
        const blob = templateService.exportTemplatesBlob();
        const ts = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const filename = `templates_backup_${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
        saveAs(blob, filename);
        ElMessage.success('已导出模板，请删除不需要的模板后重试');
      } catch (e) {
        // 用户取消或导出失败
        if (e !== 'cancel') {
          ElMessage.error('导出失败，请稍后重试');
        }
      }
    } else {
      ElMessage.error(msg);
    }
  } finally {
    uploading.value = false;
  }
};

const handleClose = () => {
  if (!uploading.value) {
    dialogVisible.value = false;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.upload-form {
  padding: 0 8px;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--el-border-color);
  border-radius: 6px;
  background-color: var(--el-fill-color-lighter);
  transition: all 0.3s ease;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.upload-text p {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.upload-text em {
  color: var(--el-color-primary);
  font-style: normal;
}

.upload-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-info {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
}

.file-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-right: 12px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.remove-btn {
  padding: 4px;
  margin-left: 8px;
}

.tag-select {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 - 遵循Base开放设计规范 */
@media (max-width: 768px) {
  .upload-form {
    padding: 0 4px;
  }
  
  .dialog-footer {
    gap: 8px;
  }
}

/* 480px宽度适配 */
@media (max-width: 480px) {
  .upload-area :deep(.el-upload-dragger) {
    height: 100px;
  }
  
  .upload-icon {
    font-size: 24px;
  }
  
  .upload-text p {
    font-size: 14px;
  }
  
  .file-info {
    padding: 8px;
  }
  
  .file-icon {
    font-size: 20px;
    margin-right: 8px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 6px;
  }
  
  .dialog-footer .el-button {
    width: 100%;
  }
}

/* 400px以下超窄屏适配 */
@media (max-width: 400px) {
  .upload-form {
    padding: 0 2px;
  }
  
  .upload-area :deep(.el-upload-dragger) {
    height: 80px;
    padding: 8px;
  }
  
  .upload-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .upload-text p {
    font-size: 12px;
    margin: 2px 0;
  }
  
  .upload-hint {
    font-size: 10px;
  }
  
  .file-info {
    padding: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .file-icon {
    font-size: 18px;
    margin-right: 0;
  }
  
  .file-details {
    width: 100%;
  }
  
  .file-name {
    font-size: 12px;
  }
  
  .file-size {
    font-size: 10px;
  }
  
  .remove-btn {
    align-self: flex-end;
    margin-left: 0;
    padding: 2px;
  }
  
  .dialog-footer .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>