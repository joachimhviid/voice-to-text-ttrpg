import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { wiki } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }

  const [deletedWiki] = await db.delete(wiki).where(eq(wiki.id, id)).returning()

  if (!deletedWiki) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Wiki page not found',
    })
  }

  return deletedWiki
})
