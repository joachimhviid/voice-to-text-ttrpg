import { db } from '#server/db'
import { ParticipantRole, participants, sessions } from '#server/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { generateInviteCode } from '#server/utils/generateCode'
import { PARTICIPANT_SESSION_COOKIE, toParticipantSessionCookie } from '#shared/utils/participantSessionCookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ nickname: string }>(event)

  const inviteCode = generateInviteCode()
  const id = createId()

  db.insert(sessions)
    .values({
      code: inviteCode,
      id,
    })
    .run()

  const participant = db
    .insert(participants)
    .values({
      participantName: body.nickname,
      role: ParticipantRole.HOST,
      sessionId: id,
    })
    .returning({
      id: participants.id,
      participantName: participants.participantName,
      sessionId: participants.sessionId,
    })
    .get()

  if (!participant?.sessionId) {
    throw createError({
      status: 500,
      statusText: 'Failed to create participant',
    })
  }

  setCookie(
    event,
    PARTICIPANT_SESSION_COOKIE,
    toParticipantSessionCookie({
      nickname: participant.participantName,
      participantId: participant.id,
      sessionId: participant.sessionId,
    }),
  )

  return {
    id,
    inviteCode,
    participantId: participant.id,
  }
})
