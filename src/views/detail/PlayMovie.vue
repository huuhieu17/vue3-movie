<script setup lang="ts">
import VideoPlayer from '@/components/player/Player.vue'
import type { EpisodeData, ResponseMovie } from '@/interfaces/home.ts'
import { appConfig } from '@/utils/config.ts'
import httpClient from '@/utils/httpClient.ts'
import NewFilm from '@/views/home/NewFilm.vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug
const episode = computed(() => route.query.episode)
const movieData = ref<ResponseMovie | null>(null)
const listEpisodeData = ref<any>([])
const currentEpisode = ref<any>(null)
const episodeRefs = reactive<any>([])

const playerOptions = ref<any>({})

const playerRef = ref<any>(null)

const updateRefs = (el: any, index: number) => {
  episodeRefs[index] = el
}

const updateMetaTitle = () => {
  if (movieData.value && currentEpisode.value) {
    document.title = `${movieData.value.item.name} - Tập ${currentEpisode.value.name}`
  } else if (movieData.value) {
    document.title = movieData.value.item.name
  } else {
    document.title = 'Xem Phim Online'
  }
}

const playEspisode = (_episode: string) => {
  router.push({
    query: {
      episode: _episode,
    },
  })
  const episodeByQuery =
    listEpisodeData.value.find((item: any) => item.slug === _episode) || listEpisodeData.value[0]

  currentEpisode.value = episodeByQuery
  if (episodeByQuery) {
    const sourceUrl = episodeByQuery.servers[0].link_m3u8
    playerOptions.value = {
      poster: movieData.value ? appConfig.imageUrl + '/uploads/movies/' + movieData.value.item.poster_url : '',
      sources: [{
        src: sourceUrl,
        type: 'application/x-mpegURL'
      }],

    }
  }
  updateMetaTitle()
}

const scrollToActiveEpisode = () => {
  const activeEpisodeIndex = listEpisodeData.value.findIndex(
    (item: any) => item.slug === currentEpisode.value?.slug,
  )
  if (activeEpisodeIndex !== -1 && episodeRefs && episodeRefs[activeEpisodeIndex]) {
    const parentElement = episodeRefs[activeEpisodeIndex].parentElement
    const parentRect = parentElement.getBoundingClientRect()
    const childRect = episodeRefs[activeEpisodeIndex].getBoundingClientRect()

    // Tính khoảng cách giữa thẻ con và thẻ cha
    const topDistance = childRect.top - parentRect.top
    parentElement.scrollTo({
      top: topDistance,
      behavior: 'smooth',
      animated: true,
    })
  }
}

onMounted(async () => {
  const { data } = await httpClient({
    url: `/v1/api/phim/${slug}`,
  })
  if (!data || !data.data) return
  movieData.value = data?.data
  const filmDetail = movieData.value?.item
  if (!filmDetail) return

  const listEpisodes = filmDetail.episodes ?? []
  if (listEpisodes && listEpisodes.length > 0) {
    // Mặc định mở tập phim ở server 1
    listEpisodeData.value = listEpisodes[0].server_data.map((episode) => {
      return {
        name: episode.name,
        slug: episode.slug,
        servers: listEpisodes?.map((server) => ({
          name: server.server_name,
          link_embed: episode.link_embed,
          link_m3u8: episode.link_m3u8,
        })),
      }
    })
    playEspisode(episode.value as string)
  }
})

watch(episodeRefs, scrollToActiveEpisode)

watch(currentEpisode, () => {
  if (playerRef.value) {

    playerRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }
})
</script>

<template>
  <div class="mt-16 xl:px-20 px-2 xl:flex block" v-if="movieData && playerOptions && currentEpisode">
    <div class="xl:w-4/5 w-full h-full aspect-video">
      <div class="video-player w-full h-full" :key="currentEpisode.slug">
        <VideoPlayer  :videoData="{
            playerOptions,
            currentEpisode
        }" />
      </div>
    </div>
    <div class="xl:w-1/5 w-full lg:px-4 xl:mt-0 mt-5">
      <div class="text-2xl">{{ movieData.item.name }} - Tập {{ currentEpisode.name }}</div>
      <n-collapse class="mt-4" default-expanded-names="1">
        <div v-if="currentEpisode && currentEpisode.servers">
          <div class="mb-2">Server</div>
          <div class="w-full flex flex-wrap gap-4">
            <div class="bg-gray-900 px-5 py-2 cursor-pointer" v-for="(item, index) in currentEpisode.servers"
              :key="index">
              {{ item.name }}
            </div>
          </div>
        </div>
        <n-collapse-item class="font-bold" title="Danh sách tập" name="1">
          <div class="w-full flex flex-wrap gap-4 max-h-[65vh] overflow-y-auto">
            <div @click="playEspisode(item.slug)" :ref="(el) => updateRefs(el, index)"
              class="px-5 py-2 cursor-pointer text-sm"
              :class="currentEpisode.slug == item.slug ? 'bg-gray-500' : 'bg-gray-900'"
              v-for="(item, index) in listEpisodeData" :key="item.name">
              {{ item.name }}
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
  <div class="mt-5 xl:px-20 px-2" v-if="movieData">
    <div class="text-2xl">{{ movieData.item.name }} - {{ movieData.item.origin_name }}</div>
    <div class="flex mt-2 flex-col gap-2">
      <div>
        <font-awesome-icon :icon="['fas', 'calendar']" class="mr-1" /> <span>Năm sản xuất: </span> {{
        movieData.item.year }}
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'clock']" class="mr-1" /> <span>Thời lượng: </span> {{ movieData.item.time }}
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'globe']" class="mr-1" />
        <span>Quốc gia:</span>
        <RouterLink class="mx-2" :to="'/quoc-gia?country=' + movieData.item.country[0].slug">
          {{ ' ' + movieData.item.country[0].name + ' ' }}
        </RouterLink>
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'archive']" class="mr-1" />
        <span>Trạng thái: </span> {{ movieData.item.episode_current }} / {{ movieData.item.episode_total }}
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'list']" class="mr-1" />
        <span>Thể loại: </span> <span class="ml-1" v-for="cate in movieData.item.category" :key="cate.id">
          <RouterLink class="mx-2" :to="'/the-loai?category=' + cate.slug">{{ cate.name }} ·
          </RouterLink>
        </span>
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'user']" class="mr-1" />
        <span>Đạo diễn: </span> <span class="ml-1" v-for="director in movieData.item.director" :key="director">
          {{ director }} ·
        </span>
      </div>
      <div>
        <font-awesome-icon :icon="['fas', 'users']" class="mr-1" />
        <span>Diễn viên: </span> <span class="ml-1" v-for="actor in movieData.item.actor" :key="actor">
          {{ actor }} ·
        </span>
      </div>

    </div>
    <div class="mt-4" v-html="movieData.item.content"></div>
  </div>
  <div class="mt-5 lg:px-12 px-2">
    <NewFilm />
  </div>
</template>
