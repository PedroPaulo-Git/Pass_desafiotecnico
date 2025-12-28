import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Runtime alias: some Prisma generator versions produce delegates with
// unexpected casing (example: `hELPDESK`). To preserve existing code that
// references `prisma.HELPDESK` (uppercase), create a safe alias at runtime.
;(function createRuntimeAliases(p: unknown) {
  try {
    const anyP = p as any
    if (!anyP) return

    // Prefer existing uppercase, otherwise fall back to common generated names
    if (!anyP.HELPDESK) {
      anyP.HELPDESK = anyP.hELPDESK ?? anyP.helpdesk ?? anyP.Helpdesk
    }
  } catch (err) {
    // ignore
  }
})(prisma)

export default prisma