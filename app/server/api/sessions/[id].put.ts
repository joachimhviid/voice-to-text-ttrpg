export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { title, content, combatStats, inventoryStats, relations, summary } = await readBody(event)
  const db = useNitroApp().db

  const stmt = db.prepare(
    'UPDATE sessions SET title = ?, content = ?, combatStats = ?, inventoryStats = ?, relations = ?, summary = ? WHERE id = ?',
  )
  stmt.run(title, content, combatStats, inventoryStats, relations, summary, id)

  return { message: 'Session updated successfully' }
})
