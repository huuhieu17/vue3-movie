<script setup lang="ts">
import Layout from '@/layouts/Layout.vue'
import { RouterView } from 'vue-router'
import { darkTheme } from 'naive-ui'
import { NConfigProvider } from 'naive-ui'
import { onMounted } from 'vue'
import { useHomeDataStore } from '@/stores/base.ts'

onMounted(() => {
  const homeStore = useHomeDataStore();
  homeStore.fetchHomeData();
})
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <Layout>
      <RouterView />
    </Layout>
  </n-config-provider>
</template>
