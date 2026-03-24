<template>
  <div class="demo-template">
    <h2>创建演示模板</h2>
    <p>点击下面的按钮创建一个演示模板，用于测试编辑器功能：</p>
    
    <el-button type="primary" @click="createDemoTemplate" :loading="creating">
      <el-icon><Plus /></el-icon>
      创建演示模板
    </el-button>
    
    <div v-if="demoTemplate" class="demo-info">
      <h3>演示模板已创建</h3>
      <p>模板名称: {{ demoTemplate.name }}</p>
      <p>模板ID: {{ demoTemplate.id }}</p>
      <el-button @click="openEditor" type="success">
        <el-icon><Edit /></el-icon>
        打开编辑器
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Edit } from '@element-plus/icons-vue';
import { templateService } from '@/services/templateService';

const creating = ref(false);
const demoTemplate = ref(null);

const emit = defineEmits(['open-editor']);

const createDemoTemplate = async () => {
  try {
    creating.value = true;
    
    // 创建一个简单的Word文档内容
    const demoContent = `
      <h1>演示文档模板</h1>
      <p>这是一个用于测试的演示模板。</p>
      <p>您可以在此基础上进行编辑，添加动态字段。</p>
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px;">字段名</td>
          <td style="padding: 8px;">值</td>
        </tr>
        <tr>
          <td style="padding: 8px;">姓名</td>
          <td style="padding: 8px;">{{姓名}}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">电话</td>
          <td style="padding: 8px;">{{电话}}</td>
        </tr>
      </table>
    `;
    
    // 创建一个虚拟的docx文件
    const blob = new Blob([demoContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const file = new File([blob], '演示模板.docx', { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // 上传模板
    const template = await templateService.uploadTemplate(
      file,
      '演示模板',
      ['演示', '测试'],
      '这是一个用于测试编辑器功能的演示模板'
    );
    
    demoTemplate.value = template;
    ElMessage.success('演示模板创建成功！');
    
  } catch (error) {
    console.error('Failed to create demo template:', error);
    ElMessage.error('创建演示模板失败');
  } finally {
    creating.value = false;
  }
};

const openEditor = () => {
  if (demoTemplate.value) {
    emit('open-editor', demoTemplate.value);
  }
};
</script>

<style scoped>
.demo-template {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.demo-info {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.demo-info h3 {
  margin-top: 0;
  color: var(--el-color-success);
}
</style>