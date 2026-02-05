# SharedCrowd - Multi-Tenant Event & Ambassador Platform

A full-stack TypeScript application built with Next.js 14+ for managing events and ambassadors across multiple organizations.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

## Features

- Multi-tenant architecture with organization isolation
- Platform admins manage organizations
- Organization admins create and manage events
- Ambassador registration and management
- Campaign system for ambassador tasks
- Feed system for discovering new events

## User Roles

1. **PLATFORM_ADMIN**: Manages organizations at `/admin`
2. **ORG_ADMIN / ORG_USER**: Manages events and ambassadors at `/{orgSlug}/dashboard`
3. **Ambassadors**: Mobile app access for events and campaigns

## Project Structure

```
├── app/
│   ├── (platform-admin)/      # Platform admin interface
│   │   └── admin/             # Platform admin dashboard
│   ├── (org-admin)/           # Organization admin interface
│   │   └── [orgSlug]/         # Org-specific admin pages
│   │       ├── dashboard/     # Organization dashboard
│   │       ├── audience/      # Ambassador management
│   │       ├── events/        # Event management
│   │       └── campaigns/     # Campaign management
│   ├── (public)/              # Public pages
│   │   ├── e/[eventSlug]/     # Public event pages
│   │   └── login/             # Authentication
│   └── api/                   # API routes
├── components/
│   ├── org-admin/             # Org admin UI components
│   ├── platform-admin/        # Platform admin components
│   └── shared/                # Shared reusable components
├── lib/                       # Utilities (auth, prisma)
├── prisma/                    # Database schema and migrations
└── types/                     # TypeScript type definitions
```

The project uses Next.js route groups `()` to organize pages by user interface type without affecting the URL structure.

## URL Structure

- **Platform Admin**: `/admin`
- **Organization Admin**: `/[orgSlug]/dashboard`, `/[orgSlug]/audience`, etc.
- **Public Events**: `/e/[eventSlug]`
- **Login**: `/login`

## Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Initialize Database

Generate Prisma Client:

```bash
npm run db:generate
```

Push the schema to your database:

```bash
npm run db:push
```

Or create and run migrations:

```bash
npm run db:migrate
```

### 4. Seed Database

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- A platform admin user: `admin@sharedcrowd.com` / `admin123`
- A sample organization: "Acme Corporation" (slug: `acme-corp`)
- An org admin user: `admin@acme-corp.com` / `orgadmin123`
- A sample event: "Summer Conference 2025"
- Sample ambassador registrations

### 5. Run Development Server

```bash

## Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# Seed database
npm run db:seed

# View database in Prisma Studio
npm run db:studio
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## API Routes

### Organizations (Platform Admin Only)
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations

### Events (Org Admin/User)
- `POST /api/events` - Create event
- `GET /api/events` - List events
- `GET /api/events/slug/[eventSlug]` - Get event by slug

### Ambassadors
- `POST /api/ambassadors/login` - Ambassador login
- `GET /api/ambassadors` - List ambassadors
- `PATCH /api/ambassadors/[ambassadorId]` - Update status

### Campaigns
- `GET /api/ambassadors/[id]/campaigns` - Get ambassador campaigns
- `POST /api/campaigns/[id]/complete` - Mark campaign complete

## Troubleshooting

**Database Connection Issues**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`

**Authentication Issues**
- Clear browser cookies
- Verify NEXTAUTH_URL matches your app URL

**Build Errors**
- Delete `.next` folder and rebuild
- Run `npm run db:generate` after schema changes

## License

MIT
