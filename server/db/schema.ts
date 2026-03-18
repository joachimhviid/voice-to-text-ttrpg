import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export enum SessionStatus {
  CLOSED = 'closed',
  INPROGRESS = 'inProgress',
  OPEN = 'open',
}

export const sessions = sqliteTable('sessions', {
  code: text(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  id: text('id').primaryKey(),
  status: text('status').default(SessionStatus.OPEN),
})

export const recordings = sqliteTable('recordings', {
  fileUrl: text('file_url'),
  id: int('id').primaryKey({ autoIncrement: true }),
  participantName: text('participant_name'),
  sessionId: text('session_id').references(() => sessions.id),
})
