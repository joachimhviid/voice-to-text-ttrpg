import { db } from '#server/db'
import { campaigns } from '#server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ campaignName: string }>(event)

  const result = db.insert(campaigns).values({ name: body.campaignName }).run()

  return {
    id: Number(result.lastInsertRowid),
  }
})
