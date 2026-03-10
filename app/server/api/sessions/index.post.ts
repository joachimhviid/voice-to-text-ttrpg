export default defineEventHandler(async (event) => {
  const { content, title } = await readBody(event)
  const db = useNitroApp().db

  const stmt = db.prepare('INSERT INTO sessions (title, content) VALUES (?, ?)')
  const info = stmt.run(title, content || '')

  return {
    id: info.lastInsertRowid,
    title,
  }
})
