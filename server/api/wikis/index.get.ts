import { db } from '#server/db'
import { wiki } from '#server/db/schema'

export default defineEventHandler(async () => {
  return db.select().from(wiki)
})
