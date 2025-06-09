<script setup lang="ts">
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import MovieItem from '@/components/movie-item/Movie-Item.vue'
import type {Movie} from "@/interfaces/home.ts";
import { onMounted, ref } from 'vue'
import httpClient from '@/utils/httpClient.ts'

const listData = ref<Movie[] | null>([])

onMounted(async () => {
  const { data } = await httpClient({
    url: '/v1/api/danh-sach/moi',
  })
  listData.value = data.data.items ?? []
})
</script>

<template>
  <section class="lg:px-8 px-2 lg:py-6 py-3 w-full">
    <h2 class="text-2xl font-semibold">
      <RouterLink :to="`/phim-moi`">
        Phim mới
      </RouterLink></h2>
    <swiper
      :slidesPerView="3"
      :spaceBetween="30"
      :pagination="false"
      :navigation="true"
      draggable="true"
      :breakpoints="{
        320: {
          slidesPerView: 3,
          spaceBetween: 5,
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
      <swiper-slide class="mt-4" v-for="data in listData" :key="data._id">
        <MovieItem :data="data" />
      </swiper-slide>
      ...
    </swiper>
  </section>
</template>
