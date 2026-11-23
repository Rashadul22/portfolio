import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Live site: Vercel at https://rashadul.me/ (root). Vercel sets VERCEL=1 during its build.
// Local dev and the manual GitHub Pages workflow keep the /portfolio/ sub-path.
export default defineConfig({
  base: process.env.VERCEL ? '/' : '/portfolio/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: { main: 'index.html', thesis: 'thesis/index.html' } },
  },
})
