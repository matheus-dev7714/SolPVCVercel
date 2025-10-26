# Vercel + Supabase Deployment Guide

This guide helps you fix the 500 error on Vercel after switching to Supabase.

## Problem
The application was originally configured for SQLite (`provider = "sqlite"`) but now uses Supabase, which requires PostgreSQL. This caused deployment failures on Vercel.

## Solution Applied

### 1. Updated Prisma Schema
Changed from SQLite to PostgreSQL:
- File: `prisma/schema.prisma`
- Changed `provider = "sqlite"` → `provider = "postgresql"`

### 2. Updated Build Scripts
Added Prisma client generation to build process:
- File: `package.json`
- Added `postinstall` script: `"postinstall": "prisma generate"`
- Updated `build` script: `"build": "prisma generate && next build"`

### 3. Environment Variables for Vercel

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these environment variables:

#### Required Variables:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

To get your connection string:
1. Go to your Supabase project
2. Settings → Database
3. Copy the connection string under "Connection string"
4. Replace `[YOUR-PASSWORD]` with your actual database password

#### Optional Variables (if not set, defaults will be used):
```
NEXT_PUBLIC_BASE_URL=https://your-site.vercel.app
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_PROGRAM_ID=11111111111111111111111111111111
```

### 4. Run Prisma Migration

After setting up environment variables in Vercel:

```bash
# In your local terminal (if you have access)
npx prisma migrate deploy
```

Or run the migration directly on Supabase:
1. Go to Supabase project → SQL Editor
2. Create a new query
3. Copy the SQL from your migration files in `prisma/migrations/`
4. Execute the SQL

**Alternative: Push schema to Supabase**
```bash
npx prisma db push
```

This will sync your Prisma schema directly to the Supabase database without creating migration files.

## Deployment Steps

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix: Update Prisma schema for PostgreSQL/Supabase"
   git push origin main
   ```

2. **Vercel will automatically deploy:**
   - Wait for the build to complete
   - The `postinstall` script will generate the Prisma client
   - The build will proceed with Next.js

3. **Verify deployment:**
   - Check Vercel deployment logs for any errors
   - Test the API endpoints: `/api/pools/top`

## Troubleshooting

### Error: P1001 - Can't reach database server
- Check your `DATABASE_URL` is correct
- Verify Supabase database is running
- Check if IP allowlist is configured (Supabase may require it for Vercel IPs)

### Error: P2002 - Unique constraint violation
- The database tables already exist with different schema
- Run `npx prisma db push --force-reset` (⚠️ This will delete all data)

### Build Error: Prisma Client not found
- Ensure `postinstall` script is in `package.json`
- Vercel should run it automatically during build

### Still seeing 500 errors?
- Check Vercel function logs for detailed error messages
- Verify all required environment variables are set
- Ensure Supabase database is accessible from Vercel servers

## Additional Resources

- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Connection String](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Quick Test

Once deployed, test the API:
```bash
curl https://your-site.vercel.app/api/pools/top
```

Should return JSON array of pools.

