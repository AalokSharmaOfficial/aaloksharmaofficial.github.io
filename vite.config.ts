import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
      // Set base to './' for relative paths. This is more robust for GitHub Pages
      // deployments as it ensures asset links are relative to the index.html file.
      base: './',
})