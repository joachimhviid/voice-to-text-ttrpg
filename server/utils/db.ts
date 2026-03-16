import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import * as schema from '#server/db/schema'

if (!process.env.DB_FILE_NAME) {
  throw new Error('Missing environment variable: DB_FILE_NAME')
}

const dbPath = join('./.data', process.env.DB_FILE_NAME)

const sqlite = new Database(dbPath)

export const db = drizzle({ client: sqlite, schema })
