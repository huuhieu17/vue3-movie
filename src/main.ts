import './assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import FontAwesomeIcon from '@/utils/fontawesome'
import App from './App.vue'
import router from './router'
import { createMetaManager } from 'vue-meta'
import { register } from 'swiper/element/bundle';
import 'swiper/css';
import 'swiper/css/pagination';
import '@vime/core/themes/default.css';
const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)
app.use(createMetaManager(true, {}))
app.mount('#app')
// register Swiper custom elements
register();
