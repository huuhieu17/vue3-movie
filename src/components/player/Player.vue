<template>
  <video class="video-js vjs-luxmty" id="videoPlayer" ref="videoPlayerRef"></video>
</template>

<script setup lang="ts">
import 'videojs-contrib-quality-menu'
import 'videojs-mobile-ui'
import 'videojs-mobile-ui/dist/videojs-mobile-ui.css';
import chromecast from "@silvermine/videojs-chromecast";
import "@silvermine/videojs-chromecast/dist/silvermine-videojs-chromecast.css";
import 'videojs-landscape-fullscreen'
import 'videojs-resolution-switcher-v8'
import '../../assets/vjs-luxmty.min.css'
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
const videoKey = `${slug}-ep${episode}`;

let player;
const defaultOption = {
  autoplay: true,
  controls: true,
  fluid: true,
  preload: 'auto',
  techOrder: ['chromecast', 'html5'], // You may have more Tech, such as Flash or HLS
  plugins: {
    chromecast: {
      addButtonToControlBar: true,
      preloadWebComponents: true,
    },
    videoJsResolutionSwitcher: {
      default: 'high',
      dynamicLabel: true
    }
  },
  playbackRates: [0.5, 1, 1.5, 2],
  currentTimeDisplay: true,
  enableSmoothSeeking: true,
  controlBar: {
        children: ['playToggle', 'skipBackward', 'skipForward', 'volumePanel', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'liveDisplay', 'seekToLive', 'remainingTimeDisplay', 'customControlSpacer', 'playbackRateMenuButton', 'chaptersButton', 'descriptionsButton', 'subsCapsButton', 'audioTrackButton', 'ShareButton', 'hlsQualitySelector', 'QualitySelector', 'pictureInPictureToggle', 'fullscreenToggle'],
    volumePanel: {
      inline: true,
    },
    pictureInPictureToggle: true,

    playbackRateMenuButton: {},
    skipButtons: {
      forward: 10,
      backward: 10
    },
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
          // player.currentTime(Math.max(0, player.currentTime() - 10));
          player.dispose()
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
  player.landscapeFullscreen({
    fullscreen: {
      enterOnRotate: true,
      exitOnRotate: true,
      alwaysInLandscapeMode: true,
      iOS: true
    }
  })
  player.qualityMenu();
  player.mobileUi({
    fullscreen: {
      enterOnRotate: true,
      exitOnRotate: true,
      lockOnRotate: true,
    },
    touchControls: {
      seekSeconds: 10,
      tapTimeout: 300,
    }
  });
  player.chromecast();
};

function setupPlayer() {
  if (player) {
    player.dispose(); // clean up the old player
    videoPlayerRef.value?.dispose()
  }
  chromecast(videojs);
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
  const storagekey = "steve-movie"
  const storageData = localStorage.getItem(storagekey);
  let storageObj = storageData ? JSON.parse(storageData) : {};
  if (!storageObj[videoKey]) {
    storageObj[videoKey] = 0;
  }

  const savedTime = parseFloat(storageObj[videoKey]);
  player.on('loadedmetadata', () => {
    if (!isNaN(savedTime) && savedTime > 0 && savedTime < player.duration()) {
      player.currentTime(savedTime);
      player.play();
    }
  });

  player.on('timeupdate', () => {
    const currentTime = player.currentTime();
    storageObj[videoKey] = currentTime;
    localStorage.setItem(storagekey, JSON.stringify(storageObj));
  });
}

onMounted(async () => {
  if (!document.querySelector('#cast-script')) {
    const script = document.createElement('script')
    script.id = 'cast-script'
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'
    script.async = true
    script.onload = () => {
      setupPlayer()
    }
    document.head.appendChild(script)
  } else {
    setupPlayer()
  }
})

watch(() => episode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    player && player.dispose()
    setupPlayer(); // reinitialize when episode changes
  }
});

onBeforeUnmount(() => {
  videoPlayerRef.value?.dispose?.()
})


</script>
