import { db } from '#server/db'
import { characterRelationships } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { character1Id, character2Id, score } = body

  if (!character1Id || !character2Id || score === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'character1Id, character2Id, and score are required',
    })
  }

  const [newRelationship] = await db
    .insert(characterRelationships)
    .values({
      character1Id,
      character2Id,
      score,
    })
    .returning()

  return newRelationship
})
