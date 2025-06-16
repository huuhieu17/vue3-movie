<template>
  <!-- <video-player v-if="videoData && videoData.playerOptions" ref="videoPlayerRef" :autoplay="true" :options="videoData.playerOptions" class="w-full h-full"
    controls :loop="true" /> -->
  <video class="video-js" id="videoPlayer" ref="videoPlayerRef"></video>
</template>

<script setup lang="ts">

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
  }
}

import videojs from 'video.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'videojs-seek-buttons'

import { useRoute } from 'vue-router' // ⬅️ Để lấy slug & episode từ URL

const route = useRoute(); // ⬅️ Lấy thông tin URL
// Lấy slug từ route
const slug = route.params.slug || route.path.split('/').pop();
const episode = route.query.episode || '1';
const videoKey = `video-progress-${slug}-ep${episode}`;

const props = defineProps<{
  videoData: VideoData
}>()

let player;
const defaultOption = {
  autoplay: true,
  controls: true,
  fluid: true,
  preload: 'auto',
  playbackRates: [0.5, 1, 1.5, 2],
  enableSmoothSeeking: true,
  controlBar: {
    skipButtons: {
      forward: 10,
      backward: 10
    }
  },
  userActions: {
    doubleClick: myDoubleClickHandler,
    hotkeys: function (event) {
      // `this` is the player in this context

     switch (event.which) {
      case 32: // Space = Toggle Play/Pause
        event.preventDefault(); // Prevent page scroll
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }
        break;

      case 37: // Left Arrow = Rewind 5 seconds
        event.preventDefault();
        player.currentTime(Math.max(0, player.currentTime() - 10));
        break;

      case 39: // Right Arrow = Forward 5 seconds
        event.preventDefault();
        player.currentTime(Math.min(player.duration(), player.currentTime() + 10));
        break;

      case 77: // M = Mute/Unmute
        player.muted(!player.muted());
        break;

      case 70: // F = Fullscreen toggle
        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
         break;
    }
    }
  },
  language: 'vi'
}
// Refs
const videoPlayerRef = ref<any>(null)

function myDoubleClickHandler(event) {
  // `this` is the player in this context

  videoPlayerRef.value?.pause()
};
// Watch prop and update video source dynamically
watch(
  () => props.videoData,
  (newData) => {
    if (
      newData &&
      newData.playerOptions.sources?.[0]?.src &&
      videoPlayerRef.value?.player
    ) {
      videoPlayerRef.value.player.src(newData.playerOptions.sources[0])
    }
  },
  { immediate: true }
)

const onPlayerReady = () => {
  // player.hlsQualitySelector({ displayCurrentQuality: true });
  // player.mobileUi();
};

onMounted(() => {
  player = videojs(videoPlayerRef.value!, {
    ...defaultOption,
    ...props.videoData.playerOptions
  }, onPlayerReady);
  const initialSource = props.videoData.playerOptions.sources?.[0]

  if (initialSource && videoPlayerRef.value?.player) {
    videoPlayerRef.value.player.src(initialSource)
  }

  const savedTime = parseFloat(localStorage.getItem(videoKey) || '0');
  player.on('loadedmetadata', () => {
    if (!isNaN(savedTime) && savedTime > 0 && savedTime < player.duration()) {
      player.currentTime(savedTime);

      // Nếu muốn tự động play lại:
      player.play();
    }
  });

  // 💾 Ghi lại thời gian đang xem
  player.on('timeupdate', () => {
    const currentTime = player.currentTime();
    localStorage.setItem(videoKey, currentTime.toString());
  });
})

onBeforeUnmount(() => {
  videoPlayerRef.value?.dispose?.()
})


</script>
