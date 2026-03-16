import type { Database } from 'better-sqlite3'

declare module 'nitropack' {
  interface NitroApp {
    db: Database
  }
}

export interface Session {
  id: number
  title: string
  content?: string
  combatStats?: string
  inventoryStats?: string
  relations?: string
  summary?: string
}
