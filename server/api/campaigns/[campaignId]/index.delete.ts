import { eq, inArray } from 'drizzle-orm'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { db } from '#server/db'
import { campaigns, characterRelationships, participants, recordings, sessions } from '#server/db/schema'

const WIKI_DIR = join(process.cwd(), 'content', 'wiki')

export default defineEventHandler(async (event) => {
  const campaignId = Number(getRouterParam(event, 'campaignId'))
  if (!campaignId) {
    throw createError({ statusCode: 400, statusMessage: 'campaignId is required' })
  }

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId))
  if (!campaign) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
  }

  // Collect all session IDs for this campaign
  const campaignSessions = await db
    .select({ id: sessions.id, wikiSlug: sessions.wikiSlug })
    .from(sessions)
    .where(eq(sessions.campaignId, campaignId))

  const sessionIds = campaignSessions.map((s) => s.id)

  if (sessionIds.length > 0) {
    // Delete wiki .md files for any sessions that have one
    for (const { wikiSlug } of campaignSessions) {
      if (!wikiSlug) continue
      try {
        await unlink(join(WIKI_DIR, `${wikiSlug}.md`))
      } catch {
        // Already gone — fine
      }
    }

    // Delete in FK-safe order: recordings → characterRelationships → participants → sessions
    await db.delete(recordings).where(inArray(recordings.sessionId, sessionIds))
    await db.delete(characterRelationships).where(inArray(characterRelationships.sessionId, sessionIds))
    await db.delete(participants).where(inArray(participants.sessionId, sessionIds))
    await db.delete(sessions).where(eq(sessions.campaignId, campaignId))
  }

  await db.delete(campaigns).where(eq(campaigns.id, campaignId))

  return { deleted: campaignId }
})
