import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import stdLibBrowser from '@emreerdogan/vite-plugin-node-stdlib-browser'

// const standalone = process.env.STANDALONE === 'true'
// 👉 Ahora standalone es el valor por defecto
const standalone = process.env.STANDALONE !== 'false'

export default defineConfig({
  plugins: [vue(), stdLibBrowser()],
  build: {
    lib: {
      entry: standalone ? './src/mount.js' : './src/ChatWidget.vue',
      name: 'ChatWidget',
      fileName: standalone ? 'chat-widget.standalone' : 'chat-widget',
      formats: ['iife']
    },
    rollupOptions: standalone
      ? {} // Standalone => incluye Vue embebido
      : {
          // Lite => externaliza Vue, hay que cargarlo con <script src="vue...">
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            }
          }
        }
  }
})
