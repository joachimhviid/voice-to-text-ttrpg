import { int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
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
  participantId: text('participant_id').references(() => participants.id),
  sessionId: text('session_id').references(() => sessions.id),
})

export enum ParticipantRole {
  HOST = 'host',
  PARTICIPANT = 'participant',
}

// TODO: Consider if this needs a self reference for rejoining a lobby. Could create a new row that references the original participant row.
export const participants = sqliteTable(
  'participants',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    participantName: text('participant_name').notNull(),
    peerId: text(),
    role: text('role').default(ParticipantRole.PARTICIPANT),
    sessionId: text('session_id')
      .references(() => sessions.id)
      .notNull(),
  },
  (t) => [unique().on(t.sessionId, t.peerId)],
)
