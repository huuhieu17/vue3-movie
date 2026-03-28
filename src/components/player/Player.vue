<template>
  <video-player id="videoPlayer">
    <video-minimal-skin class="!h-full">
      <video
        ref="videoPlayerRef"
        class="!h-full w-full"
        playsinline
        preload="auto"
        :controls="false"
        :autoplay="props.videoData.playerOptions.autoplay ?? true"
        :muted="props.videoData.playerOptions.muted ?? false"
        :poster="props.videoData.playerOptions.poster"
        @loadedmetadata="restorePlaybackPosition"
        @timeupdate="persistPlaybackPosition"
        @ended="handleEnded"
      >
        <source
          v-if="activeSource?.src"
          :src="activeSource.src"
          :type="activeSource.type || 'application/x-mpegURL'"
        />
      </video>
    </video-minimal-skin>
  </video-player>
</template>

<script setup lang="ts">
import '@videojs/html/video/player';
import '@videojs/html/video/minimal-skin';

type ScreenOrientationWithLock = ScreenOrientation & {
  lock?: (orientation: any) => Promise<void>
  unlock?: () => void
}

type WebkitVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
}

interface VideoData {
  playerOptions: {
    autoplay?: boolean
    controls?: boolean
    muted?: boolean
    language?: string
    controlBar?: any
    playbackRates?: number[]
    sources: Array<{
      type: string
      src: string
    }>
    poster?: string
  },
  currentEpisode: any
}

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  videoData: VideoData,
  nextEpisodeCallback?: Function,
  previousEpisodeCallback?: Function,
}>()

const route = useRoute()
const storageKey = 'steve-movie'
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

const routeSlug = computed(() => String(route.query.path || route.path.split('/').pop() || 'movie'))
const episodeSlug = computed(() => String(props.videoData.currentEpisode?.slug || '1'))
const activeSource = computed(() => props.videoData.playerOptions.sources?.[0])
const videoKey = computed(() => `${routeSlug.value}-ep${episodeSlug.value}`)

const getStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

const restorePlaybackPosition = () => {
  const video = videoPlayerRef.value
  if (!video) return

  const storageObj = getStorage()
  const savedTime = Number(storageObj[videoKey.value] || 0)

  if (!Number.isNaN(savedTime) && savedTime > 0 && savedTime < video.duration) {
    video.currentTime = savedTime
  }

  if (props.videoData.playerOptions.autoplay ?? true) {
    void video.play().catch(() => {})
  }
}

const persistPlaybackPosition = () => {
  const video = videoPlayerRef.value
  if (!video) return

  const storageObj = getStorage()
  storageObj[videoKey.value] = video.currentTime || 0
  localStorage.setItem(storageKey, JSON.stringify(storageObj))
}

const handleEnded = () => {
  props.nextEpisodeCallback?.()
}

const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches

const tryLockLandscape = async () => {
  if (!isMobileDevice()) return

  const orientation = screen.orientation as ScreenOrientationWithLock | undefined
  if (!orientation || typeof orientation.lock !== 'function') return

  await orientation.lock('landscape').catch(() => {})
}

const unlockOrientation = () => {
  const orientation = screen.orientation as ScreenOrientationWithLock | undefined
  orientation?.unlock?.()
}

const isFullscreenActive = () => {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement)
}

const handleFullscreenChange = () => {
  if (isFullscreenActive()) {
    void tryLockLandscape()
    return
  }

  unlockOrientation()
}

const handleWebkitBeginFullscreen = () => {
  void tryLockLandscape()
}

const handleWebkitEndFullscreen = () => {
  unlockOrientation()
}

const toggleFullscreen = () => {
  const video = videoPlayerRef.value as WebkitVideoElement | null
  if (!video) return

  const doc = document as Document & {
    webkitFullscreenElement?: Element | null
    webkitExitFullscreen?: () => Promise<void> | void
  }

  const currentFullscreenEl = doc.fullscreenElement || doc.webkitFullscreenElement
  if (currentFullscreenEl) {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {})
      return
    }

    if (typeof doc.webkitExitFullscreen === 'function') {
      void Promise.resolve(doc.webkitExitFullscreen()).catch(() => {})
    }
    return
  }

  if (video.requestFullscreen) {
    void video.requestFullscreen().catch(() => {})
    return
  }

  if (typeof video.webkitEnterFullscreen === 'function') {
    video.webkitEnterFullscreen()
  }
}

const handlePlayerHotkeys = (event: KeyboardEvent) => {
  const video = videoPlayerRef.value
  if (!video) return

  const target = event.target as HTMLElement | null
  if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
    return
  }

  if (event.code === 'Space') {
    event.preventDefault()
    if (video.paused) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
    return
  }

  if (event.code === 'ArrowLeft') {
    event.preventDefault()
    video.currentTime = Math.max(0, video.currentTime - 10)
    return
  }

  if (event.code === 'ArrowRight') {
    event.preventDefault()
    const duration = Number.isFinite(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER
    video.currentTime = Math.min(duration, video.currentTime + 10)
    return
  }

  if (event.code === 'KeyF') {
    event.preventDefault()
    toggleFullscreen()
  }
}

watch(
  () => activeSource.value?.src,
  async (newSrc, oldSrc) => {
    if (!newSrc || newSrc === oldSrc || !videoPlayerRef.value) return

    await nextTick()
    videoPlayerRef.value.load()
    if (props.videoData.playerOptions.autoplay ?? true) {
      void videoPlayerRef.value.play().catch(() => {})
    }
  },
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange as EventListener)
  window.addEventListener('keydown', handlePlayerHotkeys)

  const video = videoPlayerRef.value
  if (!video) return

  video.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen as EventListener)
  video.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange as EventListener)
  window.removeEventListener('keydown', handlePlayerHotkeys)

  const video = videoPlayerRef.value
  if (!video) return

  video.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen as EventListener)
  video.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen as EventListener)
})


</script>
