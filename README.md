# SOLPVE - Solana PvE Prediction Markets

Decentralized prediction markets for Solana token price movements. Users bet on whether a token's price will move "Over" or "Under" an AI-predicted line.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use a hosted service like Supabase/Neon)
- (Optional) Rust & Anchor CLI for building/deploying Solana program
- (Optional) Solana CLI for wallet management

### Installation

#### Local Development
```bash
# 1. Clone and install
git clone <your-repo>
cd SOLPVE
npm install

# 2. Setup environment
cp env.example .env
# Edit .env and add your DATABASE_URL

# 3. Initialize database
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Run migrations
npm run db:seed       # Populate test data

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000** (or whichever port is assigned)

#### Replit Deployment
See **[REPLIT_SETUP.md](./REPLIT_SETUP.md)** for detailed Replit deployment instructions.

**Quick Replit Setup:**
1. Import repo to Replit
2. Add environment variables in Secrets tab (see `env.example`)
3. Run: `npm install && npm run db:migrate && npm run db:seed`
4. Click "Run"

### Building & Deploying the Solana Program (Optional)

The Solana program is already coded but needs to be built and deployed:

```bash
# 1. Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

# 3. Build the program
anchor build

# 4. Deploy to devnet (requires SOL in wallet)
anchor deploy --provider.cluster devnet

# 5. Update .env with program ID from deployment
# Copy the program ID shown after deployment
# Add: NEXT_PUBLIC_SOLANA_PROGRAM_ID="<your-program-id>"
```

**Note:** For development, you can test the backend without deploying. The program deployment is only needed for end-to-end transaction testing.

---

## 📁 Project Structure

```
SOLPVE/
├── programs/                     # Solana Programs
│   └── solpve/                  # Anchor program (Rust)
│       ├── Cargo.toml           # Rust dependencies
│       └── src/lib.rs           # Program code ⭐ NEW
├── app/                         # Next.js App Router
│   ├── api/                    # API routes
│   │   ├── pools/top/          # GET top pools
│   │   ├── pool/[id]/          # GET pool details
│   │   └── tx/                 # Transaction builders ✅ UPDATED
│   ├── pool/[id]/              # Pool detail page
│   └── page.tsx                # Homepage
├── components/                  # React components
├── lib/                         # Backend services
│   ├── pool-service.ts         # Pool database operations
│   ├── price-service.ts        # Price fetching (Jupiter/Birdeye)
│   ├── oracle-service.ts       # Pool resolution & proofs
│   ├── storage-service.ts      # Shadow Drive integration
│   ├── solana-service.ts       # Transaction building ⭐ NEW
│   ├── transaction-listener.ts # Event monitoring ⭐ NEW
│   ├── prisma.ts               # Database client
│   └── idl/solpve.ts           # Program IDL ⭐ NEW
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Test data
├── types/                       # TypeScript definitions
├── Anchor.toml                  # Anchor configuration ⭐ NEW
└── BackendUpdateGuide.md        # Detailed implementation guide
```

---

## 🗄️ Database

### Schema
- **pools** - Pool configuration and state
- **entries** - User entries (bets)
- **price_history** - Price data points for charts
- **resolutions** - Pool resolution audit trail

### Commands
```bash
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:reset     # Reset database (WARNING: deletes all data)
```

---

## 🔧 Environment Variables

### Required
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/solpve"
```

### Optional (Development)
```env
SOLANA_RPC_URL="https://api.devnet.solana.com"
BIRDEYE_API_KEY="your_key"  # Fallback price feed
NEXT_PUBLIC_BASE_URL="http://localhost:3004"
```

### Required (Production)
```env
SOLANA_RPC_URL="your_mainnet_rpc"
SHADOW_DRIVE_STORAGE_ACCOUNT="your_pubkey"
SHADOW_DRIVE_WALLET_PRIVATE_KEY="your_private_key_base58"
NEXT_PUBLIC_SOLANA_PROGRAM_ID="your_deployed_program_id"
```

See `.env.example` for full list.

---

## 📊 Features

### ✅ Implemented
- 🎨 Full responsive UI (Next.js 14, Tailwind CSS, Radix UI)
- 🗄️ PostgreSQL database with Prisma ORM
- 💰 Pool management (CRUD operations)
- 📈 Price fetching from Jupiter/Birdeye APIs
- 🔮 Oracle service for pool resolution
- 📦 Shadow Drive integration for proof storage
- 🌱 Seed script with test data
- 🔄 Real-time data via ISR (Incremental Static Regeneration)
- 🔐 **Solana Anchor program (complete, needs deployment)** ⭐ NEW
- 💸 **Transaction building API routes (enter/claim)** ⭐ NEW
- ⚡ **Transaction listener service** ⭐ NEW
- 🔗 **TypeScript IDL for type-safe interactions** ⭐ NEW

### 🚧 In Progress
- 🚀 Deploy Anchor program to devnet
- 🧪 End-to-end testing with real transactions
- ⏰ Automated pool lifecycle (cron jobs)
- 👤 Frontend wallet transaction flow

### 📋 Planned
- 🛡️ Admin dashboard
- 📊 Analytics & statistics
- 🔔 Notifications
- 📱 Mobile app
- 🌐 Mainnet deployment

---

## 🧪 Testing

### Manual Testing
1. Start the dev server: `npm run dev`
2. Visit homepage - should show pools from database
3. Click on a pool - should show detail page with chart
4. Check Prisma Studio: `npm run db:studio`

### Automated Testing (TODO)
```bash
npm install -D vitest @vitest/ui
npm run test
```

---

## 📚 Documentation

- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Current implementation progress
- **[BackendUpdateGuide.md](./BackendUpdateGuide.md)** - Detailed backend guide
- **[Frontend Types](./types/pve.ts)** - TypeScript type definitions

---

## 💡 How It Works

1. **Pool Creation** - Admin creates a pool with AI prediction line (e.g., BONK +3.00%)
2. **Entry Period** - Users enter "Over" or "Under" with SOL
3. **Lock** - Pool locks at `lock_ts`, no more entries
4. **Resolution** - At `end_ts`, oracle fetches final price and determines winner
5. **Claim** - Winners claim their share of the total pool

### Example
```
Pool: BONK +3.00% (AI prediction)
Start: 100 SOL Over, 80 SOL Under
Final: Price moved +4.5% → Over wins
Payout: Over side splits 180 SOL total pool
```

---

## 🤝 Contributing

1. Check `IMPLEMENTATION_STATUS.md` for next steps
2. Follow existing code patterns in `lib/` services
3. All database operations go through `lib/*-service.ts`
4. All amounts stored as **lamports** (integers)
5. Use TypeScript types from `types/pve.ts`

---

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Regenerate Prisma Client
npm run db:generate
```

### Port already in use
The dev server will automatically try ports 3000, 3001, 3002, etc.
Check console for actual port being used.

### TypeScript errors
```bash
# Regenerate Prisma types
npm run db:generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📝 License

MIT

---

## 🔗 Links

- [Solana Docs](https://docs.solana.com/)
- [Shadow Drive Docs](https://docs.genesysgo.com/shadow/shadow-drive)
- [Jupiter API](https://station.jup.ag/docs/apis/price-api)
- [Prisma Docs](https://www.prisma.io/docs)

---

**Status:** 🟡 Development (Backend + Solana program complete, ready for deployment & testing)
