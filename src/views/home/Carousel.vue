<script lang="ts" setup>
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

const getMovieImage = (movie: Movie) => {
  const imagePath = movie.poster_url || movie.thumb_url
  return `${appConfig.imageUrl}/uploads/movies/${imagePath}`
}

const getMovieThumbnail = (movie: Movie) => {
  const imagePath = movie.thumb_url || movie.poster_url
  return `${appConfig.imageUrl}/uploads/movies/${imagePath}`
}


const getVisibleDotIndexes = (total: number, currentIndex: number) => {
  const maxDots = 7

  if (total <= maxDots) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = Math.max(1, currentIndex + 1 - Math.floor(maxDots / 2))
  let end = start + maxDots - 1

  if (end > total) {
    end = total
    start = end - maxDots + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
</script>
<template>
  <n-space v-if="loading" vertical>
    <n-skeleton class="relative w-full lg:aspect-[video] min-h-screen aspect-[1] bg-cover" width="100%" />
  </n-space>
  <n-carousel
    :show-dots="true"
    v-if="!loading"
    keyboard
    draggable
    effect="fade"
    class="focusable w-full relative h-full md:min-h-auto lg:min-h-screen min-h-[60vh] carousel-fade"
    >
    <div v-for="data in listData" :key="data._id"
      class="relative w-full lg:aspect-video min-h-[400px] aspect-[1] bg-cover">
      <img className="w-full !h-full object-cover cover-fade opacity-[0.8]"
        :src="getMovieImage(data)" :alt="data.name" />
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
          <RouterLink :to="`/chi-tiet/${data.slug}`" class="font-bold lg:text-3xl">
            <button class="lg:w-20 w-12 p-3 aspect-square bg-[#B0E633] rounded-full text-black">
              <font-awesome-icon :icon="['fas', 'play']" />
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
    <template #dots="{ total, currentIndex, to }">
      <ul class="custom-dots">
        <li
          v-for="index in getVisibleDotIndexes(total, currentIndex)"
          :key="index"
          class="focusable"
          :class="{ ['is-active']: currentIndex === index - 1}"
          @click="to(index - 1)"
        >
          <img
            v-if="listData && listData[index - 1]"
            class="dot-thumb"
            :src="getMovieThumbnail(listData[index - 1])"
            :alt="listData[index - 1].name"
          />
          <span class="dot-overlay" />
        </li>
      </ul>
    </template>
  </n-carousel>
</template>

<style scoped>
.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}

.custom-dots {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  left: 20px;
  gap: 8px;
}

.custom-dots li {
  position: relative;
  overflow: hidden;
  width: 64px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  transition:
    transform 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.custom-dots li.is-active {
  transform: translateY(-2px);
  border-color: #b0e633;
  box-shadow: 0 8px 20px rgba(176, 230, 51, 0.35);
}

.dot-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dot-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.55) 100%);
}

.custom-dots li.is-active .dot-overlay {
  background: linear-gradient(180deg, rgba(176, 230, 51, 0.06) 0%, rgba(176, 230, 51, 0.32) 100%);
}

@media (min-width: 1024px) {
  .custom-dots {
    left: auto;
    right: 32px;
    bottom: 40%;
    transform: translateY(50%);
    flex-direction: column;
  }

  .custom-dots li.is-active {
    transform: translateX(-4px);
  }
}

@media (max-width: 768px) {
  .custom-dots {
    left: 12px;
    bottom: 12px;
    gap: 6px;
  }

  .custom-dots li {
    width: 48px;
    height: 28px;
    border-radius: 6px;
  }
}
</style>
