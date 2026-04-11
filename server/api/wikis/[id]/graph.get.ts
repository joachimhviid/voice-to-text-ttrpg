import { and, eq, inArray } from 'drizzle-orm'
import { db } from '#server/db'
import { characters, characterRelationships } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const wikiId = Number(event.context.params?.id)

  if (isNaN(wikiId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Wiki ID',
    })
  }

  // 1. Find all characters linked to this wiki page
  const nodes = await db.select().from(characters).where(eq(characters.wikiId, wikiId))

  if (nodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // 2. Find all relationships where BOTH characters are in the list of nodes we just found
  const characterIds = nodes.map(n => n.id)
  const edges = await db
    .select()
    .from(characterRelationships)
    .where(
      and(
        inArray(characterRelationships.character1Id, characterIds),
        inArray(characterRelationships.character2Id, characterIds),
      ),
    )

  return { nodes, edges }
})
