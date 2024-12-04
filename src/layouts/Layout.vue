<template>
  <component :is="this.$route.meta.layoutComponent">
    <slot></slot>
  </component>

</template>
<script lang="ts">
import { RouterView, RouterLink } from 'vue-router'
export default {
  name: "Layout",
}

</script>
