<script setup lang="ts">
import LazyImage from '@/components/Image/Image.vue'
import type { Actor, ResponseMovie } from '@/interfaces/home.ts'
import { appConfig } from '@/utils/config.ts'
import httpClient from '@/utils/httpClient.ts'
import { NTabPane, NTabs } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug

const movieData = ref<ResponseMovie | null>(null)
const actors = ref<Actor[] | null>([])

onMounted(async () => {
  const { data } = await httpClient({
    url: `/v1/api/phim/${slug}`,
  })
  movieData.value = data?.data
})

onMounted(async () => {
  const { data } = await httpClient({
    url: `/v1/api/phim/${slug}/peoples`,
  })
  actors.value = data?.data?.peoples || []
})
</script>
<template>
  <div class="h-screen w-full relative" v-if="movieData">
    <div class="absolute top-0 left-0 w-full h-full z-1">
      <LazyImage className="!h-full w-full object-cover cover-fade opacity-[0.8]"
        :src="`${appConfig.imageUrl}/uploads/movies/${movieData.item.poster_url}`" :alt="movieData.item.name" />
    </div>
    <div class="absolute top-0 bottom-0 left-0 z-10 h-content w-full">
      <!-- Flex Container -->
      <div class="xl:flex w-full h-full lg:pt-[5%] py-[15%] lg:space-x-4 space-x-0 bg-black/70 backdrop-blur-sm">
        <!-- Left. Information -->
        <div class="xl:w-1/5 flex flex-col items-center w-full gap-1 lg:p-8 p-2">
          <div class="xl:w-2/3 w-1/3 overflow-hidden relative rounded-lg">
            <span class="lazy-load-image-background" style="transition-delay: 0.2s">
              <LazyImage
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                :src="`${appConfig.imageUrl}/uploads/movies/${movieData.item.thumb_url}`" :alt="movieData.item.name" />
            </span>
            <div class="absolute left-2 top-2">
              <span
                class="rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-pink-500 to-purple-700 px-2 py-1 text-xs shadow-lg"><span
                  class="relative z-10">{{ movieData.item.quality }} + {{ movieData.item.lang }}</span><span
                  class="absolute inset-0 rounded-tl-md rounded-br-md rounded-tr bg-gradient-to-r from-pink-500 to-purple-700 opacity-50 blur"></span></span>
            </div>
          </div>
          <h1 class="xl:text-2xl text-xl font-bold text-[#B0E633]">
            {{ movieData.item.name }}
          </h1>
          <h2 class="xl:text-md text-md font-bold">{{ movieData.item.origin_name }}</h2>
          <div class="flex items-center space-x-2 font-bold lg:mt-4 mt-2">
            <span class="text-[#fff]rounded bg-[#ffffff10]" v-for="cate in movieData.item.category" :key="cate.id">
              <RouterLink class="mx-2" :to="'/the-loai?category=' + cate.slug">{{ cate.name }}
              </RouterLink>
            </span>
          </div>
        </div>
        <!-- Right. Episodes -->
        <div class="lg:p-8 p-2 xl:w-4/5 w-full">
          <div class="flex flex-col lg:space-y-0 space-y-2 lg:flex-row items-center lg:justify-between">
            <div class="flex lg:flex-row flex-col-reverse lg:mt-6 mt-2 lg:justify-between w-full">
              <button class="lg:w-content p-3 bg-[#B0E633] rounded-2xl text-black">
                <RouterLink :to="`/play/${movieData.item.slug}`" class="font-bold lg:text-2xl">
                  <font-awesome-icon :icon="['fas', 'play']" />
                  <span class="ml-3">Xem ngay</span>
                </RouterLink>
              </button>
              <div class="flex lg:flex-row flex-wrap items-center gap-3 font-bold lg:my-4 my-2 ">
                <div class="text-sm flex items-center space-x-1 pl-0">
                  <span class="font-bold">Quốc gia:</span>
                  <RouterLink class="mx-2" :to="'/quoc-gia?country=' + movieData.item.country[0].slug">
                      <span class="font-bold">{{ ' ' + movieData.item.country[0].name + ' ' }}</span>
                  </RouterLink>
                </div>
                <div class="items-center flex space-x-1 pl-0">
                  <span class="font-bold text-sm">Năm: {{ movieData.item.year }} </span>
                </div>
                <div class="items-center flex space-x-1 pl-0">
                  <span class="font-bold text-sm">Thời lượng: {{ movieData.item.time }} </span>
                </div>
                <div class="items-center flex space-x-1 pl-0">
                  <span class="font-bold text-sm"> {{ movieData.item.episode_current }} / {{
                    movieData.item.episode_total
                  }}
                  </span>
                </div>
                <div class="w-fit items-center text-[#ffff00]">
                  <strong class="mr-2 text-sm">IMDb:</strong>
                  <!-- NRate for vote_average -->
                  <span class="ml-2 text-sm font-medium">{{ movieData.item.tmdb.vote_average }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 w-full" v-html="movieData.item.content" />
          <div class="mt-5">
            <n-tabs class=" w-full" type="card" animated>
              <n-tab-pane class="flex flex-wrap gap-4" :name="'Danh sách tập'" :tab="'Danh sách tập'">
                <n-tabs class=" w-full" type="line" animated>
                  <n-tab-pane class="flex flex-wrap gap-4" v-for="(data, index) in movieData.item.episodes" :key="index"
                    :name="data.server_name" :tab="data.server_name">
                    <RouterLink :to="`/play/${movieData.item.slug}?episode=${_data.slug}`"
                      class="cursor-pointer bg-gray-900 rounded-2xl px-4 py-2"
                      v-for="(_data, _index) in data.server_data" :key="_index">
                      Tập {{ _data.name }}
                    </RouterLink>
                  </n-tab-pane>
                </n-tabs>
              </n-tab-pane>
              <n-tab-pane class="flex flex-wrap gap-2" :name="'Actor'" :tab="'Diễn viên'">
                <div v-for="(actor, index) in actors" :key="index" class="flex flex-col items-center gap-4 space-x-2"
                  v-if="actors && actors.length">
                  <div class="w-full object-square overflow-hidden">
                    <LazyImage
                      className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                      :src="`https://image.tmdb.org/t/p/w185${actor.profile_path}&w=64&q=75`" :alt="actor.name" />
                  </div>
                  <span class="font-bold">{{ actor.name }}</span>
                </div>


              </n-tab-pane>
            </n-tabs>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>
