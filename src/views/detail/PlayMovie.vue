<script setup lang="ts">
import type { ResponseMovie } from '@/interfaces/home.ts'
import { appConfig } from '@/utils/config.ts'
import httpClient from '@/utils/httpClient.ts'
import NewFilm from '@/views/home/NewFilm.vue'
import {
  CaptionControl,
  Captions,
  ClickToPlay,
  ControlGroup,
  Controls,
  ControlSpacer,
  DblClickFullscreen,
  DefaultSettings,
  FullscreenControl,
  Hls,
  LoadingScreen,
  MuteControl,
  PipControl,
  PlaybackControl,
  Player,
  Poster,
  Scrim,
  ScrubberControl,
  SettingsControl,
  Spinner,
  TimeProgress,
  Ui
} from '@vime/vue-next'
import { NCollapse, NCollapseItem } from 'naive-ui'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug
const episode = computed(() => route.query.episode)
const movieData = ref<ResponseMovie | null>(null)
const listEpisodeData = ref<any>([])
const videoPlayer = ref<any>(null)
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
    playerOptions.value = {
      poster:
        movieData.value &&
        appConfig.imageUrl + '/uploads/movies/' + movieData.value.item.poster_url,
      sources: episodeByQuery.servers[0].link_m3u8,

    }
  }
  updateMetaTitle()
}

const playNextEspisode = () => {
  const indexOfCurrentEspisode = listEpisodeData.value.findIndex((item: any) => item.slug === currentEpisode.value.slug);
  if(indexOfCurrentEspisode !== -1 && listEpisodeData.value.length > indexOfCurrentEspisode) {
    playEspisode(listEpisodeData.value[indexOfCurrentEspisode + 1].slug)
  }
}

const playPreviousEspisode = () => {
  const indexOfCurrentEspisode = listEpisodeData.value.findIndex((item: any) => item.slug === currentEpisode.value.slug);
  if(indexOfCurrentEspisode !== -1 && indexOfCurrentEspisode > 0) {
    playEspisode(listEpisodeData.value[indexOfCurrentEspisode - 1].slug)
  }
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
  if (videoPlayer.value) {
    videoPlayer.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
    const child = videoPlayer.value.children[0]
    const player =
    console.log(child)
  }
})
</script>

<template>
  <div class="mt-16 xl:px-20 px-2 xl:flex block" v-if="movieData && playerOptions">
    <div class="xl:w-4/5 w-full">
      <div class="video-player w-full" :ref="
          (el) => {
            videoPlayer = el
          }
        ">
        <Player ref="playerRef" autoplay theme="dark" style="--vm-player-theme: #e86c8b;">
          <Hls version="latest" :poster="playerOptions.poster">
            <source :data-src="playerOptions.sources" type="application/x-mpegURL" />
          </Hls>
          <!-- <DefaultUi /> -->
          <Ui>
            <Scrim />
            <Poster />
            <LoadingScreen />
            <ClickToPlay />
            <DblClickFullscreen />
            <Spinner />
            <DefaultSettings />
            <Controls fullWidth pin="bottomLeft">

              <ControlGroup>
                <Captions />
                <ScrubberControl />
              </ControlGroup>

              <ControlGroup space="top" style="align-items: center;">
                <PlaybackControl />
                <MuteControl />
                <TimeProgress />
                <ControlSpacer />
                <PipControl />
                <CaptionControl />
                <SettingsControl tooltip-position="bottom" tooltip-direction="right" />
                <FullscreenControl />
              </ControlGroup>


            </Controls>
          </Ui>
        </Player>
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
    <div class="lg:text-2xl">{{ movieData.item.name }} - {{ movieData.item.origin_name }}</div>
    <div class="flex items-center mt-2 flex-wrap">
      {{ movieData.item.year }} | {{ movieData.item.time }} |
      <RouterLink class="mx-2" :to="'/quoc-gia?country=' + movieData.item.country[0].slug">
        {{ ' ' + movieData.item.country[0].name + ' ' }}
      </RouterLink>
      |
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
