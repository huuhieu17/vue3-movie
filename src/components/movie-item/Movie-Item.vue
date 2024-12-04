<script setup lang="ts">
import { appConfig } from '@/utils/config.ts'
import LazyImage from '@/components/Image/Image.vue'

defineProps({
  data: {
    required: true, // Bắt buộc phải truyền
  },
})
</script>
<template>
  <a
    class="relative overflow-hidden flex flex-col rounded-lg bg-layout shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl max-h-[340px]"
    :href="'/chi-tiet/'+ data.slug"
  >
    <div class="aspect-[2/3] overflow-hidden">
      <span class="lazy-load-image-background" style="transition-delay: 0.2s"
        >
        <LazyImage
          className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
          :src="`${appConfig.imageUrl}/uploads/movies/${data.thumb_url}`"
          :alt="data.name"
      /></span>
    </div>
    <div class="px-2 py-2 text-center">
      <p class="truncate text-[15px] font-medium text-basicLime">{{ data.origin_name }}</p>
      <p class="truncate text-sm font-light text-lightGhostWhite">{{ data.name }}</p>
    </div>
    <div class="absolute left-2 top-2">
      <span
        class="rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-pink-500 to-purple-700 px-2 py-1 text-xs shadow-lg"
        ><span class="relative z-10">{{ data.quality }} + {{ data.lang }}</span
        ><span
          class="absolute inset-0 rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-pink-500 to-purple-700 opacity-50 blur"
        ></span
      ></span>
    </div>
    <div class="absolute right-1 bottom-16">
      <span
        class="rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-red-500 to-yellow-500 px-2 py-1 text-xs shadow-lg"
        ><span class="relative z-10">{{ data.episode_current }}</span
        ><span
          class="absolute inset-0 rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-red-500 to-yellow-700 opacity-50 blur"
        ></span
      ></span>
    </div>
  </a>
</template>
