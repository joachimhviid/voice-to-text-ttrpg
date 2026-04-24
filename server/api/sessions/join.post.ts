import { db } from '#server/db'
import { ParticipantRole, participants, SessionStatus } from '#server/db/schema'
import { PARTICIPANT_SESSION_COOKIE, toParticipantSessionCookie } from '#shared/utils/participantSessionCookie'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ inviteCode: string; nickname: string }>(event)

  const session = db.query.sessions
    .findFirst({
      where: (fields, operators) =>
        operators.and(operators.eq(fields.code, body.inviteCode), operators.ne(fields.status, SessionStatus.CLOSED)),
    })
    .sync()

  if (!session) {
    throw createError({
      status: 404,
      statusText: `No active session found for invite code: ${body.inviteCode}`,
    })
  }

  const participant = db
    .insert(participants)
    .values({ participantName: body.nickname, role: ParticipantRole.PARTICIPANT, sessionId: session.id })
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
    campaignId: session.campaignId,
    id: session.id,
    participantId: participant.id,
  }
})
