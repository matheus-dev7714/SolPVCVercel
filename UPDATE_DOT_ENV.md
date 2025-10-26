# Update Your .env File

Your `.env` file was created but needs to be updated to use your Supabase connection.

## Option 1: Manual Edit (Recommended)

Open `.env` file and make these changes:

**Find this line:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solpve"
```

**Comment it out and uncomment the Supabase line:**
```
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solpve"
DATABASE_URL="postgresql://postgres:passionate_123@db.sssvrlmmhrbatxdfwtes.supabase.co:5432/postgres?sslmode=require"
```

The key difference is adding `?sslmode=require` at the end - this is required for Supabase connections.

## Option 2: PowerShell One-Liner

Run this in PowerShell from your project directory:

```powershell
(Get-Content .env) -replace '^DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solpve"', '# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solpve"' | Set-Content .env.tmp; (Get-Content .env) -replace '^# DATABASE_URL="postgresql://postgres:passionate_123@db.sssvrlmmhrbatxdfwtes.supabase.co:5432/postgres"', 'DATABASE_URL="postgresql://postgres:passionate_123@db.sssvrlmmhrbatxdfwtes.supabase.co:5432/postgres?sslmode=require"' | Set-Content .env
```

## After Updating

Then run:
```bash
npx prisma db push
```

This should now work!

## If You Still Get Connection Errors

The connection might be blocked by Supabase IP allowlist. To fix:

1. Go to Supabase Dashboard
2. Settings → Database
3. Find "Connection pooling" or "Allowed IP addresses"
4. Add your IP address or allow all IPs (0.0.0.0/0) for testing

**Note:** For production on Vercel, you'll need to either:
- Whitelist Vercel IPs
- Use connection pooling (recommended)
- Or allow all IPs in development/testing


