import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import { loadLayoutMiddleware } from './middleware'

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
  ],
})

router.beforeEach(loadLayoutMiddleware)

export default router
