import { eq } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { db } from '#server/db'
import { characterRelationships, sessions } from '#server/db/schema'

const WIKI_DIR = join(process.cwd(), 'content', 'wiki')

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      status: 400,
      statusText: 'No session id provided',
    })
  }

  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId))
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  if (!session.wikiSlug) {
    throw createError({ statusCode: 404, statusMessage: 'No wiki entry exists for this session' })
  }

  const slug = session.wikiSlug

  // Delete the .md file (ignore if already gone)
  try {
    await unlink(join(WIKI_DIR, `${slug}.md`))
  } catch {
    // File already missing — that's fine
  }

  // Remove character relationships for this session
  await db.delete(characterRelationships).where(eq(characterRelationships.sessionId, sessionId))

  // Clear the wikiSlug on the session so "Generate Wiki" becomes available again
  await db.update(sessions).set({ wikiSlug: null }).where(eq(sessions.id, sessionId))

  return { deleted: slug }
})
