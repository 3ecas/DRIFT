import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; local dev and other hosts use '/'.
  base: process.env.VITE_BASE ?? '/',
  server: {
    // In dev the game talks to the local leaderboard server through this proxy.
    proxy: { '/api': 'http://localhost:8787' },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
