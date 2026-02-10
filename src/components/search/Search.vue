<template>
  <div class="w-full">
    <input
      class="w-full mb-5 bg-transparent border border-[#414040] outline-none rounded p-2"
      @input="handleInput"
      type="text"
      placeholder="Nhập từ khoá tìm kiếm..."
    />

      <div v-for="item of listSearchData" :key="item._id" class="mb-5 border border-[#414040] rounded-lg cursor-pointer overflow-hidden">
        <RouterLink :to="'/chi-tiet/'+ item.slug" :key="item._id" >
        <img class="hover:scale-105" :src="`${appConfig.imageUrl}/uploads/movies/${item.poster_url}`" :alt="item.name"/>
        <div class="font-bold my-2 p-2">{{item.name}} - ({{item.origin_name}})</div>
        </RouterLink>
      </div>


  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import httpClient from '@/utils/httpClient.ts'
import { appConfig } from '@/utils/config.ts'

let debounceTimer: NodeJS.Timeout
const listSearchData = ref([])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchData(value)
  }, 1000)
}

const searchData = async (keyword: string) => {
  const {data} = await httpClient({
    url: '/v1/api/tim-kiem',
    params: {
      keyword
    }
  })
  listSearchData.value = data.data?.items ?? [];
}
</script>
