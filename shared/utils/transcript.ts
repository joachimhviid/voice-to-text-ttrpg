import { appendFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PeerParticipantContext } from '#shared/types/session'
import { z } from 'zod'
import { diff } from 'diff-match-patch-es'

const transcriptLineSchema = z.object({
  nickname: z.string(),
  participantId: z.number(),
  sessionId: z.string(),
  spokenAtIso: z.string(),
  spokenAtUnixMs: z.number(),
  transcript: z.string(),
})

export type TranscriptLine = z.infer<typeof transcriptLineSchema>

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

export function combineTranscripts(participant: PeerParticipantContext) {
  const sessionDirectory = join(TRANSCRIPT_DIRECTORY, participant.sessionId)

  void readdir(sessionDirectory, { withFileTypes: true })
    .then((entries) => {
      const participantTranscriptFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.jsonl') && entry.name !== MASTER_TRANSCRIPT_FILE)
        .map((entry) => join(sessionDirectory, entry.name))

      if (participantTranscriptFiles.length === 0) {
        return [] as TranscriptLine[]
      }

      return Promise.all(participantTranscriptFiles.map((filePath) => readFile(filePath, { encoding: 'utf8' }))).then(
        (contents) => {
          const mergedLines: TranscriptLine[] = []

          for (const content of contents) {
            const rawLines = content
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)

            for (const rawLine of rawLines) {
              try {
                const result = transcriptLineSchema.safeParse(JSON.parse(rawLine))
                if (result.success) {
                  mergedLines.push(result.data)
                }
              } catch (error: unknown) {
                console.error('Malformed line in transcript', error)
              }
            }
          }

          mergedLines.sort((a, b) => {
            if (a.spokenAtUnixMs !== b.spokenAtUnixMs) {
              return a.spokenAtUnixMs - b.spokenAtUnixMs
            }

            return a.participantId - b.participantId
          })

          return mergedLines
        },
      )
    })
    .then((mergedLines) => {
      const masterTranscriptPath = join(sessionDirectory, MASTER_TRANSCRIPT_FILE)
      const serialized = mergedLines.map((line) => JSON.stringify(line)).join('\n')
      const serializedWithTrailingNewline = serialized ? `${serialized}\n` : ''

      return writeFile(masterTranscriptPath, serializedWithTrailingNewline, { encoding: 'utf8' })
    })
    .catch((error: unknown) => {
      console.error('Failed to combine transcripts', {
        error,
        participantId: participant.participantId,
        sessionId: participant.sessionId,
      })
    })
}

export async function compileTranscript(sessionId: string) {
  const sessionDirectory = join(TRANSCRIPT_DIRECTORY, sessionId)
  const masterTranscriptPath = join(sessionDirectory, MASTER_TRANSCRIPT_FILE)

  const compiledMasterTranscriptLines = await readFile(masterTranscriptPath, { encoding: 'utf8' }).then((contents) => {
    const compiledLines: string[] = []

    for (const content of contents) {
      const rawLines = content
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

      return compiledLines
    }
  })

  if (!compiledMasterTranscriptLines) {
    throw new Error('Failed to compile master transcript')
  }
  const compiledMasterTranscriptPath = join(sessionDirectory, COMPILED_MASTER_TRANSCRIPT_FILE)
  await writeFile(compiledMasterTranscriptPath, compiledMasterTranscriptLines.join('\n'), { encoding: 'utf8' })
}

export function cleanTranscript(lines: TranscriptLine[]): TranscriptLine[] {
  if (lines.length < 2) {
    console.info('Only 1 line. No cleaning necessary')
    return lines
  }

  lines.reduce((prevLine, curLine, index) => {})
  // for (let index = 1; index < lines.length; index++) {
  //   const prevLine = lines[index]
  //   const line = lines[index]
  // }
  return []
}
