
import { defineStore } from 'pinia';
import type { Category, CategoriesState, CountriesState, Countries } from '@/interfaces/home.ts'
import httpClient from '@/utils/httpClient.ts'  // Import interface
import { appConfig } from '@/utils/config.ts'

export const useHomeDataStore = defineStore('seoStore', {
  state: () => ({
    seoOnPage: {
      titleHead: '',
      descriptionHead: '',
      og_type: '',
      og_image: [] as string[],
    },
  }),
  actions: {
    setSeoData(seoData: { titleHead: string; descriptionHead: string; og_type: string; og_image: string[] }) {
      this.seoOnPage = seoData;
    },
    async fetchHomeData() {
      try {
        const response = await httpClient({
          url: '/v1/api/home',
        }); // Đổi URL thành endpoint thực tế của bạn
        const {data} = await response.data;
        this.setSeoData(data.seoOnPage);
        appConfig.imageUrl = data.APP_DOMAIN_CDN_IMAGE;
      } catch (error) {
        console.error('Failed to fetch SEO data:', error);
      }
    },
  },
});


export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],  // Dữ liệu categories ban đầu là mảng rỗng
  }),
  actions: {
    setCategories(categories: Category[]) {
      this.categories = categories;  // Gán dữ liệu categories
    },
    async fetchCategories() {
      try {
        const response = await httpClient({
          url: '/v1/api/the-loai',
          method: "GET"
        });
        const {data} = await response.data;
        this.setCategories(data.items);  // Lưu dữ liệu categories vào store
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    },
  },
});

export const useCountriesStore = defineStore('countries', {
  state: (): CountriesState => ({
    countries: [] as { name: string, code: string }[], // Định dạng dữ liệu quốc gia
  }),

  actions: {
    setCountries(countries: Countries[]) {
      this.countries = countries;  // Gán dữ liệu categories
    },
    async fetchCountries() {
      try {
        const response = await httpClient({
          url: '/v1/api/quoc-gia',
          method: "GET"
        });
        const {data} = await response.data;
        this.setCountries(data.items);  // Lưu dữ liệu categories vào store
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    },
  },
});
