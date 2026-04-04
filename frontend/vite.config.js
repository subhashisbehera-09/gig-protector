import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    port: 5173,
    historyApiFallback: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/workers': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/premiums': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/triggers': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/claims': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})