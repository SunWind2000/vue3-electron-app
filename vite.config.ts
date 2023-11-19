import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import polyfillExports from 'vite-plugin-electron-renderer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '' : './',
  plugins: [
    vue(),
    electron([{
      entry: "src/client/main.ts"
    }, {
      entry: "src/client/preload.ts"
    }]),
    electronRenderer(),
    polyfillExports()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        charset: false,
        additionalData: '@import "./src/assets/style/global.less";'
      }
    }
  },
  build: {
    emptyOutDir: false,
    outDir: "dist-electron"
  }
}))
