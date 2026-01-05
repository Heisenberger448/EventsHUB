#!/bin/bash

# SharedCrowd Database Setup Script met Docker
# Dit script zet de PostgreSQL database op met Docker

set -e

# Docker commando (werkt met Docker Desktop op macOS)
DOCKER="/Applications/Docker.app/Contents/Resources/bin/docker"
DOCKER_COMPOSE="$DOCKER compose"

echo "🚀 SharedCrowd Database Setup"
echo "================================"
echo ""

# Check of Docker draait
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is niet actief. Start Docker Desktop en probeer opnieuw."
    exit 1
fi

echo "✓ Docker is actief"
echo ""

# Stop en verwijder oude container indien aanwezig
if [ "$($DOCKER ps -aq -f name=sharedcrowd-db)" ]; then
    echo "🔄 Oude sharedcrowd-db container gevonden, deze wordt verwijderd..."
    $DOCKER stop sharedcrowd-db 2>/dev/null || true
    $DOCKER rm sharedcrowd-db 2>/dev/null || true
    echo "✓ Oude container verwijderd"
fi

echo ""
echo "📦 PostgreSQL container starten..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Wachten tot database gereed is..."
sleep 5

# Check of database bereikbaar is
until $DOCKER exec sharedcrowd-db pg_isready -U sharedcrowd > /dev/null 2>&1; do
    echo "   Database nog niet gereed, wachten..."
    sleep 2
done

echo "✓ Database is gereed!"
echo ""

echo "📚 Database info:"
echo "   Container: sharedcrowd-db"
echo "   Host:      localhost"
echo "   Port:      5434"
echo "   Database:  sharedcrowd"
echo "   User:      sharedcrowd"
echo "   Password:  sharedcrowd123"
echo ""

echo "✅ PostgreSQL database is succesvol opgezet!"
echo ""
echo "Volgende stappen:"
echo "   1. npm install"
echo "   2. npm run db:generate"
echo "   3. npm run db:push"
echo "   4. npm run db:seed"
echo "   5. npm run dev"
echo ""
echo "Handige commando's:"
echo "   docker-compose stop     # Stop database"
echo "   docker-compose start    # Start database"
echo "   docker-compose down     # Stop en verwijder container"
echo "   docker-compose down -v  # Stop, verwijder container + data"
echo "   npm run db:studio       # Open database GUI"
