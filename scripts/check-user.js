const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  const email = 'chris@wallfeld.nl'
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true }
  })
  
  console.log('User found:', JSON.stringify(user, null, 2))
  
  await prisma.$disconnect()
}

checkUser()
