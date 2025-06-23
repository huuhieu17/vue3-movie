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
  },
  currentEpisode: any
}

import videojs from 'video.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useRoute } from 'vue-router'; // ⬅️ Để lấy slug & episode từ URL

const route = useRoute(); // ⬅️ Lấy thông tin URL


const props = defineProps<{
  videoData: VideoData,
}>()

// Lấy slug từ route
const slug = route.query.path || route.path.split('/').pop();
const episode = props.videoData.currentEpisode.slug || '1';
const videoKey = `video-progress-${slug}-ep${episode}`;

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


const onPlayerReady = () => {
  console.log(player);

  // player.hlsQualitySelector({ displayCurrentQuality: true });
  // player.mobileUi();
};

function setupPlayer() {
  if (player) {


    player.dispose(); // clean up the old player
    videoPlayerRef.value?.dispose()
    console.log('dispose');
  }

  player = videojs(videoPlayerRef.value!, {
    ...defaultOption,
    ...props.videoData.playerOptions
  }, onPlayerReady);

  if (player && player.pause()) {
    player.play()
  }

  storeCurrentPlayingTime();
}

function storeCurrentPlayingTime() {
  const initialSource = props.videoData.playerOptions.sources?.[0];

  if (initialSource && videoPlayerRef.value?.player) {
    videoPlayerRef.value.player.src(initialSource);
  }


  const savedTime = parseFloat(localStorage.getItem(videoKey) || '0');
  player.on('loadedmetadata', () => {
    if (!isNaN(savedTime) && savedTime > 0 && savedTime < player.duration()) {
      player.currentTime(savedTime);
      player.play();
    }
  });

  player.on('timeupdate', () => {
    const currentTime = player.currentTime();
    localStorage.setItem(videoKey, currentTime.toString());
  });
}

onMounted(() => {
  setupPlayer();
})

watch(() => episode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('var change');

    setupPlayer(); // reinitialize when episode changes
  }
});

onBeforeUnmount(() => {
  videoPlayerRef.value?.dispose?.()
})


</script>
