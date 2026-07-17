import federation from '@originjs/vite-plugin-federation';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const API_URL = `${env.VITE_API_URL ?? 'http://localhost:4173'}`

  const plugins = [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            tag === 'video-player' || tag === 'video-skin' || tag === 'video-minimal-skin',
        },
      },
    }),
    vueJsx(),
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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Steve Movie App',
        short_name: 'SteveMovie',
        description: 'An awesome movie app',
        theme_color: '#B0E633',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true
      }
    })
  ]

  const localStorageIsUsable =
    typeof globalThis.localStorage === 'undefined'
    || typeof globalThis.localStorage?.getItem === 'function'

  if (localStorageIsUsable) {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.splice(2, 0, vueDevTools())
  }

  return {
    server: {
      proxy: {
        // 选项写法
        '/v1/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^v1\/api/, ''),
        },
      },
      cors: true,
      port: 4173, // ensure remote runs on 4173
    },
    plugins,
    build: {
      target: 'esnext', // Không cần kiểm tra TypeScript
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
