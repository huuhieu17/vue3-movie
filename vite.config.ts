import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const API_URL = `${env.VITE_API_URL ?? 'http://localhost:3000'}`
  return {
    server: {
      proxy: {
        // 选项写法
        '/v1/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^v1\/api/, ''),
        },
      },
    },
    plugins: [vue(), vueJsx(), vueDevTools()],
    build: {
      target: 'esnext', // Không cần kiểm tra TypeScript
    },
    optimizeDeps: {
      include: ['videojs-mobile-ui', 'videojs-contrib-quality-menu'],
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
