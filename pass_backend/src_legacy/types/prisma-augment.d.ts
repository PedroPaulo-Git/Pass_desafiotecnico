import { Prisma } from '@prisma/client'

declare module '@prisma/client' {
  interface PrismaClient {
    // Allow referencing the Helpdesk delegate as `prisma.HELPDESK` (uppercase).
    // We use `any` here to avoid coupling to generated delegate types which
    // may vary across Prisma generator versions.
    HELPDESK: any
  }
}
