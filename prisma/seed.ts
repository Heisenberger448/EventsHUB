import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a platform admin user
  const platformAdminPassword = await bcrypt.hash('admin123', 10)
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@sharedcrowd.com' },
    update: {},
    create: {
      email: 'admin@sharedcrowd.com',
      passwordHash: platformAdminPassword,
      role: 'PLATFORM_ADMIN'
    }
  })
  console.log('✅ Created platform admin:', platformAdmin.email)

  // Create a sample organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp'
    }
  })
  console.log('✅ Created organization:', org.name)

  // Create an org admin user
  const orgAdminPassword = await bcrypt.hash('orgadmin123', 10)
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme-corp.com' },
    update: {},
    create: {
      email: 'admin@acme-corp.com',
      passwordHash: orgAdminPassword,
      role: 'ORG_ADMIN',
      organizationId: org.id
    }
  })
  console.log('✅ Created org admin:', orgAdmin.email)

  // Create a sample event
  const event = await prisma.event.upsert({
    where: { slug: 'summer-conference-2025' },
    update: {},
    create: {
      name: 'Summer Conference 2025',
      slug: 'summer-conference-2025',
      description: 'Join us for our annual summer conference with exciting speakers and networking opportunities.',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-17'),
      organizationId: org.id
    }
  })
  console.log('✅ Created event:', event.name)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Test credentials:')
  console.log('Platform Admin: admin@sharedcrowd.com / admin123')
  console.log('Org Admin: admin@acme-corp.com / orgadmin123')
  console.log('\n🔗 URLs:')
  console.log('Platform Admin: http://localhost:3000/admin')
  console.log('Org Admin: http://localhost:3000/acme-corp/dashboard')
  console.log('Public Event: http://localhost:3000/e/summer-conference-2025')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
