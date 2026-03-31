<template>
  <video-player id="videoPlayer" class="player-wrapper">
    <video-minimal-skin class="!h-full">
      <video
        ref="videoPlayerRef"
        class="!h-full w-full cursor-pointer"
        playsinline
        preload="auto"
        :controls="false"
        :autoplay="props.videoData.playerOptions.autoplay ?? true"
        :muted="props.videoData.playerOptions.muted ?? false"
        :poster="props.videoData.playerOptions.poster"
        @click="handleVideoClick"
        @touchend="handleVideoTouchEnd"
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
      <button
        v-show="!isPlaying || showCenterButton"
        type="button"
        class="center-toggle-btn"
        :aria-label="isPlaying ? 'Pause video' : 'Play video'"
        @click.stop="togglePlayPause"
      >
        <span v-if="!isPlaying" class="play-icon" />
        <span v-else class="pause-icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
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
const DOUBLE_TAP_DELAY = 280
const SEEK_SECONDS = 10
const BUTTON_VISIBLE_MS = 1600
const videoPlayerRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const showCenterButton = ref(false)
const lastTapAt = ref(0)
const singleTapTimer = ref<number | null>(null)
const hideButtonTimer = ref<number | null>(null)

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
  isPlaying.value = false
  props.nextEpisodeCallback?.()
}

const handlePlay = () => {
  isPlaying.value = true
  showCenterButton.value = false
}

const handlePause = () => {
  isPlaying.value = false
}

const togglePlayPause = () => {
  const video = videoPlayerRef.value
  if (!video) return

  if (video.paused) {
    void video.play().catch(() => {})
    return
  }

  video.pause()
}

const clearHideButtonTimer = () => {
  if (hideButtonTimer.value === null) return
  window.clearTimeout(hideButtonTimer.value)
  hideButtonTimer.value = null
}

const revealCenterButton = () => {
  showCenterButton.value = true
  clearHideButtonTimer()

  if (!isPlaying.value) return

  hideButtonTimer.value = window.setTimeout(() => {
    showCenterButton.value = false
    hideButtonTimer.value = null
  }, BUTTON_VISIBLE_MS)
}

const seekBySeconds = (seconds: number) => {
  const video = videoPlayerRef.value
  if (!video) return

  const duration = Number.isFinite(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER
  video.currentTime = Math.min(duration, Math.max(0, video.currentTime + seconds))
}

const handleVideoClick = () => {
  // Mobile uses touch logic to detect single-tap vs double-tap.
  if (isMobileDevice()) return
  revealCenterButton()
}

const handleVideoTouchEnd = (event: TouchEvent) => {
  if (!isMobileDevice()) return

  const video = videoPlayerRef.value
  const touch = event.changedTouches?.[0]
  if (!video || !touch) return

  const now = Date.now()
  const isDoubleTap = now - lastTapAt.value <= DOUBLE_TAP_DELAY

  if (isDoubleTap) {
    if (singleTapTimer.value !== null) {
      window.clearTimeout(singleTapTimer.value)
      singleTapTimer.value = null
    }

    const rect = video.getBoundingClientRect()
    const isLeftSide = touch.clientX - rect.left < rect.width / 2
    seekBySeconds(isLeftSide ? -SEEK_SECONDS : SEEK_SECONDS)
    lastTapAt.value = 0
    return
  }

  lastTapAt.value = now
  singleTapTimer.value = window.setTimeout(() => {
    revealCenterButton()
    singleTapTimer.value = null
  }, DOUBLE_TAP_DELAY)
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

  isPlaying.value = !video.paused
  video.addEventListener('play', handlePlay)
  video.addEventListener('pause', handlePause)
  video.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen as EventListener)
  video.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange as EventListener)
  window.removeEventListener('keydown', handlePlayerHotkeys)

  if (singleTapTimer.value !== null) {
    window.clearTimeout(singleTapTimer.value)
    singleTapTimer.value = null
  }

  clearHideButtonTimer()

  const video = videoPlayerRef.value
  if (!video) return

  video.removeEventListener('play', handlePlay)
  video.removeEventListener('pause', handlePause)
  video.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen as EventListener)
  video.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen as EventListener)
})


</script>

<style scoped>
.player-wrapper {
  position: relative;
}

.center-toggle-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
}

.center-toggle-btn:active {
  transform: translate(-50%, -50%) scale(0.96);
}

.play-icon {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 16px solid #fff;
  margin-left: 3px;
}

.pause-icon {
  display: flex;
  gap: 6px;
}

.pause-icon > span {
  width: 6px;
  height: 20px;
  background: #fff;
  border-radius: 2px;
}

@media (max-width: 640px) {
  .center-toggle-btn {
    width: 56px;
    height: 56px;
  }
}
</style>
