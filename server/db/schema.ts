import { int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'

export enum SessionStatus {
  CLOSED = 'closed',
  INPROGRESS = 'inProgress',
  OPEN = 'open',
}

export const campaigns = sqliteTable('campaigns', {
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const campaignRelations = relations(campaigns, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessions = sqliteTable('sessions', {
  campaignId: int('campaign_id')
    .references(() => campaigns.id)
    .notNull(),
  code: text().notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  id: text('id').primaryKey(),
  status: text('status').default(SessionStatus.OPEN).notNull(),
})

export const sessionRelations = relations(sessions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [sessions.campaignId],
    references: [campaigns.id],
  }),
}))

export const recordings = sqliteTable('recordings', {
  fileUrl: text('file_url'),
  id: int('id').primaryKey({ autoIncrement: true }),
  participantId: text('participant_id')
    .references(() => participants.id)
    .notNull(),
  sessionId: text('session_id')
    .references(() => sessions.id)
    .notNull(),
})

export const recordingRelations = relations(recordings, ({ one }) => ({
  participant: one(participants, {
    fields: [recordings.participantId],
    references: [participants.id],
  }),
  session: one(sessions, {
    fields: [recordings.sessionId],
    references: [sessions.id],
  }),
}))

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

export const participantRelations = relations(participants, ({ one }) => ({
  sessions: one(sessions, {
    fields: [participants.sessionId],
    references: [sessions.id],
  }),
}))
