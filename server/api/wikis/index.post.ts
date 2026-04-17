import { db } from '#server/db'
import { wiki } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { combatStats, content, imageUrl, inventoryStats, relations, summary, title } = body

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and content are required',
    })
  }

  const [newWiki] = await db
    .insert(wiki)
    .values({
      combatStats,
      content,
      imageUrl,
      inventoryStats,
      relations,
      summary,
      title,
    })
    .returning()

  return newWiki
})
