# Replit Setup Guide

This guide will help you deploy and run SOLPVE on Replit.

## Quick Start on Replit

### 1. Import to Replit
1. Fork or import this repository to Replit
2. Replit should automatically detect the `.replit` configuration

### 2. Set Environment Variables
Go to the "Secrets" tab (🔒 icon) in Replit and add these variables:

#### Required for Basic Functionality
```
DATABASE_URL=file:./prisma/dev.db
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_PROGRAM_ID=11111111111111111111111111111111
NEXT_PUBLIC_BASE_URL=https://your-repl-name.repl.co
```

#### Optional (for full functionality)
```
BIRDEYE_API_KEY=your_api_key_here
SHADOW_DRIVE_STORAGE_ACCOUNT=your_storage_account
SHADOW_DRIVE_WALLET_PRIVATE_KEY=your_base58_private_key
```

See `env.example` for the complete list of environment variables.

### 3. Initialize Database
Run these commands in the Replit Shell:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start the Application
Click the "Run" button or execute:
```bash
npm run dev
```

The app should now be accessible at your Replit URL!

---

## Database Options

### Option A: SQLite (Default - Easiest)
✅ Works out of the box on Replit  
✅ No external setup needed  
⚠️ Data persists only while Repl is active  
⚠️ Not recommended for production  

**Setup:**
```bash
DATABASE_URL="file:./prisma/dev.db"
```

### Option B: PostgreSQL (Recommended for Production)
✅ Better for production  
✅ Data persistence  
✅ Better performance at scale  

**Setup with Replit Database:**
1. Enable PostgreSQL in Replit's Database tab
2. Get connection string from Replit Database
3. Update DATABASE_URL in Secrets

**Setup with External PostgreSQL:**
Use services like:
- [Neon](https://neon.tech/) - Free tier available
- [Supabase](https://supabase.com/) - Free tier available
- [Railway](https://railway.app/) - Free tier available

Update your `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

---

## Solana Program Deployment

⚠️ **Important:** Replit cannot build Rust/Anchor programs. You'll need to:

### Option 1: Deploy from Local Machine
```bash
# On your local machine with Rust installed:
cd programs/solpve
anchor build
anchor deploy --provider.cluster devnet

# Copy the program ID and update in Replit Secrets:
NEXT_PUBLIC_SOLANA_PROGRAM_ID=<your_deployed_program_id>
```

### Option 2: Use Pre-deployed Program
If the program is already deployed, just use that program ID in your environment variables.

---

## Common Issues & Solutions

### Port Already in Use
Replit assigns ports automatically. The app is configured to use port 3000, but Replit will expose it on port 80 externally.

### Database Connection Errors
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database if needed
npm run db:reset
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development vs Production

### Development Mode (Default)
```bash
npm run dev
```
- Hot reload
- Better error messages
- Slower performance

### Production Mode
```bash
npm run build
npm start
```
- Optimized builds
- Faster performance
- Use this for deployed Repls

---

## Folder Structure on Replit

```
SOLPVE/
├── app/                    # Next.js pages
├── components/             # React components
├── lib/                    # Backend services
├── prisma/                 # Database
│   ├── dev.db             # SQLite database
│   └── schema.prisma      # Schema definition
├── .replit                # Replit configuration
├── replit.nix             # Nix environment
└── env.example            # Environment template
```

---

## What's Different from Local Development?

1. **No Rust/Anchor building** - Deploy Solana program separately
2. **Port handling** - Replit manages ports automatically
3. **Environment variables** - Use Replit's Secrets tab instead of `.env` file
4. **Persistent storage** - Consider using PostgreSQL for data persistence
5. **Build optimization** - Consider running in production mode

---

## Next Steps After Setup

1. ✅ Verify the app loads at your Replit URL
2. ✅ Check that pools are displayed (from seed data)
3. ✅ Test pool detail pages
4. ⚠️ Deploy Solana program (required for transactions)
5. ⚠️ Update program ID in environment variables
6. ⚠️ Test enter/claim transactions with a Solana wallet

---

## Performance Tips

1. **Use production build** for better performance:
   ```bash
   npm run build && npm start
   ```

2. **Keep Repl active** - Free Repls sleep after inactivity. Consider:
   - Upgrading to a paid plan
   - Using an uptime monitoring service

3. **Database optimization**:
   - Use PostgreSQL for production
   - Add indexes to frequently queried columns

---

## Support & Resources

- **Main README:** [README.md](./README.md)
- **Backend Guide:** [BackendUpdateGuide.md](./BackendUpdateGuide.md)
- **Implementation Status:** [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **Replit Docs:** https://docs.replit.com/
- **Next.js Docs:** https://nextjs.org/docs

---

## Checklist for Deployment

- [ ] Repository imported to Replit
- [ ] Environment variables configured in Secrets
- [ ] Dependencies installed (`npm install`)
- [ ] Database initialized (`npm run db:migrate`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] App running and accessible
- [ ] Solana program deployed (if needed)
- [ ] Program ID updated in environment
- [ ] Test transactions working

**Status:** Ready for Replit deployment! 🚀

