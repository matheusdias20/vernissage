import { Agent } from 'node:https'
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
        // keepAlive desligado: o StrictMode do React dispara e cancela requisições em
        // dobro no dev, e reaproveitar socket keep-alive nesse cenário pode corromper
        // a próxima requisição na mesma conexão e devolver 400 do lado da API real.
        agent: new Agent({ keepAlive: false }),
      },
    },
  },
})
