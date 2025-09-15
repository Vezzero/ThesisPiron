import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [react()],
    publicDir: 'static',
    base: env.VITE_BASE_URL || '/',
    server: {
      host: true,            // espone su 0.0.0.0 (necessario in container)
      port: 5173,
      strictPort: true,
      hmr: { clientPort: 5173 },
      proxy: {
        '/api': {
          target: 'http://web:8000',  // service name del backend in Compose
          changeOrigin: true,
        }
      }
    }
  })
}
