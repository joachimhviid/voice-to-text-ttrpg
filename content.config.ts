import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // General content — explicitly excludes the wiki/ subdirectory
    content: defineCollection({
      source: { include: '*.md', exclude: ['wiki/**'] },
      type: 'page',
    }),
    wiki: defineCollection({
      source: 'wiki/**/*.md',
      type: 'page',
      schema: z.object({
        title: z.string(),
        date: z.coerce.string(),
        sessionId: z.string().optional(),
        source: z.string().optional(),
      }),
    }),
  },
})
