<script setup lang="ts">
import Carousel from './Carousel.vue'
import NewFilm from '@/views/home/NewFilm.vue'
import PhimLe from '@/views/home/PhimLe.vue'
import PhimBo from '@/views/home/PhimBo.vue'
import HoatHinh from '@/views/home/HoatHinh.vue'

import { useMeta } from 'vue-meta'

useMeta({
  title: 'Steve Movie',
  meta: [
    { name: 'description', content: 'Xem chi tiết phim hấp dẫn tại Steve Movie.' },
    { name: 'keywords', content: 'phim lẻ, phim bộ, phim thuyết minh' },
  ],
})
</script>

<template>
  <main>
    <Carousel />

    <NewFilm />

    <PhimLe />

    <PhimBo />

    <HoatHinh />

  </main>
</template>

<style></style>
