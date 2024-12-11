import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import { loadLayoutMiddleware } from './middleware'
import PhimLe from '@/views/list/PhimLe.vue'
import PhimBo from '@/views/list/PhimBo.vue'
import PhimThuyetMinh from '@/views/list/PhimThuyetMinh.vue'
import QuocGia from '@/views/list/QuocGia.vue'
import TheLoai from '@/views/list/TheLoai.vue'
import { useLoadingBar } from 'naive-ui'
import { getLoadingBarInstance } from '@/utils/loading-bar'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/chi-tiet/:slug',
      name: 'chi-tiet',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/detail/Detail.vue'),
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/play/:slug',
      name: 'xem',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/detail/PlayMovie.vue'),
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/phim-le',
      name: 'phim-le',
      component: PhimLe,
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/phim-bo',
      name: 'phim-bo',
      component: PhimBo,
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/phim-thuyet-minh',
      name: 'phim-thuyet-minh',
      component: PhimThuyetMinh,
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/quoc-gia',
      name: 'quoc-gia',
      component: QuocGia,
      meta: {
        layout: 'GuestLayout'
      }
    },
    {
      path: '/the-loai',
      name: 'the-loai',
      component: TheLoai,
      meta: {
        layout: 'GuestLayout'
      }
    },
  ],
})

// Sử dụng loading bar trong hooks
router.beforeEach((to, from, next) => {
  const loadingBar = getLoadingBarInstance();
  if (loadingBar) loadingBar.start();
  next();
});

router.afterEach(() => {
  const loadingBar = getLoadingBarInstance();
  if (loadingBar) loadingBar.finish();
});


router.beforeEach(loadLayoutMiddleware)

export default router
