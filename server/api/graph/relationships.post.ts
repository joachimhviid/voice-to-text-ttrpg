import { eq } from 'drizzle-orm'
import { db } from '#server/db'
import { characters, characterRelationships } from '#server/db/schema'

async function findOrCreateCharacter(name: string): Promise<number> {
  const [existing] = await db.select().from(characters).where(eq(characters.name, name))
  if (existing) return existing.id
  const [created] = await db.insert(characters).values({ name }).returning()
  return created!.id
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { characterAName, characterBName, score, sessionId } = body

  if (!characterAName || !characterBName || score === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'characterAName, characterBName, and score are required',
    })
  }

  const [character1Id, character2Id] = await Promise.all([
    findOrCreateCharacter(characterAName),
    findOrCreateCharacter(characterBName),
  ])

  const [relationship] = await db
    .insert(characterRelationships)
    .values({ character1Id, character2Id, score, sessionId: sessionId ?? null })
    .returning()

  return relationship
})
