import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite default port (matches backend CORS origin)
    // - Backend CORS must allow this origin
  }
})
