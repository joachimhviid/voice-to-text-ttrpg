export default defineEventHandler((event) => {
  console.log('GET /api/sessions called');
  const db = useNitroApp().db
  const stmt = db.prepare('SELECT id, title FROM sessions')
  return stmt.all()
})
