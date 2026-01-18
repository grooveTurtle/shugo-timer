import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Electron에서 상대 경로로 리소스 로드
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
