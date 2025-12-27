<<<<<<< HEAD
// import { PrismaClient } from '../generated/prisma/client'
=======
>>>>>>> ec993ac69e5158e8c27f7d5fe815ea9b4df8f373
import { PrismaClient } from '@/prisma/generated/client/client'


import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prismaClient = new PrismaClient({ adapter })
