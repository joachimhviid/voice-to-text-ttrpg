import { db } from '#server/db'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      status: 400,
      statusText: 'No session id provided',
    })
  }

  const session = db.query.sessions
    .findFirst({
      where: (fields, { eq }) => eq(fields.id, sessionId),
    })
    .sync()

  if (!session) {
    throw createError({
      status: 404,
      statusText: 'No session found',
    })
  }

  return session
})
