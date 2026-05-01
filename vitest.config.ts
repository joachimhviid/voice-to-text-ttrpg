import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Reset aliases from workspace Vitest config because they've already been set by Nuxt
    alias: {},
  },
})
