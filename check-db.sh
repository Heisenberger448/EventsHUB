#!/bin/sh
set -e

echo "🔍 Checking database contents..."
echo ""

# Check if users table exists and count users
npx prisma db execute --stdin <<SQL
SELECT 
  'Total users:' as info,
  COUNT(*) as count
FROM "User";

SELECT 
  email,
  role,
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;
SQL

echo ""
echo "✅ Database check complete!"
