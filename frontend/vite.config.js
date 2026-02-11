import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    // Plugin to ensure _redirects is copied to dist root
    {
      name: 'copy-redirects',
      closeBundle() {
        const src = resolve(__dirname, 'public/_redirects')
        const dest = resolve(__dirname, 'dist/_redirects')
        try {
          copyFileSync(src, dest)
          console.log('✅ Copied _redirects to dist')
        } catch (e) {
          console.warn('⚠️ Could not copy _redirects:', e.message)
        }
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
