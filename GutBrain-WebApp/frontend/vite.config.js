// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // whenever React does `fetch('/api/...')`, Vite will forward to Django:8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // you can rewrite the path if needed, but here `/api/...` → `/api/...`
      },
    },
  },
})
