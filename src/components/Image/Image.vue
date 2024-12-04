<template>
  <div class="lazy-image-wrapper" ref="el">
    <img
      v-if="isVisible"
      :src="src"
      :alt="alt"
      :class="'lazy-image' + className"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
})

const isVisible = ref(false);
const observer = ref(null);
const el = ref(null);

const onIntersect = (entries) => {
  if (entries[0].isIntersecting) {
    isVisible.value = true;
    observer.value.disconnect();
  }
};

onMounted(() => {
  observer.value = new IntersectionObserver(onIntersect);
  observer.value.observe(el.value);
});

onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect();
});

</script>

<style scoped>
.lazy-image-wrapper {
  min-height: 200px;
}
.lazy-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>
