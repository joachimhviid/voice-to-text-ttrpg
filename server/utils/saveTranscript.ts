import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { PeerParticipantContext } from '../routes/ws/session'

type TranscriptLine = {
  nickname: string
  participantId: number
  sessionId: string
  spokenAtIso: string
  spokenAtUnixMs: number
  transcript: string
}

const TRANSCRIPT_DIRECTORY = join(process.cwd(), '.data', 'storage', 'transcripts')

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
