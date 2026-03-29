import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { readFileSync } from 'fs'
import { sql } from 'drizzle-orm'
import { db, pool } from './db.js'


await migrate(db, { migrationsFolder: './drizzle' })

const seed = readFileSync('./seed.sql', 'utf-8')
await db.execute(sql.raw(seed))

await pool.end()