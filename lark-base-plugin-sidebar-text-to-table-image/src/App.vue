<script setup>
  import Form from './views/Form.vue';
  import { useTheme } from './hooks/useTheme';

  // Initialize theme support
  useTheme();
</script>

<template>
  <main>
    <Form />
  </main>
</template>

<style scoped>
  main {
    padding: 0; /* Let Form.vue handle padding */
  }
</style>
