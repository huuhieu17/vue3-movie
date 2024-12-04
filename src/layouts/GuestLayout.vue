<template>
  <header
    :class="['fixed top-0 left-0 w-full z-50 transition duration-300', isScrolled ? 'bg-black' : 'bg-transparent']"
    class="flex items-center justify-between px-8 py-4">
    <div class="flex items-center gap-[20px]">
      <div class="text-2xl font-bold text-white">Vue Movie</div>
      <nav class="hidden sm:flex space-x-6">
        <a href="#" class="text-gray-300 hover:text-white">Home</a>
        <a href="#" class="text-gray-300 hover:text-white">Movies</a>
        <a href="#" class="text-gray-300 hover:text-white">Series</a>
        <a href="#" class="text-gray-300 hover:text-white">Kids</a>
      </nav>
    </div>
    <div class="flex items-center space-x-4">
      <font-awesome-icon class="text-gray-300" :icon="['fas', 'search']" />
      <img src="https://via.placeholder.com/30" alt="User Avatar" class="rounded-full w-8 h-8">
    </div>
  </header>
  <slot></slot>
</template>

<script>
export default {
  name: "GuestLayout",
  data() {
    return {
      isScrolled: false,
    };
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped></style>
