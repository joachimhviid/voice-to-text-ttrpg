export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  const db = useNitroApp().db;
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return stmt.get(id);
});
