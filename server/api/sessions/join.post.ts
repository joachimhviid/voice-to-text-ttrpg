import { db } from '#server/db'
import { SessionStatus } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ inviteCode: string }>(event)

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

  return {
    id: session.id,
  }
})
