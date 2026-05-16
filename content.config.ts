import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // General content — explicitly excludes the wiki/ subdirectory
    content: defineCollection({
      source: { exclude: ['wiki/**'], include: '*.md' },
      type: 'page',
    }),
    wiki: defineCollection({
      schema: z.object({
        date: z.coerce.string(),
        sessionId: z.string().optional(),
        source: z.string().optional(),
        title: z.string(),
      }),
      source: 'wiki/**/*.md',
      type: 'page',
    }),
  },
})
