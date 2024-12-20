<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import httpClient from '@/utils/httpClient.ts'
import type { ResponseMovie } from '@/interfaces/home.ts'
import { VideoPlayer } from '@videojs-player/vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import NewFilm from '@/views/home/NewFilm.vue'
import { appConfig } from '@/utils/config.ts'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug
const episode = computed(() => route.query.episode)
const movieData = ref<ResponseMovie | null>(null)
const listEpisodeData = ref<any>([])
const videoPlayer = ref(null)
const currentEpisode = ref<any>(null)

const playerOptions = ref<any>({
  autoplay: false,
  controls: true,
  controlBar: { timeDivider: false, durationDisplay: false },
  sources: [],
})

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
    playerOptions.value = {
      autoplay: true,
      controls: true,
      controlBar: { timeDivider: false, durationDisplay: false },
      poster: movieData.value && appConfig.imageUrl + '/uploads/movies/' + movieData.value.item.poster_url,
      sources: [
        {
          src: episodeByQuery.servers[0].link_m3u8,
          type: 'application/x-mpegURL',
        },
      ],
    }
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
    const transformedEpisodes = listEpisodes[0].server_data.map((episode) => {
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
    listEpisodeData.value = transformedEpisodes
    playEspisode(episode.value as string)
  }
})

watch(playerOptions, () => {
  // When playerOptions changes, update the VideoPlayer component
  if (videoPlayer.value) {
  }
})
</script>

<template>
  <div class="mt-16 lg:px-20 px-2 lg:flex block" v-if="movieData">
    <div class="lg:w-4/5 w-full">
      <div class="video-player w-full">
        <VideoPlayer class="!w-full !h-auto aspect-video" ref="videoPlayer" :key="playerOptions"
          :options="playerOptions" />
      </div>
    </div>
    <div class="lg:w-1/5 w-full lg:px-4 lg:mt-0 mt-5">
      <div class="text-2xl">
        {{ movieData.item.name }} - Tập {{ currentEpisode.name }}
      </div>
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
          <div class="w-full flex flex-wrap gap-4">
            <div @click="playEspisode(item.slug)" class="px-5 py-2 cursor-pointer text-sm"
              :class="currentEpisode.slug == item.slug ? 'bg-gray-500' : 'bg-gray-900'" v-for="item in listEpisodeData"
              :key="item.name">
              {{ item.name }}
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
  <div class="mt-5 lg:px-20 px-2" v-if="movieData">
    <div class="lg:text-2xl">{{ movieData.item.name }} - {{ movieData.item.origin_name }}</div>
    <div class="flex items-center mt-2 flex-wrap">
      {{ movieData.item.year }} | {{ movieData.item.time }} | <RouterLink class="mx-2"
        :to="'/quoc-gia?country=' + movieData.item.country[0].slug">{{ ' ' + movieData.item.country[0].name + ' ' }}
      </RouterLink> |
      {{ movieData.item.episode_current }} |
      <span class="ml-1" v-for="cate in movieData.item.category" :key="cate.id">
        <RouterLink class="mx-2" :to="'/the-loai?category=' + cate.slug">{{ cate.name }} ·
        </RouterLink>

      </span>
    </div>
    <div class="mt-4" v-html="movieData.item.content"></div>
  </div>
  <div class="mt-5 lg:px-12 px-2">
    <NewFilm />
  </div>
</template>
