import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; local dev and other hosts use '/'.
  base: process.env.VITE_BASE ?? '/',
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
