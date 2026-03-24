<template>
  <div class="field-icon">
    <!-- 文本字段 -->
    <el-icon v-if="fieldType === '1'" color="#409EFF">
      <Document />
    </el-icon>
    
    <!-- 数字字段 -->
    <el-icon v-else-if="fieldType === '2'" color="#67C23A">
      <Odometer />
    </el-icon>
    
    <!-- 单选字段 -->
    <el-icon v-else-if="fieldType === '3'" color="#E6A23C">
      <Select />
    </el-icon>
    
    <!-- 多选字段 -->
    <el-icon v-else-if="fieldType === '4'" color="#F56C6C">
      <Grid />
    </el-icon>
    
    <!-- 日期字段 -->
    <el-icon v-else-if="fieldType === '5'" color="#909399">
      <Calendar />
    </el-icon>
    
    <!-- 复选框字段 -->
    <el-icon v-else-if="fieldType === '7'" color="#67C23A">
      <Check />
    </el-icon>
    
    <!-- 人员字段 -->
    <el-icon v-else-if="fieldType === '11'" color="#409EFF">
      <User />
    </el-icon>
    
    <!-- 电话号码字段 -->
    <el-icon v-else-if="fieldType === '13'" color="#E6A23C">
      <Phone />
    </el-icon>
    
    <!-- 超链接字段 -->
    <el-icon v-else-if="fieldType === '15'" color="#409EFF">
      <Link />
    </el-icon>
    
    <!-- 附件字段 -->
    <el-icon v-else-if="fieldType === '17'" color="#909399">
      <Paperclip />
    </el-icon>
    
    <!-- 关联字段 -->
    <el-icon v-else-if="fieldType === '18'" color="#F56C6C">
      <Connection />
    </el-icon>
    
    <!-- 查找引用字段 -->
    <el-icon v-else-if="fieldType === '19'" color="#E6A23C">
      <Search />
    </el-icon>
    
    <!-- 公式字段 -->
    <el-icon v-else-if="fieldType === '20'" color="#67C23A">
      <Operation />
    </el-icon>
    
    <!-- 创建时间字段 -->
    <el-icon v-else-if="fieldType === '21'" color="#909399">
      <Clock />
    </el-icon>
    
    <!-- 修改时间字段 -->
    <el-icon v-else-if="fieldType === '22'" color="#909399">
      <Timer />
    </el-icon>
    
    <!-- 创建人字段 -->
    <el-icon v-else-if="fieldType === '23'" color="#409EFF">
      <UserFilled />
    </el-icon>
    
    <!-- 修改人字段 -->
    <el-icon v-else-if="fieldType === '24'" color="#409EFF">
      <Avatar />
    </el-icon>
    
    <!-- 默认字段 -->
    <el-icon v-else color="#C0C4CC">
      <QuestionFilled />
    </el-icon>
  </div>
</template>

<script setup>
import {
  Document,
  Odometer,
  Select,
  Grid,
  Calendar,
  Check,
  User,
  Phone,
  Link,
  Paperclip,
  Connection,
  Search,
  Operation,
  Clock,
  Timer,
  UserFilled,
  Avatar,
  QuestionFilled
} from '@element-plus/icons-vue';

// 定义props
defineProps({
  fieldType: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.field-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 16px;
  min-height: 16px;
  max-width: 32px;
  max-height: 32px;
}

.field-icon .el-icon {
  font-size: min(max(12px, 0.8em), 24px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式图标大小 */
@media (max-width: 480px) {
  .field-icon {
    min-width: 14px;
    min-height: 14px;
  }
  
  .field-icon .el-icon {
    font-size: min(max(10px, 0.7em), 20px);
  }
}

@media (max-width: 400px) {
  .field-icon {
    min-width: 12px;
    min-height: 12px;
  }
  
  .field-icon .el-icon {
    font-size: min(max(9px, 0.6em), 18px);
  }
}
</style>