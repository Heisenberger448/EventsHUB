#!/bin/bash

# Database migratie script voor productie deployment
set -e

echo "🚀 Starting database migration..."

# Controleer of DATABASE_URL is ingesteld
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
# Alleen seeden in development of als expliciet gevraagd
if [ "$NODE_ENV" = "development" ] || [ "$FORCE_SEED" = "true" ]; then
    npm run db:seed
    echo "✅ Database seeded"
else
    echo "⏭️  Skipping seed (production environment)"
fi

echo "✅ Database migration completed successfully!"