export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const db = useNitroApp().db
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?')
  const info = stmt.run(id)
  
  if (info.changes > 0) {
    return { success: true, message: 'Session deleted successfully' }
  } else {
    return { success: false, message: 'Session not found' }
  }
})
