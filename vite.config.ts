import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置 base 为 relative path './' 以确保在 GitHub Pages 非根目录下也能正确加载资源
  base: './',
})