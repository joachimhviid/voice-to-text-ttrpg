import { db } from '#server/db'

export default defineEventHandler(async (event) => {
  const campaignId = getRouterParam(event, 'campaignId')
  if (!campaignId) {
    throw createError({
      status: 400,
      statusText: 'No campaign id provided',
    })
  }

  const result = db.query.campaigns
    .findFirst({
      where: (fields, { eq }) => eq(fields.id, Number(campaignId)),
      with: {
        sessions: true,
      },
    })
    .sync()

  return result
})
