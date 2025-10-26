# SOLPVE Lovable Migration Guide

## Overview

This guide outlines the steps to migrate the SOLPVE project from Next.js + Prisma to Lovable (Vite + React Router + Supabase).

## Migration Status

### ✅ Completed
1. **Project Structure Migration**
   - Created Vite configuration (`vite.config.ts`)
   - Set up React Router in `src/App.tsx`
   - Moved all components to `src/components/`
   - Moved all hooks to `src/hooks/`
   - Moved all lib utilities to `src/lib/`
   - Moved all types to `src/types/`
   - Created entry point `src/main.tsx`
   - Created HTML entry point `index.html`

2. **Styling Migration**
   - Converted design tokens to HSL color system in `src/index.css`
   - Updated Tailwind configuration for Lovable compatibility
   - Maintained custom utility classes (glass-panel, gradient-primary, etc.)

3. **Routing Migration**
   - Converted Next.js file-based routes to React Router explicit routes
   - `/` → `src/pages/Index.tsx`
   - `/pool/[id]` → `src/pages/Pool.tsx`
   - `/vsai/pool/[id]` → `src/pages/VsAIPool.tsx`
   - `/vsmarket/pool/[id]` → `src/pages/VsMarketPool.tsx`
   - Replaced `next/link` with `react-router-dom` Link
   - Replaced `next/navigation` useParams with `react-router-dom` useParams

4. **Dependencies Update**
   - Added `@tanstack/react-query` for data fetching
   - Added `react-router-dom@6` for routing
   - Added `vite` and `@vitejs/plugin-react-swc` for build
   - Removed Next.js dependencies
   - Updated package.json scripts for Vite

### 🚧 Partially Completed / Needs User Action

#### Backend Migration (Prisma → Supabase)

**Current State:** API routes are still using Prisma and designed for Next.js

**What Needs to Be Done:**

1. **Create Supabase Database Schema**
   - Tables to create:
     - `pools` - Pool configuration and state
     - `entries` - User entries (bets)
     - `pool_history` - Historical data
     - `ai_predictions` - AI prediction history
   
   **Example Prisma to Supabase Conversion:**
   
   ```sql
   -- Pools table
   CREATE TABLE pools (
     id BIGSERIAL PRIMARY KEY,
     token VARCHAR(50) NOT NULL,
     mint VARCHAR(100) NOT NULL,
     logo TEXT,
     pool_type VARCHAR(20) NOT NULL, -- 'PvAI' or 'PvMarket'
     start_ts BIGINT NOT NULL,
     lock_ts BIGINT NOT NULL,
     end_ts BIGINT NOT NULL,
     line_bps INTEGER,
     status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'LOCKED', 'RESOLVED'
     winner VARCHAR(10), -- 'Over' or 'Under'
     total_over BIGINT DEFAULT 0,
     total_under BIGINT DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Entries table
   CREATE TABLE entries (
     id BIGSERIAL PRIMARY KEY,
     pool_id BIGINT REFERENCES pools(id),
     user_pubkey VARCHAR(100) NOT NULL,
     side VARCHAR(10) NOT NULL, -- 'Over' or 'Under'
     amount_lamports BIGINT NOT NULL,
     entry_pda VARCHAR(100),
     transaction_signature VARCHAR(100),
     claimed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- AI predictions table
   CREATE TABLE ai_predictions (
     id BIGSERIAL PRIMARY KEY,
     pool_id BIGINT REFERENCES pools(id),
     timestamp BIGINT NOT NULL,
     line_bps INTEGER NOT NULL,
     confidence NUMERIC(3,2),
     model VARCHAR(50),
     commit_hash VARCHAR(100),
     payload_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Indexes
   CREATE INDEX idx_pools_status ON pools(status);
   CREATE INDEX idx_entries_pool_user ON entries(pool_id, user_pubkey);
   CREATE INDEX idx_entries_user ON entries(user_pubkey);
   ```

2. **Convert API Routes to Edge Functions**
   
   Sample Edge Functions have been created in `supabase/functions/`:
   - `pools-top` - Get top pools list
   
   **Remaining Edge Functions to Create:**
   - `pool-detail` - Get pool by ID
   - `vsai-pool-detail` - Get VS AI pool by ID
   - `vsmarket-pool-detail` - Get VS Market pool by ID
   - `tx-enter` - Build entry transaction
   - `tx-claim` - Build claim transaction

3. **Update API Calls in Frontend**
   
   Current frontend calls like:
   ```typescript
   fetch('/api/pools/top')
   ```
   
   Need to be updated to:
   ```typescript
   fetch(`${supabaseUrl}/functions/v1/pools-top`, {
     headers: {
       'Authorization': `Bearer ${supabaseAnonKey}`
     }
   })
   ```
   
   **Recommended:** Create a service layer in `src/lib/api-client.ts`:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

   export async function fetchTopPools() {
     const response = await fetch(
       `${SUPABASE_URL}/functions/v1/pools-top`,
       {
         headers: {
           'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
         }
       }
     );
     return response.json();
   }
   ```

#### Solana Integration Considerations

The current project uses Anchor and custom Solana program logic. This **can remain the same** as it's client-side blockchain interaction. However:

1. **Environment Variables:** Update to use Vite's `import.meta.env` instead of `process.env`
   - `VITE_SOLANA_RPC_URL`
   - `VITE_ANCHOR_PROGRAM_ID`

2. **Storage for Transactions:** Consider using Supabase Storage or Tables to track transaction history instead of Prisma

3. **Update lib files** that reference `process.env`:
   ```typescript
   // Before (Next.js)
   const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC;
   
   // After (Vite)
   const rpcUrl = import.meta.env.VITE_SOLANA_RPC;
   ```

### 🔲 Not Yet Started

1. **Environment Variables Migration**
   - Create `.env.local` with:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     VITE_SOLANA_RPC_URL=your_rpc_url
     VITE_ANCHOR_PROGRAM_ID=your_program_id
     ```

2. **React Query Integration**
   - Wrap API calls with React Query hooks for better caching/refetching
   - Example:
     ```typescript
     export function useTopPools() {
       return useQuery({
         queryKey: ['pools', 'top'],
         queryFn: fetchTopPools,
         staleTime: 30000, // 30 seconds
       });
     }
     ```

3. **Supabase Client Setup**
   - Create `src/integrations/supabase/client.ts`
   - Initialize Supabase client for database operations

4. **Testing**
   - Test all routes work with React Router
   - Test all API calls work with Edge Functions
   - Test Solana wallet integration
   - Test transaction building and submission

## Deployment Steps for Lovable

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: migrate to Lovable structure"
   git push origin main
   ```

2. **Import to Lovable**
   - Go to lovable.dev
   - Click "Import from GitHub"
   - Select your repository
   - Wait for initial import

3. **Configure Supabase Backend**
   - Enable Lovable Cloud in project settings
   - This auto-provisions a Supabase instance
   - Copy connection details to environment variables

4. **Deploy Edge Functions**
   - Use Lovable's interface to deploy functions
   - Or use Supabase CLI:
     ```bash
     supabase functions deploy pools-top
     supabase functions deploy pool-detail
     # etc.
     ```

5. **Set Environment Variables**
   - In Lovable project settings, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_SOLANA_RPC_URL`
     - `VITE_ANCHOR_PROGRAM_ID`

6. **Test and Iterate**
   - Use Lovable's preview environment
   - Test all functionality
   - Make adjustments as needed

## Key Differences to Note

### File Structure
| Next.js | Lovable |
|---------|---------|
| `app/page.tsx` | `src/pages/Index.tsx` |
| `app/pool/[id]/page.tsx` | `src/pages/Pool.tsx` (with useParams) |
| `app/api/*/route.ts` | `supabase/functions/*/index.ts` |
| `components/` | `src/components/` |
| `lib/` | `src/lib/` |
| `.env.local` | `.env.local` (but use `VITE_` prefix) |

### Imports
| Next.js | Lovable |
|---------|---------|
| `import Link from 'next/link'` | `import { Link } from 'react-router-dom'` |
| `import { useParams } from 'next/navigation'` | `import { useParams } from 'react-router-dom'` |
| `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` |

### Data Fetching
| Next.js | Lovable |
|---------|---------|
| Server Components + fetch | React Query + client-side fetch |
| `getServerSideProps` | `useQuery` hook |
| API Routes | Supabase Edge Functions |

### Database
| Next.js/Prisma | Lovable/Supabase |
|----------------|-------------------|
| Prisma schema | SQL migrations |
| `prisma.pool.findMany()` | `supabase.from('pools').select()` |
| Local SQLite/PostgreSQL | Supabase PostgreSQL |

## Troubleshooting

### Issue: API calls returning 404
**Solution:** Ensure Edge Functions are deployed and callable. Check CORS headers.

### Issue: Environment variables undefined
**Solution:** Ensure variables use `VITE_` prefix and are set in Lovable project settings.

### Issue: Wallet not connecting
**Solution:** Check Solana RPC URL is correct. Verify wallet adapter is properly initialized in AppProvider.

### Issue: Routing doesn't work on refresh
**Solution:** Configure Lovable deployment to use SPA fallback (already handled by Vite).

## Next Steps

1. **Complete Edge Functions:** Create remaining Edge Functions for all API routes
2. **Migrate Database:** Set up Supabase tables and migrate any existing data
3. **Test Thoroughly:** Test all user flows (view pools, enter pool, claim winnings)
4. **Update Documentation:** Update README with new setup instructions
5. **Deploy:** Push to Lovable and go live!

## Support Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Created:** 2025-10-16
**Last Updated:** 2025-10-16
**Status:** In Progress - Core structure migrated, backend conversion needed


