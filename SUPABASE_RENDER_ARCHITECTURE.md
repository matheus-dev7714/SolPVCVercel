# Supabase + Render + Vercel Architecture

## Overview

This is a scalable architecture for your SOLPVE app:
- **Frontend:** Next.js on Vercel (static pages, client-side data fetching)
- **Database:** Supabase (PostgreSQL with real-time subscriptions)
- **Backend:** Node.js/Express on Render (background jobs, scheduled tasks, data processing)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                     │
│  - Next.js App                                          │
│  - Server Components                                    │
│  - API Routes (lightweight, read-only)                  │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Database)                     │
│  - PostgreSQL Database                                   │
│  - Real-time subscriptions                               │
│  - Row Level Security (RLS)                              │
│  - Built-in Auth (if needed)                             │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  RENDER (Backend Jobs)                    │
│  - Cron jobs                                             │
│  - Pool lock/resolution tasks                            │
│  - Price updates                                         │
│  - Solana transaction processing                         │
│  - Webhook handlers                                      │
└───────────────────────────────────────────────────────────┘
```

## Migration Plan

### Phase 1: Replace Prisma with Supabase Client ✅

1. Install Supabase
```bash
npm install @supabase/supabase-js
```

2. Replace `lib/prisma.ts` with `lib/supabase.ts`
3. Convert all `lib/pool-service.ts` queries from Prisma to Supabase
4. Update API routes to use Supabase client

### Phase 2: Create Supabase Tables

Use SQL migrations in Supabase instead of Prisma migrations:

```sql
-- Tables match Prisma schema but adapted for Supabase
CREATE TABLE pools (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  mint TEXT NOT NULL,
  logo_url TEXT,
  start_ts BIGINT NOT NULL,
  lock_ts BIGINT NOT NULL,
  end_ts BIGINT NOT NULL,
  line_bps INTEGER NOT NULL,
  pool_type TEXT NOT NULL DEFAULT 'PvMarket',
  status TEXT NOT NULL,
  winner TEXT,
  total_over_lamports BIGINT DEFAULT 0,
  total_under_lamports BIGINT DEFAULT 0,
  ai_confidence FLOAT NOT NULL,
  ai_model TEXT NOT NULL,
  ai_commit TEXT NOT NULL,
  ai_payload_url TEXT,
  proof_hash TEXT,
  proof_url TEXT,
  contract_address TEXT,
  contract_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_pools_status ON pools(status);
CREATE INDEX idx_pools_lock_ts ON pools(lock_ts);
CREATE INDEX idx_pools_end_ts ON pools(end_ts);
```

### Phase 3: Backend Services on Render

Deploy background workers to Render:

#### Service 1: Pool Lock Service (every 1 minute)
```javascript
// runs pool lock checks every minute
// updates pool status from OPEN to LOCKED
```

#### Service 2: Pool Resolution Service (every 5 minutes)
```javascript
// checks for pools that need resolution
// calls oracles, updates results
```

#### Service 3: Price Update Service (every 30 seconds)
```javascript
// fetches latest prices from Jupiter/Birdeye
// updates Supabase price_history table
```

#### Service 4: Transaction Listener
```javascript
// listens to Solana blockchain events
// processes entry/claim transactions
// updates pool totals in real-time
```

## Benefits of This Architecture

### For Scalability:
✅ Supabase handles auto-scaling database connections  
✅ Vercel handles frontend CDN and serverless functions  
✅ Render handles background processing separately  
✅ No single point of failure

### For Real-time Updates:
✅ Supabase real-time subscriptions for live data  
✅ Instant UI updates without polling  
✅ WebSocket connections managed by Supabase  

### For Development:
✅ No Prisma client generation needed (faster builds)  
✅ Direct SQL queries (more control)  
✅ Real-time subscriptions out of the box  
✅ Easy to add serverless functions later  

### For Cost:
✅ Vercel: Free for hobby, $20/month for pro  
✅ Supabase: Free tier (500MB), $25/month for pro  
✅ Render: Free tier available, pay as you scale  

Total: ~$45-70/month for production (much cheaper at scale)

## Implementation Checklist

### Immediate Changes (For Vercel deployment):
- [x] Remove Prisma dependency  
- [ ] Add Supabase client  
- [ ] Convert database queries  
- [ ] Test locally  
- [ ] Deploy to Vercel  

### Next Phase (Backend on Render):
- [ ] Create separate backend repo or folder  
- [ ] Set up Render services  
- [ ] Deploy background workers  
- [ ] Configure cron schedules  
- [ ] Set up monitoring  

## Configuration Files Needed

### 1. Environment Variables (.env)

```bash
# Supabase (for Vercel Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Supabase (for Render Backend)
DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 2. Supabase Client (`lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations (service role)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 3. Render Service Configuration

**render.yaml** (in your Render backend repo)
```yaml
services:
  - type: web
    name: pool-monitor
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
```

## Real-time Updates Example

### In Frontend Component:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function PoolCard({ poolId }: { poolId: number }) {
  const [totals, setTotals] = useState({ over: 0, under: 0 })

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel('pool-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'pools', filter: `id=eq.${poolId}` },
        (payload) => {
          setTotals({
            over: payload.new.total_over_lamports,
            under: payload.new.total_under_lamports
          })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [poolId])

  return <div>Over: {totals.over}, Under: {totals.under}</div>
}
```

## Summary

This architecture gives you:
- ✅ No Prisma dependency (faster builds on Vercel)
- ✅ Real-time updates with Supabase
- ✅ Scalable backend processing on Render
- ✅ Separation of concerns (frontend/backend/database)
- ✅ Better performance and lower costs

Ready to implement? Let me know if you want me to start the migration!

