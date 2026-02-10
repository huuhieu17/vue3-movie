import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createPinia } from 'pinia';
import 'swiper/css';
import 'swiper/css/pagination';
import { register } from 'swiper/element';
import 'video.js/dist/video-js.css';
import { createApp } from 'vue';
import { createMetaManager } from 'vue-meta';
import App from './App.vue';
import './assets/main.css';
import router from './router';
import httpClient from './utils/httpClient';
import { createMemoryHistory, createRouter, createWebHistory, type Router } from 'vue-router';

let app
export function mount(el, props = {} as any) {
  const {apiBaseUrl, routerBase} = props;
  if (apiBaseUrl) {
    // Set the API base URL for the remote app if provided
    httpClient.defaults.baseURL = apiBaseUrl;
  }

  const history = props.routerMode === 'memory'
    ? createMemoryHistory()
    : createWebHistory(props.routerBase ?? '/');

  router.options.history = history as any;

  app = createApp(App, props)
  app.component('FontAwesomeIcon', FontAwesomeIcon)
  app.use(createPinia())
  app.use(router)
  app.use(createMetaManager(true, {}))
  app.mount(el)
  register();
}

export function unmount() {
  if (app) {
    app.unmount()
    app = null
  }
}
