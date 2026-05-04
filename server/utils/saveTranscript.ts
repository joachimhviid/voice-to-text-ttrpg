import { appendFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PeerParticipantContext } from '../routes/ws/session'
import { z } from 'zod'

const transcriptLineSchema = z.object({
  nickname: z.string(),
  participantId: z.number(),
  sessionId: z.string(),
  spokenAtIso: z.string(),
  spokenAtUnixMs: z.number(),
  transcript: z.string(),
})

type TranscriptLine = z.infer<typeof transcriptLineSchema>

const TRANSCRIPT_DIRECTORY = join(process.cwd(), '.data', 'storage', 'transcripts')
const MASTER_TRANSCRIPT_FILE = 'master.jsonl'
const COMPILED_MASTER_TRANSCRIPT_FILE = 'compiled_master.txt'

export function saveTranscript(participant: PeerParticipantContext, timestamp: number, transcript: string) {
  const normalizedTranscript = transcript.trim()
  if (!normalizedTranscript) {
    return
  }

  const snippet: TranscriptLine = {
    nickname: participant.nickname,
    participantId: participant.participantId,
    sessionId: participant.sessionId,
    spokenAtIso: new Date(timestamp).toISOString(),
    spokenAtUnixMs: timestamp,
    transcript: normalizedTranscript,
  }

  const sessionDirectory = join(TRANSCRIPT_DIRECTORY, participant.sessionId)
  const participantFile = join(sessionDirectory, `${participant.participantId}-${participant.nickname}.jsonl`)

  const serializedSnippet = `${JSON.stringify(snippet)}\n`

  void mkdir(sessionDirectory, { recursive: true })
    .then(() => appendFile(participantFile, serializedSnippet, { encoding: 'utf8', flag: 'a' }))
    .catch((error) => {
      console.error('Failed to persist transcript snippet', {
        error,
        participantId: participant.participantId,
        sessionId: participant.sessionId,
      })
    })
}

/** Merges all per-participant JSONL files into a sorted master.jsonl for the given session. */
export async function combineTranscriptsForSession(sessionId: string): Promise<void> {
  const sessionDirectory = join(TRANSCRIPT_DIRECTORY, sessionId)

  const entries = await readdir(sessionDirectory, { withFileTypes: true })
  const participantTranscriptFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.jsonl') && entry.name !== MASTER_TRANSCRIPT_FILE)
    .map((entry) => join(sessionDirectory, entry.name))

  if (participantTranscriptFiles.length === 0) return

  const fileContents = await Promise.all(
    participantTranscriptFiles.map((filePath) => readFile(filePath, { encoding: 'utf8' })),
  )

  const mergedLines: TranscriptLine[] = []

  for (const content of fileContents) {
    const rawLines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    for (const rawLine of rawLines) {
      try {
        const result = transcriptLineSchema.safeParse(JSON.parse(rawLine))
        if (result.success) mergedLines.push(result.data)
      } catch (error: unknown) {
        console.error('Malformed line in transcript', error)
      }
    }
  }

  mergedLines.sort((a, b) => {
    if (a.spokenAtUnixMs !== b.spokenAtUnixMs) return a.spokenAtUnixMs - b.spokenAtUnixMs
    return a.participantId - b.participantId
  })

  const masterTranscriptPath = join(sessionDirectory, MASTER_TRANSCRIPT_FILE)
  const serialized = mergedLines.map((line) => JSON.stringify(line)).join('\n')
  await writeFile(masterTranscriptPath, serialized ? `${serialized}\n` : '', { encoding: 'utf8' })
}

/** Called from the WebSocket handler — delegates to combineTranscriptsForSession. */
export function combineTranscripts(participant: PeerParticipantContext) {
  void combineTranscriptsForSession(participant.sessionId).catch((error) => {
    console.error('Failed to combine transcripts', {
      error,
      participantId: participant.participantId,
      sessionId: participant.sessionId,
    })
  })
}

/**
 * Reads master.jsonl for a session and compiles it into "Nickname: transcript" lines.
 * Writes compiled_master.txt and returns the compiled content.
 * Bug fix: previously iterated over characters instead of lines.
 */
export async function compileTranscript(sessionId: string): Promise<string> {
  const sessionDirectory = join(TRANSCRIPT_DIRECTORY, sessionId)
  const masterTranscriptPath = join(sessionDirectory, MASTER_TRANSCRIPT_FILE)

  const contents = await readFile(masterTranscriptPath, { encoding: 'utf8' })
  const compiledLines: string[] = []

  const rawLines = contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const rawLine of rawLines) {
    try {
      const result = transcriptLineSchema.safeParse(JSON.parse(rawLine))
      if (result.success) {
        compiledLines.push(`${result.data.nickname}: ${result.data.transcript}`)
      }
    } catch (error: unknown) {
      console.error('Malformed line in transcript', error)
    }
  }

  const compiled = compiledLines.join('\n')
  const compiledMasterTranscriptPath = join(sessionDirectory, COMPILED_MASTER_TRANSCRIPT_FILE)
  await writeFile(compiledMasterTranscriptPath, compiled, { encoding: 'utf8' })

  return compiled
}
