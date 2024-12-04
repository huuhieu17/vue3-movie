<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { NCarousel, NRate } from 'naive-ui'
import httpClient from '@/utils/httpClient.ts'
import { appConfig } from '@/utils/config.ts'
import LazyImage from '@/components/Image/Image.vue'
const listData = ref([])

onMounted(async () => {
  await getListData()
})

const getListData = async () => {
  const { data = {} } = await httpClient({
    url: '/v1/api/danh-sach/hot',
  })
  listData.value = data.data?.items || []
}
</script>
<template>
  <n-carousel show-arrow autoplay keyboard draggable>
    <div v-for="data in listData" :key="data._id" class="relative w-full lg:aspect-[16/7] aspect-[1] bg-cover">
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent"></div>
      <LazyImage
        className="w-full h-full object-cover"
        :src="`${appConfig.imageUrl}/uploads/movies/${data.poster_url}`"
        :alt="data.name"
      />
      <div class="absolute lg:inset-y-[40%] inset-y-[15%] left-8 z-10">
        <h1 class="lg:text-5xl text-2xl font-bold text-[#B0E633]">{{ data.origin_name }}</h1>
        <h2 class="lg:text-3xl text-lg font-bold">{{ data.name }}</h2>
        <div class="lg:flex block items-center lg:space-x-4 font-bold lg:mt-4 mt-2">
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'calendar']" />
            <span class="font-bold"> {{ data.year }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span class="font-bold"> {{ data.time }} </span>
          </div>
          <div class="items-center flex space-x-1 pl-0">
            <font-awesome-icon :icon="['fas', 'bars']" />
            <span class="font-bold"> {{ data.episode_current }} </span>
          </div>
          <div class="flex items-center">
            <strong class="mr-2">Rating:</strong>
            <!-- NRate for vote_average -->
            <NRate :value="data.tmdb.vote_average / 2" readonly size="small" />
            <span class="ml-2">({{ data.tmdb.vote_count }})</span>
          </div>
        </div>
        <div class="font-bold space-y-2 mt-2">
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'globe']" />
            <span class="font-bold">Ngôn ngữ: {{data.lang}}</span>
          </div>
          <div class="flex items-center space-x-1">
            <font-awesome-icon :icon="['fas', 'video']" />
            <span class="font-bold">Chất lượng: {{data.quality}}</span>
          </div>
        </div>
        <div class="flex mt-6 space-x-4">
          <button class="px-6 py-3 bg-white text-black font-medium rounded">
            <RouterLink :to="`/chi-tiet/${data.slug}`">Xem ngay</RouterLink>
          </button>
        </div>
      </div>
    </div>
  </n-carousel>
</template>
