<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition duration-300',
      isScrolled ? 'bg-black' : 'bg-transparent',
    ]"
    class="flex items-center justify-between px-8 py-4"
  >
    <div class="flex items-center gap-[50px]">
      <div class="text-2xl font-bold text-white">Vue Movie</div>
      <nav class="hidden sm:flex space-x-6">
        <RouterLink to="/" class="text-gray-300 hover:text-white font-bold">Trang chủ</RouterLink>
        <RouterLink to="/phim-le" class="text-gray-300 hover:text-white font-bold">Phim lẻ</RouterLink>
        <RouterLink to="/phim-bo" class="text-gray-300 hover:text-white font-bold">Phim bộ</RouterLink>
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
              {{ category.name }}
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
              {{ country.name }}
            </div>
          </div>
        </n-popover>
      </nav>
    </div>
    <div class="flex items-center space-x-4">
      <font-awesome-icon class="text-gray-300" :icon="['fas', 'search']" />
      <n-button class="block sm:hidden text-2xl" @click="activateDrawer()">
        <font-awesome-icon class="text-gray-300" :icon="['fas', 'bars']" />
      </n-button>
    </div>
  </header>
  <div>
    <n-drawer v-model:show="activeDrawer" class="w-full" placement="left">
      <n-drawer-content title="">
        <nav class="space-y-6 flex flex-col">
          <RouterLink to="/" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'home']" />
              <span>Trang chủ</span>
            </div>
          </RouterLink>
          <RouterLink to="/phim-le" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'film']" />
              <span>Phim lẻ</span>
            </div>
          </RouterLink>
          <RouterLink to="/phim-bo" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'list']" />
              <span>Phim bộ</span>
            </div>
          </RouterLink>
          <RouterLink to="/the-loai" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'archive']" />
              <span>Thể loại</span>
            </div>
          </RouterLink>
          <RouterLink to="/quoc-gia" class="block text-gray-300 font-bold hover:text-white">
            <div class="flex space-x-4 items-center">
              <font-awesome-icon class="text-gray-300" :icon="['fas', 'globe']" />
              <span>Quốc gia</span>
            </div>
          </RouterLink>
        </nav>
      </n-drawer-content>
    </n-drawer>
  </div>
  <slot></slot>
</template>

<script lang="ts">
import { useCategoriesStore, useCountriesStore } from '@/stores/base'
import { ref } from 'vue'
import { NPopover, NDrawer, NDrawerContent } from 'naive-ui'
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'

export default {
  name: 'GuestLayout',
  components: {
    NPopover,
    NDrawerContent,
    NDrawer,
    RouterLink,
  },
  setup() {
    const categoriesStore = useCategoriesStore()
    const countriesStore = useCountriesStore()
    const activeDrawer = ref(false)
    // Fetch countries when the component is mounted
    onMounted(() => {
      categoriesStore.fetchCategories()
      countriesStore.fetchCountries()
    })
    const categories = computed(() => categoriesStore.categories)
    const countries = computed(() => countriesStore.countries)

    const activateDrawer = () => {
      activeDrawer.value = true
    }
    return {
      activeDrawer,
      overlap: ref(false),
      countries,
      categories,
      activateDrawer,
    }
  },
  data() {
    return {
      isScrolled: false,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
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
