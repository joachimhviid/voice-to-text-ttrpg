import { eq } from 'drizzle-orm'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import ollama from 'ollama'
import { db } from '#server/db'
import { characters, characterRelationships, sessions } from '#server/db/schema'
import { combineTranscriptsForSession, compileTranscript } from '#server/utils/saveTranscript'

// ── Config ────────────────────────────────────────────────────────────────────

const MODEL = 'gemma4:e4b'
const NUM_CTX = 131072
const WIKI_DIR = join(process.cwd(), 'content', 'wiki')

const SYSTEM_PROMPT = `You are the Lead Scribe of Araman. Your task is to transform raw session transcripts into a structured D&D Wiki entry. You must be accurate to the transcript while maintaining a high-fantasy, chronicler tone.

Rules:
- OOC Filter: Ignore table talk (meta-jokes, food orders, technical issues). Focus only on in-game narrative and mechanics.
- Consistency: Ensure relation scores are derived directly from events in the transcript.
- Content should be detailed prose written like a historical chronicle.
- Summary should be 3–6 concise bullet points covering the major events.
- Relations must list every meaningful character pair with a score from -100 (enemies) to 100 (close allies) and a brief reasoning.

The transcript is formatted as Speaker: transcript`

// ── Types ─────────────────────────────────────────────────────────────────────

interface Relation {
  characterA: string
  characterB: string
  rating: number
  context: string
}

interface WikiEntry {
  title: string
  content: string
  summary: string[]
  relations: Relation[]
}

// ── JSON Schema for Ollama structured output ──────────────────────────────────

const wikiSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
    summary: { type: 'array', items: { type: 'string' } },
    relations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          characterA: { type: 'string' },
          characterB: { type: 'string' },
          rating: { type: 'integer', minimum: -100, maximum: 100 },
          context: { type: 'string' },
        },
        required: ['characterA', 'characterB', 'rating', 'context'],
      },
    },
  },
  required: ['title', 'content', 'summary', 'relations'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function findOrCreateCharacter(name: string): Promise<number> {
  const [existing] = await db.select().from(characters).where(eq(characters.name, name))
  if (existing) return existing.id
  const [created] = await db.insert(characters).values({ name }).returning()
  return created!.id
}

function buildMarkdown(entry: WikiEntry, sessionId: string): string {
  const date = new Date().toISOString().split('T')[0]
  const summaryLines = entry.summary.map((s) => `- ${s}`).join('\n')

  return `---
title: "${entry.title}"
date: "${date}"
sessionId: "${sessionId}"
---

## Chronicle

${entry.content}

## Summary

${summaryLines}
`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'sessionId is required' })
  }

  // 1. Verify session exists
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId))
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  // 2. Combine participant transcripts into master.jsonl (idempotent if already done)
  try {
    await combineTranscriptsForSession(sessionId)
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'No transcript files found for this session' })
  }

  // 3. Compile master.jsonl → "Speaker: transcript" format
  let transcript: string
  try {
    transcript = await compileTranscript(sessionId)
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'Could not compile transcript — has the session recorded any speech?' })
  }

  if (!transcript.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Transcript is empty' })
  }

  // 4. Generate wiki entry via Ollama
  let entry: WikiEntry
  try {
    const response = await ollama.chat({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here is the session transcript:\n\n${transcript}` },
      ],
      format: wikiSchema,
      options: { num_ctx: NUM_CTX },
    })
    entry = JSON.parse(response.message.content) as WikiEntry
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e))
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      throw createError({ statusCode: 503, statusMessage: 'Could not reach Ollama — make sure it is running (ollama serve)' })
    }
    throw createError({ statusCode: 500, statusMessage: `Ollama error: ${err.message}` })
  }

  // 5. Write .md to content/wiki/
  const slug = buildSlug(entry.title)
  const mdPath = join(WIKI_DIR, `${slug}.md`)
  await mkdir(WIKI_DIR, { recursive: true })
  await writeFile(mdPath, buildMarkdown(entry, sessionId), 'utf-8')

  // 6. Save character relations to DB
  for (const relation of entry.relations) {
    const [character1Id, character2Id] = await Promise.all([
      findOrCreateCharacter(relation.characterA),
      findOrCreateCharacter(relation.characterB),
    ])
    await db.insert(characterRelationships).values({ character1Id, character2Id, score: relation.rating, sessionId })
  }

  // 7. Store the wiki slug on the session for easy linking
  await db.update(sessions).set({ wikiSlug: slug }).where(eq(sessions.id, sessionId))

  return { slug }
})
