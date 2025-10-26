# Fixing Supabase Connection Issues

You're getting "Can't reach database server" error. This is usually because:

## Problem
Supabase might be blocking connections from your IP or you need to use connection pooling.

## Solution 1: Get Connection Pooling URL (Recommended)

1. Go to https://supabase.com → Your Project
2. Click **Settings** → **Database**
3. Scroll to **Connection Pooling** section
4. Find "Connection string" under **Transaction** mode
5. Copy that URL (it should have a different port or format)

It will look something like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.sssvrlmmhrbatxdfwtes.supabase.co:6543/postgres?pgbouncer=true
```

## Solution 2: Allow Your IP Address

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Find "Network restrictions" or "Allowed IPs"
4. Add your IP address: https://www.whatismyip.com/
5. Or temporarily allow all: `0.0.0.0/0` (for testing only!)

## Solution 3: Update .env with Pooling URL

Update your `.env` file to use the pooling URL:
```bash
DATABASE_URL="postgresql://postgres:passionate_123@db.sssvrlmmhrbatxdfwtes.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
```

Note the changes:
- Port 6543 instead of 5432 (or whatever Supabase shows)
- Added `pgbouncer=true` parameter

## After Getting the Right URL

1. Update `.env` with the correct connection string
2. Run: `npx prisma db push`
3. Should work now!

## Alternative: Skip Local Push, Deploy to Vercel

If you can't get local connection working, you can:

1. Set the DATABASE_URL in Vercel environment variables
2. Push your code to GitHub
3. Vercel will build and you can run migrations there

Then add this to `package.json` build script to auto-run migrations:
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

This will automatically run migrations when Vercel builds your app.


