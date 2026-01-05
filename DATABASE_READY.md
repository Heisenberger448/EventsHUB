# ✅ Database is Opgezet!

## 🎉 Status

Je PostgreSQL database draait nu in Docker!

```
Container:  sharedcrowd-db
Status:     Running
Port:       5434 (niet 5432!)
Database:   sharedcrowd
User:       sharedcrowd
Password:   sharedcrowd123
```

## 📋 Volgende Stappen

Voer deze commando's uit in volgorde:

```bash
# 1. Installeer alle dependencies
npm install

# 2. Genereer Prisma Client
npm run db:generate

# 3. Maak database tabellen aan
npm run db:push

# 4. Vul database met voorbeeld data
npm run db:seed

# 5. Start de development server
npm run dev
```

## 🔑 Test Inloggegevens (na npm run db:seed)

**Platform Admin:**
- URL: http://localhost:3000/admin
- Email: `admin@sharedcrowd.com`
- Password: `admin123`

**Organisatie Admin:**
- URL: http://localhost:3000/org/acme-corp/admin
- Email: `admin@acme-corp.com`
- Password: `orgadmin123`

**Publieke Event Pagina:**
- URL: http://localhost:3000/e/summer-conference-2025

## 🛠️ Handige Commando's

### Database Beheer

```bash
# Stop database (data blijft behouden)
/Applications/Docker.app/Contents/Resources/bin/docker compose stop

# Start database
/Applications/Docker.app/Contents/Resources/bin/docker compose start

# Herstart database
/Applications/Docker.app/Contents/Resources/bin/docker compose restart

# Bekijk logs
/Applications/Docker.app/Contents/Resources/bin/docker compose logs -f

# Open database GUI
npm run db:studio
```

### Database Resetten

```bash
# Volledige reset (verwijdert alle data!)
/Applications/Docker.app/Contents/Resources/bin/docker compose down -v
/Applications/Docker.app/Contents/Resources/bin/docker compose up -d
npm run db:push
npm run db:seed
```

## 🔍 Troubleshooting

### Check of database draait

```bash
/Applications/Docker.app/Contents/Resources/bin/docker ps | grep sharedcrowd
```

### Test database connectie

```bash
/Applications/Docker.app/Contents/Resources/bin/docker exec sharedcrowd-db pg_isready -U sharedcrowd
```

### Verbind met database

```bash
/Applications/Docker.app/Contents/Resources/bin/docker exec -it sharedcrowd-db psql -U sharedcrowd -d sharedcrowd
```

## 📊 Database GUI

Prisma Studio is een web-based database browser:

```bash
npm run db:studio
```

Opent op: http://localhost:5555

Hier kun je:
- ✅ Alle data bekijken
- ✅ Records toevoegen/bewerken
- ✅ Queries uitvoeren
- ✅ Data exporteren

## 🔒 Belangrijke Notities

1. **Poort 5434** - Niet de standaard 5432, omdat die al in gebruik is
2. **Data blijft bewaard** - Ook als je de container stop
3. **Development only** - Deze credentials zijn NIET voor productie
4. **Backup** - Voor productie altijd backups maken

## 🚀 Klaar om te Starten!

Je bent nu klaar. Voer de stappen hierboven uit en begin met ontwikkelen!
