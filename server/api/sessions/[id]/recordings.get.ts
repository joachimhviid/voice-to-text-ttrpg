import { db } from '#server/db'

export default defineEventHandler((event) => {
  const sessionId = getRouterParam(event, 'id')
})
