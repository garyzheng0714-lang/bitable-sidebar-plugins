<script setup>
  import { ref } from 'vue';
  import Title from './views/Title.vue';
  import Hierarchy from './views/Hierarchy.vue';
  import { useTheme } from './hooks/useTheme.js';
  useTheme();
  const activeTab = ref('title');
</script>

<template>
  <main>
    <el-tabs v-model="activeTab" type="card" class="app-tabs">
      <el-tab-pane label="提取网页Title" name="title">
        <Title />
      </el-tab-pane>
      <el-tab-pane label="榜单层级提取" name="hierarchy">
        <Hierarchy :active="activeTab === 'hierarchy'" />
      </el-tab-pane>
    </el-tabs>
  </main>
</template>

<style scoped>
  main { padding: 12px; }
</style>
