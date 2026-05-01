import { describe, it, expect } from 'vitest'
import type { TranscriptLine } from '#shared/utils/transcript'
import { cleanTranscript } from '#shared/utils/transcript'

describe('transcript utils', () => {
  const lines: TranscriptLine[] = [
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello everyone',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello everyone this',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello everyone this is',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello everyone this is Matt',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'hello everyone this is Matt Mercer',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'welcome',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'welcome to',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'welcome to critical',
    },
    {
      nickname: 'Matt Mercer',
      participantId: 12,
      sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
      spokenAtIso: '2026-04-24T12:39:22.964Z',
      spokenAtUnixMs: 1777034362964,
      transcript: 'welcome to critical role',
    },
  ]
  it('cleans sequential transcript lines', () => {
    const cleanLines = cleanTranscript(lines)

    expect(cleanLines.length).toBe(2)
    expect(cleanLines).toBe([
      {
        nickname: 'Matt Mercer',
        participantId: 12,
        sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
        spokenAtIso: '2026-04-24T12:39:22.964Z',
        spokenAtUnixMs: 1777034362964,
        transcript: 'hello everyone this is Matt Mercer',
      },
      {
        nickname: 'Matt Mercer',
        participantId: 12,
        sessionId: 'qfqbk13z5ivo7e1r79u8osd2',
        spokenAtIso: '2026-04-24T12:39:22.964Z',
        spokenAtUnixMs: 1777034362964,
        transcript: 'welcome to critical role',
      },
    ])
  })
})
