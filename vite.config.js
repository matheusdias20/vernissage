import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/museu-api': {
        target: 'https://openaccess-api.clevelandart.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/museu-api/, ''),
      },
    },
  },
})
