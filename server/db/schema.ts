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

export const wiki = sqliteTable('wiki', {
  combatStats: text('combat_stats'),
  content: text('content').notNull(),
  id: int('id').primaryKey({ autoIncrement: true }),
  inventoryStats: text('inventory_stats'),
  relations: text('relations'),
  summary: text('summary'),
  title: text('title').notNull(),
})

export const characters = sqliteTable('characters', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  imageUrl: text('image_url').default('https://placehold.co/100x100?text=Char'),
  wikiId: int('wiki_id').references(() => wiki.id),
})

export const characterRelationships = sqliteTable('character_relationships', {
  id: int('id').primaryKey({ autoIncrement: true }),
  character1Id: int('character1_id')
    .references(() => characters.id)
    .notNull(),
  character2Id: int('character2_id')
    .references(() => characters.id)
    .notNull(),
  score: int('score').notNull().default(0),
})
