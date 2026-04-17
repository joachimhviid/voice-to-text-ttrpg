import { db } from '#server/db'

export default defineEventHandler(() => {
  const result = db.query.campaigns
    .findMany({
      with: {
        sessions: true,
      },
    })
    .sync()

  return result
})
