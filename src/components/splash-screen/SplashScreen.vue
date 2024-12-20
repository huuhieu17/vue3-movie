<!-- SplashScreen.vue -->
<template>
  <div class="splash-screen">
    <div class="img">Steve Movie</div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SplashScreen",
};

</script>

<style scoped>
.splash-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}
.splash-screen.hide {
  opacity: 0;
}
.splash-screen .img {
  width: 100%;
  text-align: center;
  height: auto;
  margin-bottom: 20px;
  color: #fff;
  font-size: 50px;
}
</style>
