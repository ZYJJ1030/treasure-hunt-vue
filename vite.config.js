import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 确保 BGM 文件夹被正确复制到构建输出
    assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg']
  },
  base: process.env.NODE_ENV === 'production' ? '/treasure-hunt-vue/' : '/'
})