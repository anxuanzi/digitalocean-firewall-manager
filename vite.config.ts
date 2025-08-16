import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use relative paths so the app works when hosted under a subpath (e.g., GitHub Pages)
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
