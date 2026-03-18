import { db } from '#server/db'
import { sessions } from '#server/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { generateInviteCode } from '#server/utils/generateCode'

export default defineEventHandler(() => {
  const inviteCode = generateInviteCode()
  const id = createId()

  db.insert(sessions)
    .values({
      code: inviteCode,
      id,
    })
    .run()

  return {
    id,
    inviteCode,
  }
})
