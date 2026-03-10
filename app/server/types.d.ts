import type { Database } from 'better-sqlite3'

declare module 'nitropack' {
  interface NitroApp {
    db: Database
  }
}

declare global {
  interface Session {
    id: number
    title: string
    content?: string
  }

  interface SessionInput {
    title: string
    content?: string
  }
}
