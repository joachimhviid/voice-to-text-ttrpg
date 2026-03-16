import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dbCredentials: {
    url: `.data/${process.env.DB_FILE_NAME}`,
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: './server/db/schema.ts',
})
