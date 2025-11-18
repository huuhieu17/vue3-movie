<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content }} - Yay!</template>
  </metainfo>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition duration-300',
      isScrolled ? 'bg-black' : 'bg-transparent',
    ]"
    class="flex items-center justify-between lg:px-8 px-4 py-4"
  >
    <div class="flex items-center lg:gap-[50px] gap-[10px]">
      <div class="lg:text-2xl text-xl font-bold text-white">
        <RouterLink to="/">Steve Movie</RouterLink>
      </div>
      <nav class="hidden sm:flex space-x-6">
        <RouterLink to="/" class="text-gray-300 hover:text-white font-bold">Trang chủ</RouterLink>
        <RouterLink to="/phim-le" class="text-gray-300 hover:text-white font-bold"
          >Phim lẻ</RouterLink
        >
        <RouterLink to="/phim-bo" class="text-gray-300 hover:text-white font-bold"
          >Phim bộ</RouterLink
        >
        <RouterLink to="/phim-thuyet-minh" class="text-gray-300 hover:text-white font-bold"
          >Phim thuyết minh
        </RouterLink>
        <n-popover :overlap="overlap" placement="bottom-start" trigger="click">
          <template #trigger>
            <a href="#" class="text-gray-300 hover:text-white font-bold">Thể loại</a>
          </template>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="category in categories"
              :key="category.slug"
              class="bg-transparent text-center rounded-md cursor-pointer hover:font-medium"
            >
              <RouterLink :to="'/the-loai?category=' + category.slug">
                {{ category.name }}
              </RouterLink>
            </div>
          </div>
        </n-popover>
        <n-popover :overlap="overlap" placement="bottom-start" trigger="click">
          <template #trigger>
            <a href="#" class="text-gray-300 hover:text-white font-bold">Quốc gia</a>
          </template>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="country in countries"
              :key="country.slug"
              class="bg-transparent text-center rounded-md cursor-pointer hover:font-medium"
            >
              <RouterLink :to="'/quoc-gia?country=' + country.slug">
                {{ country.name }}
              </RouterLink>
            </div>
          </div>
        </n-popover>
      </nav>
    </div>
    <div class="flex items-center space-x-4">
      <font-awesome-icon
        class="text-gray-300 text-xl"
        @click="drawerSearch = !drawerSearch"
        :icon="['fas', 'search']"
      />
      <button class="block sm:hidden text-2xl" @click="activateDrawer()">
        <font-awesome-icon class="text-gray-300" :icon="['fas', 'bars']" />
      </button>
    </div>
  </header>
  <SplashScreen v-if="isAppLoading" />
  <div>
    <n-drawer v-model:show="activeDrawer" placement="left">
      <n-drawer-content title="">
        <nav class="space-y-6 flex flex-col">
          <RouterLink to="/" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'home']" />
              <span>Trang chủ</span>
            </div>
          </RouterLink>
          <RouterLink to="/phim-le" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'film']" />
              <span>Phim lẻ</span>
            </div>
          </RouterLink>
          <RouterLink to="/phim-bo" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'list']" />
              <span>Phim bộ</span>
            </div>
          </RouterLink>
          <RouterLink to="/phim-thuyet-minh" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'list']" />
              <span>Phim thuyết minh</span>
            </div>
          </RouterLink>
          <RouterLink to="/the-loai" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'archive']" />
              <span>Thể loại</span>
            </div>
          </RouterLink>
          <RouterLink to="/quoc-gia" @click="activeDrawer = false" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'globe']" />
              <span>Quốc gia</span>
            </div>
          </RouterLink>
        </nav>
      </n-drawer-content>
    </n-drawer>
  </div>
  <!-- Drawer Search -->
  <div>
    <n-drawer v-model:show="drawerSearch" :default-width="state.isMobile ? '100%' : '40%'" resizable>
      <n-drawer-content title="Tìm kiếm" :closable="true" :native-scrollbar="false">
        <Search />
      </n-drawer-content>
    </n-drawer>
  </div>
  <slot></slot>
  <footer
    class="mx-auto mt-32 w-full max-w-container px-4 sm:px-6 lg:px-8"
    aria-labelledby="footer-heading"
  >
    <div
      class="items-centers grid grid-cols-1 justify-between gap-4 border-t border-gray-900 py-6 md:grid-cols-2"
    >
      <p class="text-sm/6 text-gray-600 max-md:text-center">
        ©
        <!-- -->2024
        <!-- -->
        Steve
      </p>
      <div
        class="flex items-center justify-center space-x-4 text-sm/6 text-gray-500 md:justify-end"
      >
        <p>Đây chỉ là dự án thử nghiệm</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { useCategoriesStore, useCountriesStore } from '@/stores/base'
import { computed, onMounted, ref, watch, reactive } from 'vue'
import { NDrawer, NDrawerContent, NPopover } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useMeta } from 'vue-meta'
import SplashScreen from '@/components/splash-screen/SplashScreen.vue'
import Search from '@/components/search/Search.vue'
export default {
  name: 'GuestLayout',
  components: {
    SplashScreen,
    NPopover,
    NDrawerContent,
    NDrawer,
    RouterLink,
    Search
  },
  setup() {
    const categoriesStore = useCategoriesStore()
    const countriesStore = useCountriesStore()
    const activeDrawer = ref(false)
    const drawerSearch = ref<boolean>(false)

    const state = reactive({
      isMobile: window.innerWidth <= 768,
    })

    const checkDevice = () => {
      state.isMobile = window.matchMedia('(max-width: 768px)').matches
    }

    useMeta({
      title: 'Steve Movie',
      htmlAttrs: {
        lang: 'vi',
        amp: true,
      },
    })
    // Fetch countries when the component is mounted
    onMounted(() => {
      categoriesStore.fetchCategories()
      countriesStore.fetchCountries()

      checkDevice()
      window.addEventListener('resize', checkDevice)
    })
    const categories = computed(() => categoriesStore.categories)
    const countries = computed(() => countriesStore.countries)

    const activateDrawer = () => {
      activeDrawer.value = true
    }

    watch(drawerSearch, (newVal) => {
      if (newVal) {
        console.log('Drawer opened') // Log để kiểm tra trạng thái drawer
      }
    })
    return {
      activeDrawer,
      drawerSearch,
      overlap: ref(false),
      countries,
      categories,
      activateDrawer,
      state
    }
  },
  data() {
    return {
      isScrolled: false,
      isAppLoading: true,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    const splashScreen = document.querySelector(".splash-screen");
    splashScreen.classList.add("hide");

    setTimeout(() => {
      this.isAppLoading = false;
    }, 1000);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50
    },
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll)
  },
}
</script>

<style scoped></style>
