import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { wiki } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  const { combatStats, content, imageUrl, inventoryStats, relations, summary, title } = body

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title and content are required',
    })
  }

  const [updatedWiki] = await db
    .update(wiki)
    .set({
      combatStats,
      content,
      imageUrl,
      inventoryStats,
      relations,
      summary,
      title,
    })
    .where(eq(wiki.id, id))
    .returning()

  if (!updatedWiki) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Wiki page not found',
    })
  }

  return updatedWiki
})
