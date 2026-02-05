const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserOrganization() {
  try {
    const email = 'chris@wallfeld.nl'
    const orgId = 'cml9mxft90000ofxur61tnygu'

    console.log('Updating user:', email)
    console.log('Linking to organization:', orgId)

    const updated = await prisma.user.update({
      where: { email },
      data: {
        organizationId: orgId,
        role: 'ORG_ADMIN'
      },
      include: {
        organization: true
      }
    })

    console.log('\n✅ User updated successfully:')
    console.log(JSON.stringify(updated, null, 2))
  } catch (error) {
    console.error('❌ Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserOrganization()
