# 🐳 Database Setup met Docker

## Snelle Start

Poort 5432 en 5433 zijn al in gebruik, dus we gebruiken **poort 5434** voor SharedCrowd.

### Optie 1: Automatisch (Aanbevolen)

```bash
./setup-db.sh
```

Dit script:
- Start PostgreSQL in Docker container
- Gebruikt poort 5434
- Maakt database `sharedcrowd` aan
- Configureert user/password

### Optie 2: Handmatig

```bash
# 1. Start PostgreSQL container
docker-compose up -d

# 2. Controleer of de container draait
docker ps | grep sharedcrowd-db

# 3. Test de connectie
docker exec sharedcrowd-db pg_isready -U sharedcrowd
```

## Database Credentials

```
Host:     localhost
Port:     5434  ⚠️ Niet 5432!
Database: sharedcrowd
User:     sharedcrowd
Password: sharedcrowd123
```

## Volledige Setup

Na het starten van de database:

```bash
# 1. Installeer dependencies
npm install

# 2. Genereer Prisma Client
npm run db:generate

# 3. Maak database schema aan
npm run db:push

# 4. Seed met voorbeeld data
npm run db:seed

# 5. Start de applicatie
npm run dev
```

## Database Beheer

### Container Commando's

```bash
# Stop database (data blijft bewaard)
docker-compose stop

# Start database weer op
docker-compose start

# Herstart database
docker-compose restart

# Stop en verwijder container (data blijft bewaard)
docker-compose down

# Verwijder container + alle data (VOORZICHTIG!)
docker-compose down -v
```

### Database GUI

```bash
# Open Prisma Studio (web interface)
npm run db:studio
```

Opent op: http://localhost:5555

### Direct Database Access

```bash
# Via Docker
docker exec -it sharedcrowd-db psql -U sharedcrowd -d sharedcrowd

# Via psql (als geïnstalleerd)
psql -h localhost -p 5434 -U sharedcrowd -d sharedcrowd
```

## Troubleshooting

### Container start niet

```bash
# Check Docker logs
docker-compose logs

# Check of poort 5434 vrij is
lsof -i :5434
```

### Kan niet verbinden met database

```bash
# 1. Check of container draait
docker ps | grep sharedcrowd-db

# 2. Test connectie
docker exec sharedcrowd-db pg_isready -U sharedcrowd

# 3. Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

Moet zijn:
```
DATABASE_URL="postgresql://sharedcrowd:sharedcrowd123@localhost:5434/sharedcrowd?schema=public"
```

### Database resetten

```bash
# Verwijder alles en start opnieuw
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

## .env Configuratie

Je `.env` file is al geconfigureerd met:

```env
DATABASE_URL="postgresql://sharedcrowd:sharedcrowd123@localhost:5434/sharedcrowd?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-change-this-for-production-use-openssl-rand-base64-32"
```

## Production Overwegingen

Voor productie:
- Gebruik sterke passwords
- Gebruik environment variables
- Configureer backups
- Gebruik managed PostgreSQL service (bijv. Supabase, Railway, Neon)
