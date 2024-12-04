<template>
  <component :is="this.$route.meta.layoutComponent">
    <slot></slot>
  </component>
</template>
<script lang="ts">

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Layout",
}

</script>
