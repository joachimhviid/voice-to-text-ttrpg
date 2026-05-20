import { db } from '#server/db'
import { characterRelationships } from '#server/db/schema'

export default defineEventHandler(async () => {
  const edges = await db.select().from(characterRelationships)
  return edges
})
