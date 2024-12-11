<script setup lang="ts">
import Layout from '@/layouts/Layout.vue'
import { useHomeDataStore } from '@/stores/base.ts'
import { darkTheme, NConfigProvider, NLoadingBarProvider } from 'naive-ui'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
  const homeStore = useHomeDataStore();
  homeStore.fetchHomeData();
})
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <Layout>
        <RouterView />
      </Layout>
    </n-loading-bar-provider>

  </n-config-provider>
</template>
