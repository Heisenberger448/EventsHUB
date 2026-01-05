# 🚀 Quick Start Guide

Follow these steps to get your SharedCrowd platform up and running locally.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- Git (optional)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, and Tailwind CSS.

### 2️⃣ Configure Database

**Update the `.env` file** with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/sharedcrowd?schema=public"
```

Replace:
- `YOUR_USER` with your PostgreSQL username (often `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password

**Create the database** (if it doesn't exist):

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sharedcrowd;

# Exit
\q
```

### 3️⃣ Setup Database Schema

Generate Prisma Client:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

### 4️⃣ Seed Sample Data

```bash
npm run db:seed
```

This creates:
- ✅ Platform admin: `admin@sharedcrowd.com` / `admin123`
- ✅ Organization: "Acme Corporation" (slug: `acme-corp`)
- ✅ Org admin: `admin@acme-corp.com` / `orgadmin123`
- ✅ Sample event: "Summer Conference 2025"
- ✅ Sample ambassadors

### 5️⃣ Start Development Server

```bash
npm run dev
```

🎉 Your app is now running at [http://localhost:3000](http://localhost:3000)

## Test the Platform

### Platform Admin Dashboard

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with:
   - Email: `admin@sharedcrowd.com`
   - Password: `admin123`
3. You'll be redirected to `/admin`
4. Try creating a new organization

### Organization Admin Dashboard

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with:
   - Email: `admin@acme-corp.com`
   - Password: `orgadmin123`
3. You'll be redirected to `/org/acme-corp/admin`
4. Try creating a new event
5. View and manage ambassador registrations

### Public Event Page

1. Go to [http://localhost:3000/e/summer-conference-2025](http://localhost:3000/e/summer-conference-2025)
2. Fill out the ambassador registration form
3. Submit the registration
4. Login as org admin to see the new registration

## Useful Commands

```bash
# View database in browser UI
npm run db:studio

# Run TypeScript type checking
npm run lint

# Build for production
npm run build

# Run production build
npm run start
```

## Common Issues & Solutions

### ❌ Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solution**:
1. Make sure PostgreSQL is running: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)
2. Verify your DATABASE_URL in `.env`
3. Test connection: `psql -U postgres -d sharedcrowd`

### ❌ Prisma Client Not Found

**Problem**: Import errors for `@prisma/client`

**Solution**:
```bash
npm run db:generate
```

### ❌ Authentication Not Working

**Problem**: Can't login or session issues

**Solution**:
1. Clear browser cookies and local storage
2. Check that NEXTAUTH_URL matches your app URL
3. Restart the dev server: `npm run dev`

### ❌ TypeScript Errors

**Problem**: Type errors in the editor

**Solution**:
```bash
# Delete build artifacts and reinstall
rm -rf .next node_modules
npm install
npm run db:generate
```

## Next Steps

Now that your platform is running:

1. **Explore the codebase**
   - Check `app/admin/page.tsx` for platform admin UI
   - Look at `app/org/[orgSlug]/admin/page.tsx` for org admin UI
   - Review API routes in `app/api/`

2. **Customize for your needs**
   - Update branding and styling in components
   - Modify database schema in `prisma/schema.prisma`
   - Add new fields to forms

3. **Add features**
   - Email notifications
   - File uploads
   - Analytics dashboard
   - See README.md for more ideas

4. **Prepare for production**
   - Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`
   - Set up proper PostgreSQL database
   - Configure environment variables
   - Enable HTTPS
   - Add rate limiting

## Need Help?

- Check `README.md` for comprehensive documentation
- Review `STRUCTURE.md` for detailed file structure
- Look at the API routes for backend logic
- Check Prisma schema for data model

Enjoy building with SharedCrowd! 🎉
