import { eq, inArray } from 'drizzle-orm'
import { db } from '#server/db'
import { characters, characterRelationships } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const sessionId = event.context.params?.sessionId

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'sessionId is required' })
  }

  const edges = await db
    .select()
    .from(characterRelationships)
    .where(eq(characterRelationships.sessionId, sessionId))

  if (edges.length === 0) {
    return { edges: [], nodes: [] }
  }

  const characterIds = [...new Set([...edges.map((e) => e.character1Id), ...edges.map((e) => e.character2Id)])]

  const nodes = await db.select().from(characters).where(inArray(characters.id, characterIds))

  return { edges, nodes }
})
