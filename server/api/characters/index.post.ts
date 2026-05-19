import { db } from '#server/db'
import { characters } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { imageUrl, name, wikiId } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required',
    })
  }

  const [newCharacter] = await db
    .insert(characters)
    .values({
      imageUrl: imageUrl || undefined,
      name,
      wikiId: wikiId || undefined,
    })
    .returning()

  return newCharacter
})
