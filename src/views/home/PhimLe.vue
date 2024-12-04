<script setup lang="ts">
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import MovieItem from '@/components/movie-item/Movie-Item.vue'
import { onMounted, ref } from 'vue'
import httpClient from '@/utils/httpClient.ts'

const listData = ref([])

onMounted(async () => {
  const { data } = await httpClient({
    url: '/v1/api/danh-sach/phim-le',
  })
  listData.value = data.data.items ?? []
})
</script>

<template>
  <section class="px-8 py-6 w-full">
    <h2 class="text-2xl font-semibold">Phim lẻ</h2>
    <swiper
      :slidesPerView="3"
      :spaceBetween="30"
      :pagination="false"
      :navigation="true"
      draggable="true"
      :breakpoints="{
        320: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
        1440: {
          slidesPerView: 8,
          spaceBetween: 20,
        },
      }"
      :modules="[Navigation]"
      class="mySwiper"
    >
      <swiper-slide class="mt-4" v-for="data in listData">
        <MovieItem :data="data" />
      </swiper-slide>
      ...
    </swiper>
  </section>
</template>
