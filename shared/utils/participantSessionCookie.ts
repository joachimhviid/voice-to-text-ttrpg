import { z } from 'zod'

export const PARTICIPANT_SESSION_COOKIE = 'participantSession'

export const participantSessionCookieSchema = z.object({
  nickname: z.string().min(1),
  participantId: z.number().int().positive(),
  sessionId: z.string().min(1),
})

export type ParticipantSessionCookie = z.infer<typeof participantSessionCookieSchema>

export const toParticipantSessionCookie = (value: ParticipantSessionCookie) => JSON.stringify(value)

export const parseParticipantSessionCookie = (value: string) => {
  try {
    const parsedValue: unknown = JSON.parse(value)
    return participantSessionCookieSchema.safeParse(parsedValue)
  } catch {
    return {
      data: undefined,
      error: null,
      success: false,
    } as const
  }
}
