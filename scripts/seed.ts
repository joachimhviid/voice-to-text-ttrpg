#!/usr/bin/env tsx
/**
 * seed.ts
 *
 * Creates a test campaign with two closed sessions in the DB and writes each
 * transcript as a master.jsonl so the "Generate Wiki" button on the campaign
 * page can be used to test the full flow with multiple sessions.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Run pnpm db:push first if the DB is fresh.
 */

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createId } from '@paralleldrive/cuid2'
import * as schema from '../server/db/schema.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// ── DB connection ─────────────────────────────────────────────────────────────

async function getDb() {
  const envContent = await readFile(join(PROJECT_ROOT, '.env'), 'utf-8').catch(() => '')
  const dbFileName = envContent.match(/^DB_FILE_NAME=(.+)$/m)?.[1]?.trim() ?? 'sessions.db'
  const dbPath = join(PROJECT_ROOT, '.data', dbFileName)

  const sqlite = new Database(dbPath)
  return drizzle({ client: sqlite, schema })
}

// ── Transcript parsing ────────────────────────────────────────────────────────

interface TranscriptLine {
  speaker: string
  text: string
}

function parseTranscript(content: string): TranscriptLine[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return []
      const speaker = line.slice(0, colonIndex).trim()
      const text = line.slice(colonIndex + 1).trim()
      if (!speaker || !text) return []
      return [{ speaker, text }]
    })
}

// ── Session seeder ────────────────────────────────────────────────────────────

type Db = Awaited<ReturnType<typeof getDb>>

async function seedSession(db: Db, campaignId: number, transcriptFile: string, code: string) {
  const sessionId = createId()
  const [session] = await db
    .insert(schema.sessions)
    .values({
      campaignId,
      code,
      id: sessionId,
      status: schema.SessionStatus.CLOSED,
    })
    .returning()

  console.log(`  Created session: ${session!.id} (code=${code})`)

  const transcriptContent = await readFile(transcriptFile, 'utf-8')
  const rawLines = parseTranscript(transcriptContent)
  // Collapse multi-speaker lines like "LUIS and BRENNAN" to the first name
  const lines = rawLines.map((line) => ({
    ...line,
    speaker: line.speaker.split(/\s+and\s+/i)[0]!.trim(),
  }))

  const uniqueSpeakers = [...new Set(lines.map((l) => l.speaker))]
  console.log(`  Speakers: ${uniqueSpeakers.join(', ')}`)

  const speakerToId = new Map<string, number>()
  let isFirst = true
  for (const name of uniqueSpeakers) {
    const [participant] = await db
      .insert(schema.participants)
      .values({
        participantName: name,
        role: isFirst ? schema.ParticipantRole.HOST : schema.ParticipantRole.PARTICIPANT,
        sessionId,
      })
      .returning()
    speakerToId.set(name, participant!.id)
    isFirst = false
  }

  const baseTime = Date.now() - lines.length * 5000
  const jsonlLines = lines.map((line, i) => {
    const participantId = speakerToId.get(line.speaker)!
    const spokenAtUnixMs = baseTime + i * 5000
    return JSON.stringify({
      nickname: line.speaker,
      participantId,
      sessionId,
      spokenAtIso: new Date(spokenAtUnixMs).toISOString(),
      spokenAtUnixMs,
      transcript: line.text,
    })
  })

  const transcriptDir = join(PROJECT_ROOT, '.data', 'storage', 'transcripts', sessionId)
  await mkdir(transcriptDir, { recursive: true })
  await writeFile(join(transcriptDir, 'master.jsonl'), jsonlLines.join('\n') + '\n', 'utf-8')

  console.log(`  Wrote ${jsonlLines.length} lines to master.jsonl`)
  return session!
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const db = await getDb()

  // 1. Create campaign
  const [campaign] = await db
    .insert(schema.campaigns)
    .values({ name: 'Test Campaign' })
    .returning()

  console.log(`Created campaign: "${campaign!.name}" (id=${campaign!.id})`)

  // 2. Seed session 1 — funeral transcript
  console.log('\nSeeding session 1 (The Funeral of Thjazi Fang)...')
  await seedSession(db, campaign!.id, join(__dirname, 'simple_transcript.txt'), 'TST1')

  // 3. Seed session 2 — dungeon heist transcript
  console.log('\nSeeding session 2 (The Vault of Thessan)...')
  await seedSession(db, campaign!.id, join(__dirname, 'dungeon_transcript.txt'), 'TST2')

  console.log(`\nDone! Open the app and navigate to the campaign:`)
  console.log(`  /campaigns/${campaign!.id}`)
  console.log(`  Click "Generate Wiki" on each closed session to test the full flow.`)
}

main().catch((e) => {
  console.error('Seed failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
