<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { NCarousel, NRate, NSpace, NSkeleton } from 'naive-ui'
import httpClient from '@/utils/httpClient.ts'
import { appConfig } from '@/utils/config.ts'
import LazyImage from '@/components/Image/Image.vue'

const listData = ref([])
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
    <n-skeleton class="relative w-full lg:aspect-[16/7] min-h-[400px] aspect-[1] bg-cover" width="100%" />
  </n-space>
  <n-carousel :show-dots="false"  v-if="!loading" show-arrow keyboard draggable>
    <div v-for="data in listData" :key="data._id" class="relative w-full lg:aspect-[16/7] min-h-[400px] aspect-[1] bg-cover">
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
      <LazyImage
        className="w-full !h-full object-cover"
        :src="`${appConfig.imageUrl}/uploads/movies/${data.poster_url}`"
        :alt="data.name"
      />
      <div class="absolute lg:inset-y-[40%] inset-y-[25%] left-8 z-10">
        <h1 class="lg:text-5xl text-xl font-bold text-[#B0E633]">{{ data.origin_name }}</h1>
        <h2 class="lg:text-3xl text-md font-bold">{{ data.name }}</h2>
        <div class="lg:flex block items-center lg:space-x-4 font-bold lg:mt-4 mt-2">
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'calendar']" />
            <span class="font-bold text-sm"> {{ data.year }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span class="font-bold text-sm"> {{ data.time }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'bars']" />
            <span class="font-bold text-sm"> {{ data.episode_current }} </span>
          </div>
          <div class="flex items-center">
            <strong class="mr-2 text-sm">Rating:</strong>
            <!-- NRate for vote_average -->
            <NRate :value="data.tmdb.vote_average / 2" readonly size="small" />
            <span class="ml-2 text-sm">({{ data.tmdb.vote_count }})</span>
          </div>
        </div>
        <div class="font-bold space-y-2 mt-2">
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'globe']" />
            <span class="font-bold text-sm">Ngôn ngữ: {{data.lang}}</span>
          </div>
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'video']" />
            <span class="font-bold text-sm">Chất lượng: {{data.quality}}</span>
          </div>
        </div>
        <div class="flex lg:mt-6 mt-2 space-x-4">
          <button class="lg:px-6 px-3 lg:py-3 py-2 bg-white text-black rounded">
            <RouterLink :to="`/chi-tiet/${data.slug}`" class="font-bold">Chi tiết</RouterLink>
          </button>
        </div>
      </div>
    </div>
  </n-carousel>
</template>
