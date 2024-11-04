import { defineConfig } from 'vite'

export default defineConfig({
  base: '/vapi_test/',  // Add this line
  server: {
    port: 3000,
    open: true
  }
})