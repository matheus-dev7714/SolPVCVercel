# Quick Deploy Instructions for Vercel + Supabase Fix

## What I Fixed

The 500 error was caused by your Prisma schema being configured for SQLite instead of PostgreSQL. Here's what changed:

1. ✅ Updated `prisma/schema.prisma` to use PostgreSQL
2. ✅ Added `postinstall` script to `package.json` to generate Prisma client
3. ✅ Updated `env.example` with PostgreSQL connection string format

## What You Need To Do

### Step 1: Get Your Supabase Database URL

1. Go to https://supabase.com and log into your project
2. Click "Settings" → "Database"
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Add Environment Variable to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add a new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string from Step 1
5. Make sure it's checked for "Production", "Preview", and "Development"
6. Click "Save"

### Step 3: Push Database Schema to Supabase

Option A - Using Prisma CLI (recommended):
```bash
# Install dependencies
npm install

# Push schema to Supabase
npx prisma db push
```

Option B - Using Supabase SQL Editor:
1. Go to Supabase project → SQL Editor
2. Copy the SQL from `prisma/schema.prisma` output
3. Or run locally: `npx prisma migrate dev --name init` and copy the SQL

### Step 4: Commit and Push

```bash
git add .
git commit -m "Fix: Update Prisma for PostgreSQL/Supabase"
git push origin main
```

### Step 5: Wait for Deployment

Vercel will automatically:
1. Install dependencies
2. Run `postinstall` (generates Prisma client)
3. Build the application
4. Deploy to production

**Check the build logs in Vercel dashboard!**

## Verify It Works

After deployment completes:
1. Visit your Vercel URL
2. Open browser dev tools (F12)
3. Check the Network tab
4. Visit a page that loads pools
5. Look for `/api/pools/top` request
6. Should return 200 OK with JSON data

## Still Getting 500 Error?

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on a failed function
   - Look for error messages

2. **Common Issues:**
   - DATABASE_URL not set correctly
   - Database schema not pushed to Supabase
   - Supabase connection pool exhausted (upgrade plan or check connection limits)

3. **Get More Help:**
   - Check logs: `vercel logs [deployment-url]`
   - Or go to Vercel dashboard → Logs

## Files Changed

- ✅ `prisma/schema.prisma` - Changed provider to postgresql
- ✅ `package.json` - Added postinstall script
- ✅ `env.example` - Updated DATABASE_URL format
- ✅ Created `VERCEL_DEPLOYMENT.md` - Detailed guide
- ✅ Created `DEPLOY_INSTRUCTIONS.md` - This file

## Need More Help?

Check `VERCEL_DEPLOYMENT.md` for detailed troubleshooting and additional resources.

