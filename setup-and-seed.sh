#!/bin/sh
set -e

echo "🔧 Pushing schema to database..."
npx prisma db push --force-reset --skip-generate --accept-data-loss

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
