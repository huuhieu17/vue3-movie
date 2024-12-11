<template>
  <component :is="this.$route.meta.layoutComponent">
    <slot></slot>
  </component>
</template>
<script lang="ts">
import { setLoadingBarInstance } from '@/utils/loading-bar';
import { useLoadingBar } from 'naive-ui';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Layout",
  setup() {

    const loadingbar = useLoadingBar();
    setLoadingBarInstance(loadingbar);
  }
}

</script>
