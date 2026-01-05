const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database connection...');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Created: ${user.createdAt}`);
    });
    
    if (userCount === 0) {
      console.log('\n⚠️  Database is EMPTY! Seed data was not created.');
      console.log('💡 Run: npm run db:seed');
    } else {
      console.log('\n✅ Database contains data!');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
