export default defineEventHandler(async (event) => {
  const { content, title, combatStats, inventoryStats, relations, summary } = await readBody(event)
  const db = useNitroApp().db

  const stmt = db.prepare('INSERT INTO sessions (title, content, combatStats, inventoryStats, relations, summary) VALUES (?, ?, ?, ?, ?, ?)')
  const info = stmt.run(title, content || '', combatStats || '', inventoryStats || '', relations || '', summary || '')

  return {
    id: info.lastInsertRowid,
    title,
  }
})
