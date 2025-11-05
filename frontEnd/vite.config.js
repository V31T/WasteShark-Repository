import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite default port (matches backend CORS origin)
    // - Backend CORS must allow this origin
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production for security
    minify: 'esbuild', // Fast minification
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
