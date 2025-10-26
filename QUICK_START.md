# Quick Start: Fix Vercel 500 Error

## What I Fixed ✅

1. Changed database from SQLite to PostgreSQL (for Supabase)
2. Added automatic Prisma client generation during builds
3. Updated environment variables format

## What You Need To Do (5 minutes)

### 1. Get Supabase URL (1 min)
```
Supabase → Your Project → Settings → Database → Connection string → URI
Copy the string that looks like:
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 2. Add to Vercel (2 min)
```
Vercel → Your Project → Settings → Environment Variables
Name: DATABASE_URL
Value: [paste Supabase URL]
✓ Check Production, Preview, Development
Save
```

### 3. Deploy Database (1 min)
Run locally:
```bash
npx prisma db push
```

### 4. Push Code (1 min)
```bash
git add .
git commit -m "Fix: Update for PostgreSQL"
git push
```

### 5. Wait for Deployment (2-5 min)
Vercel will automatically build and deploy.

## That's It! 🎉

Your app should now work on Vercel without 500 errors.

## Need Help?

- Quick guide: `DEPLOY_INSTRUCTIONS.md`
- Detailed guide: `VERCEL_DEPLOYMENT.md`
- This summary: `SUMMARY.md`

