# SharedCrowd Platform - Complete File Structure

## Directory Tree

```
sharedcrowd-platform/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts              # NextAuth API handler
│   │   ├── organizations/
│   │   │   └── route.ts                  # POST/GET organizations (PLATFORM_ADMIN)
│   │   ├── events/
│   │   │   ├── route.ts                  # POST/GET events (ORG_ADMIN/ORG_USER)
│   │   │   ├── slug/
│   │   │   │   └── [eventSlug]/
│   │   │   │       └── route.ts          # GET event by slug (public)
│   │   │   └── [eventId]/
│   │   │       └── register/
│   │   │           └── route.ts          # POST ambassador registration (public)
│   │   └── ambassadors/
│   │       ├── route.ts                  # GET ambassadors (ORG_ADMIN/ORG_USER)
│   │       └── [ambassadorId]/
│   │           └── route.ts              # PATCH ambassador status (ORG_ADMIN/ORG_USER)
│   ├── admin/
│   │   └── page.tsx                      # Platform admin dashboard
│   ├── org/
│   │   └── [orgSlug]/
│   │       └── admin/
│   │           └── page.tsx              # Organization admin dashboard
│   ├── e/
│   │   └── [eventSlug]/
│   │       └── page.tsx                  # Public event registration page
│   ├── login/
│   │   └── page.tsx                      # Login page
│   ├── page.tsx                          # Home page
│   ├── layout.tsx                        # Root layout with SessionProvider
│   ├── providers.tsx                     # Client-side SessionProvider wrapper
│   └── globals.css                       # Tailwind CSS imports
├── lib/
│   ├── auth.ts                           # NextAuth configuration
│   └── prisma.ts                         # Prisma client singleton
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── seed.ts                           # Database seeding script
├── types/
│   └── next-auth.d.ts                    # NextAuth TypeScript types
├── .env.example                          # Environment variables template
├── .gitignore                            # Git ignore file
├── middleware.ts                         # Route protection middleware
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
├── next.config.js                        # Next.js configuration
└── README.md                             # Complete documentation
```

## Page Routes

| URL | Access | Description |
|-----|--------|-------------|
| `/` | Public | Home page |
| `/login` | Public | Login page |
| `/admin` | PLATFORM_ADMIN | Platform admin dashboard |
| `/org/[orgSlug]/admin` | ORG_ADMIN, ORG_USER | Organization admin dashboard |
| `/e/[eventSlug]` | Public | Event registration page |

## API Routes

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | Public | NextAuth handlers |
| `/api/organizations` | POST | PLATFORM_ADMIN | Create organization |
| `/api/organizations` | GET | PLATFORM_ADMIN | List organizations |
| `/api/events` | POST | ORG_ADMIN, ORG_USER | Create event |
| `/api/events` | GET | ORG_ADMIN, ORG_USER | List events |
| `/api/events/slug/[eventSlug]` | GET | Public | Get event by slug |
| `/api/events/[eventId]/register` | POST | Public | Register ambassador |
| `/api/ambassadors` | GET | ORG_ADMIN, ORG_USER | List ambassadors |
| `/api/ambassadors/[ambassadorId]` | PATCH | ORG_ADMIN, ORG_USER | Update ambassador status |

## Key Files Explained

### Database & ORM

**`prisma/schema.prisma`**
- Defines 4 models: Organization, User, Event, Ambassador
- 3 enums: UserRole, AmbassadorStatus
- PostgreSQL database

**`lib/prisma.ts`**
- Prisma Client singleton to prevent multiple instances in development

**`prisma/seed.ts`**
- Seeds database with:
  - Platform admin (admin@sharedcrowd.com)
  - Sample organization (Acme Corp)
  - Org admin (admin@acme-corp.com)
  - Sample event and ambassadors

### Authentication

**`lib/auth.ts`**
- NextAuth configuration
- Credentials provider with bcrypt
- JWT callbacks to store role and organizationId in session

**`app/api/auth/[...nextauth]/route.ts`**
- NextAuth API route handler

**`types/next-auth.d.ts`**
- TypeScript type extensions for NextAuth session and user

**`middleware.ts`**
- Route protection middleware
- Validates user role and organization access

### Pages

**`app/admin/page.tsx`**
- Platform admin dashboard
- Create organizations
- List all organizations

**`app/org/[orgSlug]/admin/page.tsx`**
- Organization admin dashboard
- Create events
- List events
- Manage ambassadors (accept/reject)

**`app/e/[eventSlug]/page.tsx`**
- Public event page
- Ambassador registration form
- No authentication required

**`app/login/page.tsx`**
- Login form with email/password
- Uses NextAuth signIn()

### API Routes

**`app/api/organizations/route.ts`**
- POST: Create organization (PLATFORM_ADMIN only)
- GET: List organizations (PLATFORM_ADMIN only)

**`app/api/events/route.ts`**
- POST: Create event for user's organization
- GET: List events for user's organization

**`app/api/events/slug/[eventSlug]/route.ts`**
- GET: Fetch event by slug (public, no auth)

**`app/api/events/[eventId]/register/route.ts`**
- POST: Register ambassador for event (public)
- Email validation
- Duplicate check

**`app/api/ambassadors/route.ts`**
- GET: List all ambassadors for user's organization

**`app/api/ambassadors/[ambassadorId]/route.ts`**
- PATCH: Update ambassador status
- Validates organization ownership

### Configuration

**`package.json`**
- All dependencies
- npm scripts for database operations
- Prisma seed configuration

**`tsconfig.json`**
- TypeScript configuration
- Path alias `@/*` for imports

**`tailwind.config.ts`**
- Tailwind CSS configuration
- Content paths for purging

**`.env.example`**
- Template for environment variables
- DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

## Data Flow

### Platform Admin Creates Organization
1. Login at `/login` with platform admin credentials
2. Navigate to `/admin`
3. Fill form and POST to `/api/organizations`
4. Organization saved to database
5. List refreshes showing new organization

### Org Admin Creates Event
1. Login at `/login` with org admin credentials
2. Navigate to `/org/[orgSlug]/admin`
3. Middleware validates user belongs to organization
4. Fill form and POST to `/api/events`
5. Event saved with organizationId from session
6. List refreshes showing new event

### Ambassador Registers
1. Visit public URL `/e/[eventSlug]`
2. Page fetches event via GET `/api/events/slug/[eventSlug]`
3. Fill registration form
4. POST to `/api/events/[eventId]/register`
5. Ambassador created with status PENDING
6. Success message displayed

### Org Admin Manages Ambassadors
1. Org admin visits `/org/[orgSlug]/admin`
2. Page fetches ambassadors via GET `/api/ambassadors`
3. Click Accept/Reject button
4. PATCH to `/api/ambassadors/[ambassadorId]` with new status
5. List updates showing new status

## Authorization Logic

### Session Structure
```typescript
{
  user: {
    id: string
    email: string
    role: 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'ORG_USER'
    organizationId: string | null
    organizationSlug: string | undefined
  }
}
```

### Access Control
- `/admin` routes: Check `role === 'PLATFORM_ADMIN'`
- `/org/[orgSlug]/admin` routes: Check role is ORG_ADMIN or ORG_USER AND organizationSlug matches
- API routes: Similar checks + verify organization ownership for data access

### Middleware Protection
- Intercepts requests to `/admin/*` and `/org/*`
- Validates JWT token
- Checks role and organization match
- Redirects to `/login` if unauthorized
