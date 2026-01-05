# SharedCrowd - Multi-Tenant Event & Ambassador Platform

A full-stack TypeScript application built with Next.js 14+ for managing events and ambassadors across multiple organizations.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Auth.js)
- **Password Hashing**: bcryptjs

## Features

### User Roles

1. **PLATFORM_ADMIN**: Manages organizations at `/admin`
2. **ORG_ADMIN / ORG_USER**: Manages events and ambassadors at `/org/[orgSlug]/admin`
3. **Ambassadors**: Public registration (no login required) at `/e/[eventSlug]`

### Core Functionality

- Platform admins can create and manage organizations
- Organization admins can create events
- Public event pages for ambassador registration
- Ambassador management (accept/reject registrations)
- Multi-tenant architecture with organization isolation

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth configuration
│   │   ├── organizations/route.ts          # Organization CRUD
│   │   ├── events/
│   │   │   ├── route.ts                   # Event CRUD
│   │   │   ├── slug/[eventSlug]/route.ts  # Get event by slug
│   │   │   └── [eventId]/register/route.ts # Ambassador registration
│   │   └── ambassadors/
│   │       ├── route.ts                   # List ambassadors
│   │       └── [ambassadorId]/route.ts    # Update ambassador status
│   ├── admin/page.tsx                     # Platform admin dashboard
│   ├── org/[orgSlug]/admin/page.tsx       # Organization admin dashboard
│   ├── e/[eventSlug]/page.tsx             # Public event page
│   ├── login/page.tsx                     # Login page
│   ├── page.tsx                           # Home page
│   ├── layout.tsx                         # Root layout
│   ├── providers.tsx                      # NextAuth SessionProvider
│   └── globals.css                        # Global styles
├── lib/
│   ├── auth.ts                            # NextAuth configuration
│   └── prisma.ts                          # Prisma client
├── prisma/
│   ├── schema.prisma                      # Database schema
│   └── seed.ts                            # Database seeding script
├── types/
│   └── next-auth.d.ts                     # NextAuth type definitions
├── middleware.ts                          # Route protection
├── .env.example                           # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Make sure you have PostgreSQL installed and running.

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sharedcrowd?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

To generate a secure secret for `NEXTAUTH_SECRET`:

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

### Platform Admin
- **Email**: admin@sharedcrowd.com
- **Password**: admin123
- **URL**: http://localhost:3000/admin

### Organization Admin
- **Email**: admin@acme-corp.com
- **Password**: orgadmin123
- **URL**: http://localhost:3000/org/acme-corp/admin

### Public Event Page
- **URL**: http://localhost:3000/e/summer-conference-2025

## API Routes

### Organizations (Platform Admin Only)

- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations

### Events (Org Admin/User Only)

- `POST /api/events` - Create event
- `GET /api/events` - List events for user's organization
- `GET /api/events/slug/[eventSlug]` - Get event by slug (public)

### Ambassadors

- `POST /api/events/[eventId]/register` - Register ambassador (public)
- `GET /api/ambassadors` - List ambassadors (org admin/user)
- `PATCH /api/ambassadors/[ambassadorId]` - Update ambassador status (org admin/user)

## Database Schema

### Organization
- id, name, slug, createdAt

### User
- id, email, passwordHash, role, organizationId, createdAt
- Roles: PLATFORM_ADMIN, ORG_ADMIN, ORG_USER

### Event
- id, organizationId, name, slug, description, startDate, endDate, createdAt

### Ambassador
- id, eventId, name, email, status, createdAt
- Status: PENDING, ACCEPTED, REJECTED

## Additional Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Security Notes

⚠️ **This is an MVP scaffold - not production-ready!**

For production deployment, consider:
- Use strong, unique `NEXTAUTH_SECRET`
- Enable HTTPS
- Implement rate limiting
- Add input validation and sanitization
- Implement proper error handling
- Add email verification
- Use environment-specific configurations
- Implement CSRF protection
- Add database connection pooling
- Set up proper logging and monitoring

## Next Steps

To extend this MVP:
1. Add email notifications (welcome emails, ambassador status updates)
2. Implement file uploads (event images, ambassador profiles)
3. Add event analytics dashboard
4. Implement ambassador tracking codes/links
5. Add multi-language support
6. Implement event capacity limits
7. Add ambassador rewards/gamification
8. Create mobile-responsive designs
9. Add social media integration
10. Implement event check-in system

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials

### Authentication Issues
- Clear browser cookies/local storage
- Check NEXTAUTH_URL matches your app URL
- Regenerate NEXTAUTH_SECRET

### Build Errors
- Delete `.next` folder and rebuild
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Run `npm run db:generate` after schema changes

## License

MIT
