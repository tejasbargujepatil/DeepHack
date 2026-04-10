import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core':   ['three'],
          'three-fiber':  ['@react-three/fiber', '@react-three/drei'],
          'framer':       ['framer-motion'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'recharts':     ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
