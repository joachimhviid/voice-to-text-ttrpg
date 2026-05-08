import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          environment: 'node',
          include: ['test/unit/*.{test,spec}.ts'],
          name: 'unit',
        },
      }),
      await defineVitestProject({
        test: {
          environment: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          name: 'nuxt',
        },
      }),
    ],
  },
})
