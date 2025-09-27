<script lang="ts" setup>
import LazyImage from '@/components/Image/Image.vue'
import type { Movie } from '@/interfaces'
import { appConfig } from '@/utils/config.ts'
import httpClient from '@/utils/httpClient.ts'
import { NCarousel, NSkeleton, NSpace } from 'naive-ui'
import { onMounted, ref } from 'vue'

const listData = ref<Movie[] | null>([])
const loading = ref(true);
onMounted(async () => {
  await getListData()
})

const getListData = async () => {
  const { data = {} } = await httpClient({
    url: '/v1/api/danh-sach/hot',
  })
  listData.value = data.data?.items || []
  loading.value = false;
}
</script>
<template>
  <n-space v-if="loading" vertical>
    <n-skeleton class="relative w-full lg:aspect-[video] min-h-screen aspect-[1] bg-cover" width="100%" />
  </n-space>
  <n-carousel :show-dots="false" v-if="!loading" show-arrow keyboard draggable>
    <div v-for="data in listData" :key="data._id"
      class="relative w-full lg:aspect-[16/7] min-h-[400px] aspect-[1] bg-cover">
      <LazyImage className="w-full !h-full object-cover cover-fade opacity-[0.8]"
        :src="`${appConfig.imageUrl}/uploads/movies/${data.poster_url}`" :alt="data.name" />
      <div class="absolute lg:inset-y-[40%] inset-y-[25%] left-8 z-10">
        <h1 class="lg:text-5xl text-xl font-bold text-[#B0E633]">{{ data.name }}</h1>
        <h2 class="lg:text-2xl text-md font-bold">{{ data.origin_name }}</h2>
        <div class="lg:flex block items-center lg:space-x-4 font-bold lg:mt-4 mt-2">
          <div class="flex items-center text-[#ffff00] lg:border border-0 border-[#ffff00] px-2 py-1 rounded">
            <strong class="mr-2 text-sm">IMDb:</strong>
            <!-- NRate for vote_average -->
            <span class="ml-2 text-sm font-medium">{{ data.tmdb.vote_average }}</span>
          </div>
          <div class="items-center flex space-x-1 lg:border border-0 border-[#fff] px-2 py-1 rounded">
            <font-awesome-icon :icon="['fas', 'calendar']" />
            <span class="font-bold text-sm"> {{ data.year }} </span>
          </div>
          <div class="items-center flex space-x-1 lg:border border-0 border-[#fff] px-2 py-1 rounded">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span class="font-bold text-sm"> {{ data.time }} </span>
          </div>
          <div class="items-center flex space-x-1 lg:border border-0 border-[#fff] px-2 py-1 rounded">
            <font-awesome-icon :icon="['fas', 'bars']" />
            <span class="font-bold text-sm"> {{ data.episode_current }} </span>
          </div>
        </div>
        <div class="flex items-center space-x-2 font-bold lg:mt-4 mt-2">
          <span class="text-[#fff]rounded bg-[#ffffff10]" v-for="cate in data.category" :key="cate.id">
            <RouterLink class="mx-2" :to="'/the-loai?category=' + cate.slug">{{ cate.name }}
            </RouterLink>
          </span>
        </div>
        <div class="flex lg:mt-6 mt-4 space-x-4">
          <button class="lg:w-20 w-12 p-3 aspect-square bg-[#B0E633] rounded-full text-black">
            <RouterLink :to="`/chi-tiet/${data.slug}`" class="font-bold lg:text-3xl">
              <font-awesome-icon :icon="['fas', 'play']" />
            </RouterLink>
          </button>
        </div>
      </div>
    </div>

  </n-carousel>
</template>
