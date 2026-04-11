import { db } from '#server/db'
import { characters } from '#server/db/schema'

export default defineEventHandler(async () => {
  const nodes = await db.select().from(characters)
  return nodes
})
