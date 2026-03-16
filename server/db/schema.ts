import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const sessions = sqliteTable('sessions', {
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  id: text('id').primaryKey(),
  status: text('status'),
})

export const recordings = sqliteTable('recordings', {
  fileUrl: text('file_url'),
  id: int('id').primaryKey({ autoIncrement: true }),
  participantName: text('participant_name'),
  sessionId: text('session_id').references(() => sessions.id),
})
