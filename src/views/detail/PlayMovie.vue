<script setup lang="ts">
import VideoPlayer from '@/components/player/Player.vue'
import type { ResponseMovie } from '@/interfaces/home.ts'
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
const listEpisodeData = ref<any[]>([])
const listServerData = ref<any[]>([])
const currentEpisode = ref<any>(null)
const currentServer = ref<any>(null)
const episodeRefs = reactive<any[]>([])

const selectedGroup = ref<number>(1)

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

const changeServer = (server: any) => {
  currentServer.value = server
  listEpisodeData.value = server?.server_data.map((episode) => {
    return {
      name: episode.name,
      slug: episode.slug,
      servers: listServerData.value?.map((server) => ({
        name: server.server_name,
        link_embed: episode.link_embed,
        link_m3u8: episode.link_m3u8,
      })),
    }
  })
  updateMetaTitle()
}

const updateSelectedGroup = () => {
  if (!currentServer.value?.server_data || !currentEpisode.value) return
  const index = currentServer.value.server_data.findIndex(
    (ep: any) => ep.slug === currentEpisode.value.slug
  )
  if (index === -1) return
  // nhóm có 50 tập
  selectedGroup.value = Math.floor(index / 50) + 1
}

const playNextEpisode = () => {
  if (!currentServer.value?.server_data || !currentEpisode.value) return
  const index = currentServer.value.server_data.findIndex(
    (ep: any) => ep.slug === currentEpisode.value.slug
  )
  if (index === -1 || index === currentServer.value.server_data.length - 1) return
  const nextEpisode = currentServer.value.server_data[index + 1]
  playEspisode(nextEpisode.slug)
}

const playPreviousEpisode = () => {
  if (!currentServer.value?.server_data || !currentEpisode.value) return
  const index = currentServer.value.server_data.findIndex(
    (ep: any) => ep.slug === currentEpisode.value.slug
  )
  if (index === -1 || index === 0) return
  const previousEpisode = currentServer.value.server_data[index - 1]
  playEspisode(previousEpisode.slug)
}

watch(currentEpisode, () => {
  updateSelectedGroup()
  updateMetaTitle()
  if (playerRef.value) {
    playerRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
})


onMounted(async () => {
  const { data } = await httpClient({
    url: `/v1/api/phim/${slug}`,
  })
  if (!data || !data.data) return
  movieData.value = data?.data
  const filmDetail = movieData.value?.item
  if (!filmDetail) return

  listServerData.value = filmDetail.episodes ?? []
  if (listServerData.value && listServerData.value.length > 0) {
    currentServer.value = listServerData.value[0] || null;
    // Mặc định mở tập phim ở server 1
    listEpisodeData.value = currentServer.value?.server_data.map((episode) => {
      return {
        name: episode.name,
        slug: episode.slug,
        servers: listServerData.value?.map((server) => ({
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
  <div class="pt-16 xl:px-40 px-2 block bg-black" v-if="movieData && playerOptions && currentEpisode">
    <RouterLink :to="`/chi-tiet/${movieData.item.slug}`">
      <div class="flex items-center space-x-2 text-white">
        <font-awesome-icon class="border rounded-full lg:px-3 lg:py-2 px-2 py-1 font-bold"
          :icon="['fas', 'chevron-left']" />
        <div class="lg:text-2xl text-lg my-5">{{ movieData.item.name }}</div>
      </div>
    </RouterLink>
    <div class="w-full h-full rounded-sm overflow-hidden">
      <div class="video-player w-full aspect-video" :key="currentEpisode.slug">
        <VideoPlayer :videoData="{
          playerOptions,
          currentEpisode
        }"
        :next-episode-callback="playNextEpisode"
        :previous-episode-callback="playPreviousEpisode" />
      </div>
    </div>
    <div class="w-full xl:mt-0 mt-5">
      <div class="text-lg italic my-5">Bạn đang xem tập {{ currentEpisode.name }}</div>
      <div>
        <button class="mr-3 p-3 bg-transparent rounded-2xl text-white border font-bold" @click="playPreviousEpisode">
          <font-awesome-icon :icon="['fas', 'step-backward']" />
          <span class="ml-3">Tập trước</span>
        </button>
        <button class="p-3 bg-transparent rounded-2xl text-white border font-bold" @click="playNextEpisode">
          <font-awesome-icon :icon="['fas', 'step-forward']" />
          <span class="ml-3">Tập tiếp theo</span>
        </button>
      </div>

      <n-collapse class="mt-4" default-expanded-names="1">
        <div v-if="listServerData?.length > 0" class="mb-4">
          <div class="mb-2">Server</div>
          <div class="w-full flex flex-wrap gap-4">
            <div :class="currentServer?.server_name === item.server_name ? 'bg-gray-500' : 'bg-gray-900'"
              class=" px-5 py-2 cursor-pointer" v-for="(item, index) in listServerData" @click="changeServer(item)"
              :key="index">
              {{ item.server_name }}
            </div>
          </div>
        </div>
        <n-collapse-item class="font-bold" title="Danh sách tập" name="1">
          <!-- Thanh cuộn ngang chọn nhóm -->
          <div v-if="currentServer?.server_data?.length > 50" class="group-scroll mb-3">
            <button v-for="group in Math.ceil(currentServer.server_data.length / 50)" :key="group"
              :class="['group-button', selectedGroup === group ? 'active' : '']" @click="selectedGroup = group">
              {{ (group - 1) * 50 + 1 }}–{{ Math.min(group * 50, currentServer.server_data.length) }}
            </button>
          </div>

          <!-- Danh sách tập theo nhóm -->
          <div class="w-full flex flex-wrap gap-4 max-h-[65vh] overflow-y-auto">
            <div v-for="(item, index) in currentServer?.server_data.slice(
              (selectedGroup - 1) * 50,
              selectedGroup * 50
            )" :key="item.name" @click="playEspisode(item.slug)" :ref="(el) => updateRefs(el, index)"
              class="px-5 py-2 cursor-pointer text-sm episode-item"
              :class="currentEpisode.slug == item.slug ? 'active' : ''">
              Tập {{ item.name }}
            </div>
          </div>
        </n-collapse-item>

      </n-collapse>
    </div>
  </div>
  <div class="mt-5 xl:px-40 px-2" v-if="movieData">
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
  <div class="mt-5 xl:px-32  px-2">
    <NewFilm />
  </div>
</template>

<style scoped>
.group-scroll {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 6px 0;
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;
}

.group-scroll::-webkit-scrollbar {
  height: 5px;
}

.group-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}

.group-button {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.08);
  color: #b0e633;
  border: 1px solid rgba(176, 230, 51, 0.3);
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.group-button:hover {
  background: rgba(176, 230, 51, 0.15);
}

.group-button.active {
  background: #b0e633;
  color: #000;
  border-color: #b0e633;
}

.episode-item {
  background: rgba(17, 24, 39, 0.85);
  color: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.episode-item:hover {
  background: #b0e633;
  color: #000;
  border-color: #b0e633;
}

.episode-item.active {
  background: #b0e633;
  color: #000;
  border-color: #b0e633;
}

@media (max-width: 768px) {
  .episode-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}
</style>
