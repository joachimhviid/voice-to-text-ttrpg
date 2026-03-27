import Database from 'better-sqlite3'

export default defineNitroPlugin((nitroApp) => {
  const db = new Database('sessions.db')
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      combatStats TEXT,
      inventoryStats TEXT,
      relations TEXT,
      summary TEXT
    )
  `)
  nitroApp.db = db
})
