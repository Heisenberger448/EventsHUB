# SharedCrowd Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Platform   │  │ Organization │  │  Public Event│          │
│  │    Admin     │  │    Admin     │  │     Page     │          │
│  │   /admin     │  │ /org/.../admin│  │ /e/[slug]   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                                │
│  │    Login     │                                                │
│  │   /login     │                                                │
│  └──────────────┘                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           Route Protection Middleware                 │       │
│  │  • JWT validation                                     │       │
│  │  • Role-based access control                          │       │
│  │  • Organization isolation                             │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes                            │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  /api/organizations          /api/events                │    │
│  │  • POST (create)             • POST (create)            │    │
│  │  • GET  (list)               • GET  (list)              │    │
│  │                              • GET by slug (public)     │    │
│  │                                                          │    │
│  │  /api/ambassadors            /api/auth                  │    │
│  │  • GET  (list)               • [...nextauth]            │    │
│  │  • PATCH (update status)     • Sign in/out             │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Business Logic                          │    │
│  │  • Authentication (NextAuth + bcrypt)                    │    │
│  │  • Authorization checks                                  │    │
│  │  • Data validation                                       │    │
│  │  • Organization isolation                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                      PostgreSQL Database                         │
│                                                                   │
│  ┌─────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐    │
│  │Organization │  │   User   │  │ Event  │  │ Ambassador │    │
│  ├─────────────┤  ├──────────┤  ├────────┤  ├────────────┤    │
│  │ id          │  │ id       │  │ id     │  │ id         │    │
│  │ name        │  │ email    │  │ name   │  │ name       │    │
│  │ slug        │  │ password │  │ slug   │  │ email      │    │
│  │ createdAt   │  │ role     │  │ desc   │  │ status     │    │
│  └─────────────┘  │ orgId    │  │ dates  │  │ eventId    │    │
│                    └──────────┘  │ orgId  │  │ createdAt  │    │
│                                  └────────┘  └────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

```
┌──────────────────────────────────────────────────────────┐
│                    PLATFORM_ADMIN                         │
├──────────────────────────────────────────────────────────┤
│  Access:                                                  │
│  • /admin dashboard                                       │
│  • Create/view all organizations                          │
│                                                           │
│  Permissions:                                             │
│  ✓ POST /api/organizations                               │
│  ✓ GET  /api/organizations                               │
│  ✗ Organization-specific operations                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              ORG_ADMIN / ORG_USER                         │
├──────────────────────────────────────────────────────────┤
│  Access:                                                  │
│  • /org/[orgSlug]/admin dashboard                        │
│  • Manage events for their organization                   │
│  • View/manage ambassadors                                │
│                                                           │
│  Permissions:                                             │
│  ✓ POST /api/events                                      │
│  ✓ GET  /api/events (own org only)                      │
│  ✓ GET  /api/ambassadors (own org only)                 │
│  ✓ PATCH /api/ambassadors/[id] (own org only)           │
│  ✗ Other organizations' data                             │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    AMBASSADOR (Public)                    │
├──────────────────────────────────────────────────────────┤
│  Access:                                                  │
│  • /e/[eventSlug] public registration pages              │
│  • No authentication required                             │
│                                                           │
│  Permissions:                                             │
│  ✓ GET  /api/events/slug/[slug]                         │
│  ✓ POST /api/events/[id]/register                       │
│  ✗ No admin access                                       │
└──────────────────────────────────────────────────────────┘
```

## Data Relationships

```
Organization (1) ─────┬───── (many) User
                      │
                      └───── (many) Event (1) ───── (many) Ambassador
```

### Detailed Relationships:

```
┌─────────────────┐
│  Organization   │
│  • id           │◄─────┐
│  • name         │      │
│  • slug         │      │ organizationId (FK)
└─────────────────┘      │
         │               │
         │ organizationId│
         ▼               │
┌─────────────────┐      │
│      User       │      │
│  • id           │      │
│  • email        │      │
│  • role         │      │
│  • orgId        │──────┘
└─────────────────┘

┌─────────────────┐
│  Organization   │
│  • id           │◄───────┐
└─────────────────┘        │
         │                 │ organizationId (FK)
         │ organizationId  │
         ▼                 │
┌─────────────────┐        │
│      Event      │        │
│  • id           │◄───┐   │
│  • name         │    │   │
│  • slug         │    │   │
│  • orgId        │────┘   │
└─────────────────┘        │
         │                 │
         │ eventId         │
         ▼                 │
┌─────────────────┐        │
│   Ambassador    │        │
│  • id           │        │
│  • name         │        │
│  • email        │        │
│  • status       │        │
│  • eventId      │────────┘
└─────────────────┘
```

## Authentication Flow

```
┌──────────┐
│  User    │
│ /login   │
└────┬─────┘
     │ 1. Submit credentials
     ▼
┌─────────────────────────────┐
│  POST /api/auth/signin      │
│  (NextAuth Credentials)     │
└────┬────────────────────────┘
     │ 2. Verify credentials
     ▼
┌─────────────────────────────┐
│  Check User in DB           │
│  • Email exists?            │
│  • Password valid?          │
│    (bcrypt.compare)         │
└────┬────────────────────────┘
     │ 3. Generate JWT token
     ▼
┌─────────────────────────────┐
│  Create Session             │
│  JWT contains:              │
│  • user.id                  │
│  • user.role                │
│  • user.organizationId      │
│  • user.organizationSlug    │
└────┬────────────────────────┘
     │ 4. Set cookie
     ▼
┌─────────────────────────────┐
│  Redirect to dashboard      │
│  • PLATFORM_ADMIN → /admin  │
│  • ORG_ADMIN → /org/.../admin│
└─────────────────────────────┘
```

## Ambassador Registration Flow

```
┌─────────────────┐
│  Public User    │
│ /e/[eventSlug]  │
└────┬────────────┘
     │ 1. Visit event page
     ▼
┌─────────────────────────────┐
│ GET /api/events/slug/[slug] │
│ • Fetch event details       │
│ • No auth required          │
└────┬────────────────────────┘
     │ 2. Display event info
     ▼
┌─────────────────────────────┐
│  Fill Registration Form     │
│  • Name                     │
│  • Email                    │
└────┬────────────────────────┘
     │ 3. Submit form
     ▼
┌─────────────────────────────┐
│ POST /api/events/[id]/      │
│              register       │
│ • Validate email            │
│ • Check duplicates          │
│ • Create ambassador         │
│   status: PENDING           │
└────┬────────────────────────┘
     │ 4. Success
     ▼
┌─────────────────────────────┐
│  Show confirmation          │
│  "Registration successful!" │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  Org Admin sees in          │
│  /org/[slug]/admin          │
│  • New PENDING ambassador   │
│  • Can Accept/Reject        │
└─────────────────────────────┘
```

## Request Authorization Flow

```
                   ┌──────────────┐
                   │ HTTP Request │
                   └──────┬───────┘
                          │
                          ▼
                ┌───────────────────┐
                │   Middleware      │
                │ (for /admin, /org)│
                └────────┬──────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  JWT Token Valid?      │
            └────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │ Yes                    │ No
        ▼                        ▼
┌──────────────┐        ┌──────────────┐
│ Check Route  │        │ Redirect to  │
└──────┬───────┘        │  /login      │
       │                └──────────────┘
       ▼
┌─────────────────────────────┐
│  Route: /admin              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Role == PLATFORM_ADMIN?     │
└────┬────────────────────────┘
     │
  ┌──┴──┐
  │Yes  │No → Redirect /login
  ▼     
┌─────────────────────────────┐
│    Allow Request            │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Route: /org/[slug]/admin   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Role == ORG_ADMIN/ORG_USER? │
└────┬────────────────────────┘
     │
  ┌──┴──┐
  │Yes  │No → Redirect /login
  ▼     
┌─────────────────────────────┐
│ orgSlug == user.orgSlug?    │
└────┬────────────────────────┘
     │
  ┌──┴──┐
  │Yes  │No → Redirect /login
  ▼     
┌─────────────────────────────┐
│    Allow Request            │
└─────────────────────────────┘
```

## Multi-Tenancy Model

```
┌──────────────────────────────────────────────────────────┐
│                    MULTI-TENANT ISOLATION                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────┐       ┌────────────────────┐    │
│  │  Organization A    │       │  Organization B    │    │
│  │  (acme-corp)       │       │  (tech-inc)        │    │
│  ├────────────────────┤       ├────────────────────┤    │
│  │  Users:            │       │  Users:            │    │
│  │  • admin@acme.com  │       │  • admin@tech.com  │    │
│  │                    │       │                    │    │
│  │  Events:           │       │  Events:           │    │
│  │  • Conference 2025 │       │  • Tech Summit     │    │
│  │  • Workshop Series │       │  • Hackathon       │    │
│  │                    │       │                    │    │
│  │  Ambassadors:      │       │  Ambassadors:      │    │
│  │  • John (Conf)     │       │  • Sarah (Summit)  │    │
│  │  • Jane (Conf)     │       │  • Mike (Hack)     │    │
│  └────────────────────┘       └────────────────────┘    │
│           │                             │                │
│           │ Data Isolation              │                │
│           └──────────┬──────────────────┘                │
│                      │                                   │
│                      ▼                                   │
│     Users can ONLY access data from their org           │
│     enforced by: organizationId checks in API           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND                               │
├─────────────────────────────────────────────────────────┤
│  • Next.js 14 (App Router)                              │
│  • React 18                                              │
│  • TypeScript                                            │
│  • Tailwind CSS                                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND                                │
├─────────────────────────────────────────────────────────┤
│  • Next.js API Routes                                    │
│  • NextAuth.js (Auth.js)                                 │
│  • bcryptjs (password hashing)                           │
│  • Prisma ORM                                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                               │
├─────────────────────────────────────────────────────────┤
│  • PostgreSQL                                            │
└─────────────────────────────────────────────────────────┘
```
