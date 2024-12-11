<script setup lang="ts">
import type { ResponseMovie } from '@/interfaces';
import httpClient from '@/utils/httpClient';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MovieItem from '../movie-item/Movie-Item.vue';
import { NPagination, NFormItem, NSelect, NButton } from 'naive-ui';
import { useCategoriesStore, useCountriesStore } from '@/stores/base';

const props = defineProps({
  type: {
    type: String
  }
})

const route = useRoute()
const router = useRouter();
const query = route.query
const categoriesStore = useCategoriesStore()
const countriesStore = useCountriesStore()

const listData = ref<ResponseMovie[] | null>(null);
const currentPage = ref<number | null>(query.page ? Number(query.page) : 1);
const country = ref<string>(query.country as string || '');
const category = ref<string>(query.category as string || '');
const year = ref<number | null>(query.year ? Number(query.year) : null);
const totalPage = ref<number>(0);

const categories = computed(() => categoriesStore.categories)
const countries = computed(() => countriesStore.countries)

const getListData = async () => {
  const params = {
    page: currentPage.value,
    country: country.value,
    category: category.value,
    year: year.value
  }
  let urlPath;
  switch (props.type) {
    case 'phim-bo':
      urlPath = '/v1/api/danh-sach/phim-bo'
      break;
    case 'phim-le':
      urlPath = '/v1/api/danh-sach/phim-le'
      break;
    case 'phim-thuyet-minh':
      urlPath = '/v1/api/danh-sach/phim-thuyet-minh'
      break;
    case 'quoc-gia':
    case 'the-loai':
    default:
      urlPath = '/v1/api/danh-sach'
      break;
  }
  const { data } = await httpClient({
    url: urlPath,
    params
  });
  listData.value = data.data.items
  const pagination = data.data.params.pagination;
  totalPage.value = Math.ceil(pagination.totalItems / pagination.totalItemsPerPage);
}

const updateQuery = () => {
  router.replace({
    query: {
      ...route.query, // Giữ lại các query khác
      page: currentPage.value || undefined,
      country: country.value || undefined,
      category: category.value || undefined,
      year: year.value || undefined,
    },
  });
};

const getTitleByType = () => {
  let title;
  switch (props.type) {
    case 'phim-bo':
      title = 'Phim bộ'
      break;
    case 'phim-le':
      title = 'Phim lẻ'
      break;
    case 'phim-thuyet-minh':
      title = 'Phim thuyết minh'
      break;
    case 'quoc-gia':
      const _country = countries.value.find(item => item.slug === country.value);
      title = `Quốc gia ${_country ? _country.name : ''}`

      break
    case 'the-loai':
      const _category = categories.value.find(item => item.slug === category.value);
      title = `Thể loại ${_category ? _category.name : ''}`
      break
  }
  return title
}

onMounted(() => {
  getListData()
})

watch([currentPage, country, category, year], () => {
  getListData(); // Gọi lại hàm khi bất kỳ giá trị nào thay đổi
  updateQuery()
}, { deep: true });
</script>
<template>
  <div class="mt-20 lg:px-8 px-4 lg:py-6 py-2">
    <div class="filter-container">
      <n-space class="flex lg:flex-row flex-col items-center gap-5" vertical>

        <!-- Thể loại -->
        <n-form-item class="flex-1 w-full" label="Thể loại">
          <n-select :filterable="true" v-model:value="category" :clearable="true"
            :options="categories.map((item) => ({ label: item.name, value: item.slug }))" placeholder="Chọn thể loại" />
        </n-form-item>

        <!-- Quốc gia -->
        <n-form-item class="flex-1 w-full" label="Quốc gia">
          <n-select :filterable="true" :clearable="true" v-model:value="country"
            :options="countries.map((item) => ({ label: item.name, value: item.slug }))" placeholder="Chọn quốc gia" />
        </n-form-item>

        <!-- Năm -->
        <n-form-item class="flex-1 w-full" label="Năm">
          <n-select :filterable="true" :clearable="true" v-model:value="year" :options="[
            ...[...Array(15)].map((_, index) => ({
              label: `Năm ${2024 - index}`,
              value: 2024 - index
            }))
          ]" placeholder="Chọn năm" />
        </n-form-item>

        <n-button class="lg:w-auto w-full" type="error">
          Đặt lại
        </n-button>
      </n-space>
    </div>
    <div class="text-2xl font-bold mt-5">
      {{ getTitleByType() }}
    </div>
    <div class="mt-5 grid xl:grid-cols-8 lg:gap-5 gap-2 lg:grid-cols-6 grid-cols-3">
      <div v-for="data in listData" :key="data._id">
        <MovieItem :data="data" />
      </div>
    </div>
    <div class="mt-5 text-center w-full flex justify-center">
      <n-pagination on v-if="currentPage" v-model:page="currentPage" :page-count="totalPage" :page-slot="7" />
    </div>
  </div>
</template>
