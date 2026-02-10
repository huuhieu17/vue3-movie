import federation from '@originjs/vite-plugin-federation';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const API_URL = `${env.VITE_API_URL ?? 'http://localhost:4173'}`
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
      cors: true,
      port: 4173, // ensure remote runs on 4173
    },
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      federation({
        name: 'movie_app',
        filename: 'remoteEntry.js',
        exposes: {
          './remote-app': './src/remote-app.ts',
          // expose a tiny module that imports the remote CSS so hosts can
          // explicitly load styles by importing this module before mounting
          './remote-styles': './src/remote-styles.ts',
        },
        shared: ['vue', 'vue-router'],
      }),
    ],
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
