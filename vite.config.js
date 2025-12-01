import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ['lodash'],
    },
  })],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@heroicons/react'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'lodash'],
        }
      }
    }
  }
})
