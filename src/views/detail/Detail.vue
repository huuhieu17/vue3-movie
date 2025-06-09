<script setup lang="ts">
import LazyImage from '@/components/Image/Image.vue'
import type { ResponseMovie } from '@/interfaces/home.ts'
import { appConfig } from '@/utils/config.ts'
import httpClient from '@/utils/httpClient.ts'
import { NTabPane, NTabs } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug

const movieData = ref<ResponseMovie | null>(null)

onMounted(async () => {
  const { data } = await httpClient({
    url: `/v1/api/phim/${slug}`,
  })
  movieData.value = data?.data
})
</script>
<template>
  <div class="min-h-screen w-full relative overflow-y-auto" v-if="movieData">
    <div class="absolute top-0 left-0 w-full h-full z-1">
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
      <LazyImage className="!h-full w-full object-cover"
        :src="`${appConfig.imageUrl}/uploads/movies/${movieData.item.poster_url}`" :alt="movieData.item.name" />
    </div>
    <div class="absolute lg:inset-y-[20%] inset-y-[15%] left-0 z-10">
      <div class="w-full lg:p-8 p-2">
        <h1 class="lg:text-5xl text-xl font-bold text-[#B0E633]">
          {{ movieData.item.origin_name }}
        </h1>
        <h2 class="lg:text-3xl text-md font-bold">{{ movieData.item.name }}</h2>
        <div class="mt-5 lg:w-2/3 w-full" v-html="movieData.item.content" />
        <div class=" flex flex-col items-start gap-3 font-bold lg:mt-4 mt-2">
          <div class="items-center flex space-x-1 pl-0">
            <span class="font-bold text-sm">Năm: {{ movieData.item.year }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <span class="font-bold text-sm">Thời lượng: {{ movieData.item.time }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <span class="font-bold text-sm"> {{ movieData.item.episode_current }} / {{ movieData.item.episode_total }}
            </span>
          </div>
          <div class="w-fit items-center text-[#ffff00] lg:border border-0 border-[#ffff00] px-2 py-1 rounded">
            <strong class="mr-2 text-sm">IMDb:</strong>
            <!-- NRate for vote_average -->
            <span class="ml-2 text-sm font-medium">{{ movieData.item.tmdb.vote_average }}</span>
          </div>
        </div>
        <div class="font-bold space-y-2 mt-2">
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'globe']" />
            <span class="font-bold text-sm">Ngôn ngữ: {{ movieData.item.lang }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'video']" />
            <span class="font-bold text-sm">Chất lượng: {{ movieData.item.quality }}</span>
          </div>
        </div>
        <div class="flex lg:mt-6 mt-2 space-x-4">
          <button class="lg:px-6 px-3 lg:py-4 py-2 bg-white text-black font-medium rounded">
            <RouterLink :to="`/play/${movieData.item.slug}`">Xem ngay</RouterLink>
          </button>
        </div>

      </div>
    </div>
  </div>
  <div>
    <div class="" v-if="movieData">
          <div class="lg:p-8 p-2">
            <n-tabs class=" w-full" type="line" animated>
              <n-tab-pane class="flex flex-wrap gap-4" v-for="(data, index) in movieData.item.episodes" :key="index"
                :name="data.server_name" :tab="data.server_name">
                <RouterLink :to="`/play/${movieData.item.slug}?episode=${_data.slug}`"
                  class="cursor-pointer bg-gray-900 rounded-2xl px-4 py-2" v-for="(_data, _index) in data.server_data"
                  :key="_index">
                  Tập {{ _data.name }}
                </RouterLink>
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>
  </div>
</template>
