# 🚀 Deployment naar DigitalOcean via GitHub

## Voorbereiding

### 1. GitHub Repository Setup

1. **Maak een nieuwe repository** op je GitHub account
   - Ga naar https://github.com/new
   - Repository naam: `sharedcrowd-platform` (of eigen keuze)
   - Maak de repository **private** als dit gewenst is
   - Initialiseer NIET met README (we pushen bestaande code)

2. **Push je code naar GitHub**
   ```bash
   cd "/Users/christiaanvanwijk/Desktop/InnerCrowd Project/Applicatie"
   git init
   git add .
   git commit -m "Initial commit - SharedCrowd Platform"
   git branch -M main
   git remote add origin https://github.com/JOUW-USERNAME/sharedcrowd-platform.git
   git push -u origin main
   ```

### 2. DigitalOcean Account Setup

1. **Maak een DigitalOcean account** op https://digitalocean.com
2. **Genereer een API token**:
   - Ga naar: API → Personal Access Tokens
   - Klik "Generate New Token"
   - Naam: `GitHub Actions Deploy`
   - Scopes: Read & Write
   - Kopieer de token (je ziet hem maar 1 keer!)

### 3. GitHub Secrets Configureren

1. Ga naar je GitHub repository
2. Ga naar **Settings** → **Secrets and variables** → **Actions**
3. Voeg de volgende secrets toe:

   - `DIGITALOCEAN_ACCESS_TOKEN`: Je DigitalOcean API token
   - `NEXTAUTH_SECRET`: Een willekeurige string van minimaal 32 karakters
     ```bash
     # Genereer een secret:
     openssl rand -base64 32
     ```

## Deployment Stappen

### 1. DigitalOcean App Platform Setup

1. **Log in op DigitalOcean** → Apps → Create App
2. **Kies GitHub** als source
3. **Autoriseer DigitalOcean** voor je GitHub account
4. **Selecteer repository**: `jouw-username/sharedcrowd-platform`
5. **Branch**: `main`
6. **Autodeploy**: Enabled

### 2. App Configuratie

De app wordt automatisch geconfigureerd via het `.do/app.yaml` bestand, maar controleer:

- **Service naam**: `web`
- **Build command**: `npm ci && npx prisma generate && npm run build`
- **Run command**: `npm start`
- **Port**: 3000

### 3. Database Setup

1. **Database wordt automatisch aangemaakt** via de app.yaml
2. **Database naam**: `sharedcrowd-db`
3. **Engine**: PostgreSQL 15
4. **Size**: Basic ($7/maand)

### 4. Environment Variables

Voeg de volgende environment variables toe in DigitalOcean:

1. Ga naar je app in DigitalOcean
2. **Settings** → **App-level Environment Variables**
3. Voeg toe:
   ```
   NODE_ENV=production
   NEXTAUTH_URL=${APP_URL}
   NEXTAUTH_SECRET=jouw-geheime-string-hier
   ```

4. **Database URL** wordt automatisch ingesteld door DigitalOcean

### 5. Database Migraties

Na eerste deployment:

1. Ga naar **Console** in je DigitalOcean app
2. Run migraties:
   ```bash
   npm run db:migrate:deploy
   ```

3. **Optioneel**: Seed database
   ```bash
   FORCE_SEED=true npm run db:seed
   ```

## Automatische Deployment

### GitHub Actions Workflow

Elke push naar de `main` branch triggert automatisch:

1. ✅ **Tests** (npm test)
2. ✅ **Build** (npm run build)
3. ✅ **Database migraties** (als configuratie klopt)
4. ✅ **Deployment** naar DigitalOcean

### Handmatige Deployment

Als je handmatig wilt deployen:

1. Ga naar **Actions** in GitHub
2. Klik op **Deploy to DigitalOcean**
3. Klik **Run workflow**

## Kosten Overzicht

- **Basic App**: ~$5/maand
- **PostgreSQL Database**: ~$7/maand
- **Totaal**: ~$12/maand

## Troubleshooting

### Build Errors

```bash
# Lokaal testen van productie build:
npm run build
npm start
```

### Database Connectie

```bash
# Test database connectie:
npx prisma db push
npx prisma studio
```

### Environment Variables

Controleer of alle environment variables correct zijn ingesteld in:
- GitHub Secrets (voor CI/CD)
- DigitalOcean App Settings (voor runtime)

## Nuttige Commands

```bash
# Lokale development
npm run dev

# Productie build testen
npm run build && npm start

# Database management
npm run db:migrate
npm run db:seed
npm run db:studio

# Deployment migratie
npm run deploy:migrate
```

## Security Checklist

- ✅ GitHub repository private (optioneel)
- ✅ Sterke NEXTAUTH_SECRET
- ✅ Database passwords via DigitalOcean
- ✅ Environment variables in secrets
- ✅ HTTPS automatisch via DigitalOcean

## Live URL

Na deployment is je app beschikbaar op:
`https://jouw-app-naam-xxxxx.ondigitalocean.app`

Update je `NEXTAUTH_URL` environment variable met deze URL!