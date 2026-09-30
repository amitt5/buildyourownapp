// Applies db/schema.sql to the database in DATABASE_URL (idempotent).
// Usage: pnpm db:migrate
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envFile = join(root, '.env.local')
if (!process.env.DATABASE_URL && existsSync(envFile)) process.loadEnvFile(envFile)

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set (looked in the environment and .env.local).')
  process.exit(1)
}

const statements = readFileSync(join(root, 'db', 'schema.sql'), 'utf8')
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean)

const sql = neon(process.env.DATABASE_URL)
try {
  // One transaction: either the whole schema applies or nothing does.
  await sql.transaction(statements.map((s) => sql.query(s)))
  const tables = await sql.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  )
  console.log(`Applied ${statements.length} statements. Tables: ${tables.map((t) => t.table_name).join(', ')}`)
} catch (error) {
  // Never print the connection string.
  console.error('Migration failed:', error instanceof Error ? error.message : 'unknown error')
  process.exit(1)
}
