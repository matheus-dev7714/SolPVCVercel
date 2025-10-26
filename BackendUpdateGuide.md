# Backend Update Guide for SOLPVE

## Current State Analysis

### Frontend-Backend Integration
The frontend is **fully implemented** with complete UI components and data flow. All API endpoints are currently returning **dummy/placeholder data**. The frontend expects specific data structures and will work seamlessly once the backend is properly implemented.

### Existing Type System (`types/pve.ts`)

#### Core Types
```typescript
Side = "Over" | "Under"
Status = "OPEN" | "LOCKED" | "RESOLVED" | "VOID"
```

#### Data Structures

**Totals** (lamports - 1 SOL = 1,000,000,000 lamports)
- `over: number` - Total lamports in Over pool
- `under: number` - Total lamports in Under pool

**AIChipData**
- `confidence: number` (0..1) - AI model confidence level
- `model: string` - Model version (e.g., "pve-v0.3.0")
- `commit: string` - Hex SHA256 hash (e.g., "0xA1B2C3D4...")
- `payload_url?: string | null` - Link to AI model payload/proof

**PoolListItem** (for homepage grid)
- `id: number` - Pool unique identifier
- `token: string` - Token symbol (e.g., "BONK")
- `mint: string` - Solana mint address
- `logo?: string | null` - Token logo URL (optional)
- `line_bps: number` - AI prediction line in basis points (300 = +3.00%)
- `confidence: number` - Duplicate of ai.confidence for quick access
- `lock_ts: number` - Unix timestamp when entries close
- `end_ts: number` - Unix timestamp when pool resolves
- `totals: Totals` - Current pool totals
- `status: Status` - Pool status
- `ai: AIChipData` - AI model metadata

**PoolDetail** (for detail page)
- All fields from PoolListItem, plus:
- `start_ts: number` - Unix timestamp when pool opens
- `winner: Side | "Void" | null` - Winning side (null if not resolved)
- `proof: ProofData` - Resolution proof data
- `chart: ChartPoint[]` - Price history data
- `contract_url?: string | null` - Solscan link to contract

**ChartPoint**
- `t: number` - Unix timestamp
- `p: number` - Price at that time

**ProofData**
- `hash: string | null` - SHA256 hash of resolution proof (null when pending)
- `url: string | null` - Link to proof JSON (S3/IPFS)

---

## API Routes Implementation Status

### Current Routes (All Stubs)

#### 1. `GET /api/pools/top`
**Location:** `app/api/pools/top/route.ts:96-98`
- **Purpose:** Return top pools by volume for homepage
- **Current:** Returns 5 hardcoded dummy pools
- **Returns:** `PoolListItem[]`

#### 2. `GET /api/pool/[id]`
**Location:** `app/api/pool/[id]/route.ts:32-36`
- **Purpose:** Return detailed pool data for pool detail page
- **Current:** Returns one hardcoded pool with chart data
- **Returns:** `PoolDetail`
- **Note:** Pool detail page expects baseUrl on `localhost:3004` currently (app/pool/[id]/page.tsx:18)

#### 3. `POST /api/tx/enter`
**Location:** `app/api/tx/enter/route.ts:3-9`
- **Purpose:** Create and return entry transaction for user to sign
- **Current:** Returns placeholder string
- **Expected Request Body:**
  ```typescript
  {
    pool_id: number
    side: Side  // "Over" | "Under"
    lamports: number  // Total amount including fee
    user_pubkey: string  // Solana public key
  }
  ```
- **Expected Response:**
  ```typescript
  {
    tx: string  // Base64-encoded Solana transaction
  }
  ```
- **Used by:** `components/entry-form.tsx:50-65`

#### 4. `POST /api/tx/claim`
**Location:** `app/api/tx/claim/route.ts:3-9`
- **Purpose:** Create and return claim transaction for winner to sign
- **Current:** Returns placeholder string
- **Expected Request Body:**
  ```typescript
  {
    pool_id: number
    user_pubkey: string  // Solana public key
  }
  ```
- **Expected Response:**
  ```typescript
  {
    tx: string  // Base64-encoded Solana transaction
  }
  ```
- **Used by:** `components/claim-panel.tsx:11-24`

---

## Business Logic & Constants

### Transaction Fee (`lib/format.ts` & `entry-form.tsx:12`)
```typescript
FEE_BPS = 75  // 0.75% fee
LAMPORTS_PER_SOL = 1_000_000_000
```

**Fee Calculation:**
```typescript
amountLamports = userInputSOL * 1_000_000_000
feeLamports = Math.floor((amountLamports * 75) / 10000)
netLamports = amountLamports - feeLamports
```

### Payout Estimation (`lib/format.ts:20-24`)
```typescript
function estimatePayoutWin(
  userNetLamports: number,
  totalWinner: number,  // Total in winning side AFTER user joins
  totalOver: number,
  totalUnder: number
) {
  const totalPool = totalOver + totalUnder
  if (totalWinner === 0) return 0
  return Math.floor((userNetLamports * totalPool) / totalWinner)
}
```

**Logic:** User's share of the total pool proportional to their share of the winning side.

### Status Lifecycle
```
OPEN → User can enter either side
  ↓ (lock_ts reached)
LOCKED → No new entries, waiting for resolution
  ↓ (end_ts reached, oracle resolves)
RESOLVED → Winner determined, users can claim
  OR
VOID → Pool cancelled/invalid (refund mechanism)
```

---

## Database Design Recommendations

### Required Tables/Collections

#### 1. **pools**
Core pool information - matches `PoolDetail` structure
```sql
id                 SERIAL PRIMARY KEY
token              VARCHAR(20) NOT NULL
mint               VARCHAR(44) NOT NULL -- Solana address (base58)
logo_url           VARCHAR(255)
start_ts           BIGINT NOT NULL      -- Unix timestamp
lock_ts            BIGINT NOT NULL
end_ts             BIGINT NOT NULL
line_bps           INTEGER NOT NULL     -- AI prediction line
status             VARCHAR(10) NOT NULL -- OPEN/LOCKED/RESOLVED/VOID
winner             VARCHAR(10)          -- Over/Under/Void/NULL
total_over_lamports BIGINT DEFAULT 0
total_under_lamports BIGINT DEFAULT 0
ai_confidence      DECIMAL(3,2)        -- 0.00 to 1.00
ai_model           VARCHAR(50)
ai_commit          VARCHAR(66)         -- 0x + 64 hex chars
ai_payload_url     VARCHAR(255)
proof_hash         VARCHAR(66)
proof_url          VARCHAR(255)
contract_address   VARCHAR(44)         -- Solana program address
contract_url       VARCHAR(255)        -- Solscan link
created_at         TIMESTAMP DEFAULT NOW()
updated_at         TIMESTAMP DEFAULT NOW()

INDEX idx_status ON pools(status)
INDEX idx_lock_ts ON pools(lock_ts)
INDEX idx_end_ts ON pools(end_ts)
```

#### 2. **entries**
User entries in pools
```sql
id                 SERIAL PRIMARY KEY
pool_id            INTEGER REFERENCES pools(id)
user_pubkey        VARCHAR(44) NOT NULL
side               VARCHAR(10) NOT NULL -- Over/Under
amount_lamports    BIGINT NOT NULL      -- User's deposit (after fee)
fee_lamports       BIGINT NOT NULL      -- Fee collected
tx_signature       VARCHAR(88)          -- Solana transaction signature
claimed            BOOLEAN DEFAULT FALSE
claim_tx_signature VARCHAR(88)
created_at         TIMESTAMP DEFAULT NOW()

INDEX idx_pool_user ON entries(pool_id, user_pubkey)
INDEX idx_user ON entries(user_pubkey)
INDEX idx_pool_side ON entries(pool_id, side)
INDEX idx_claimed ON entries(pool_id, claimed)
```

#### 3. **price_history**
Price data for charts
```sql
id                 SERIAL PRIMARY KEY
pool_id            INTEGER REFERENCES pools(id)
timestamp          BIGINT NOT NULL      -- Unix timestamp
price              DECIMAL(20,10) NOT NULL
source             VARCHAR(50)          -- API source (e.g., "Jupiter", "Birdeye")

INDEX idx_pool_time ON price_history(pool_id, timestamp)
```

#### 4. **resolutions**
Pool resolution audit trail
```sql
id                 SERIAL PRIMARY KEY
pool_id            INTEGER REFERENCES pools(id)
resolver_id        VARCHAR(50)          -- Bot/Oracle identifier
final_price        DECIMAL(20,10)
start_price        DECIMAL(20,10)
price_change_bps   INTEGER              -- Calculated change
winner_side        VARCHAR(10)          -- Over/Under/Void
proof_data         JSONB                -- Full oracle response
resolved_at        TIMESTAMP DEFAULT NOW()
tx_signature       VARCHAR(88)          -- On-chain resolution tx

INDEX idx_pool ON resolutions(pool_id)
```

---

## Backend Implementation Tasks

### Phase 1: Database & Core Infrastructure
1. **Choose & Setup Database**
   - Recommendation: PostgreSQL (ACID compliance, reliable for financial data)
   - Alternative: MongoDB (if you prefer document store)
   - Install Prisma ORM: `npm install prisma @prisma/client`
   - Initialize: `npx prisma init`

2. **Create Schema**
   - Define Prisma schema based on tables above
   - Run migrations: `npx prisma migrate dev`

3. **Seed Initial Data**
   - Convert dummy pools to actual database seeds
   - Create seed script for development/testing

### Phase 2: Pool Management
4. **Implement Pool CRUD**
   - Create service/lib file: `lib/pool-service.ts`
   - Functions:
     - `getTopPools()` → Replace `api/pools/top/route.ts:96-98`
     - `getPoolById(id)` → Replace `api/pool/[id]/route.ts:32-36`
     - `createPool(data)` - For admin/cron
     - `updatePoolTotals(id, side, amount)` - When entry received
     - `updatePoolStatus(id, status)` - Status transitions

5. **Implement Price History Service**
   - Create `lib/price-service.ts`
   - Functions:
     - `fetchCurrentPrice(mint)` - Get current price from DEX API
     - `storePricePoint(poolId, timestamp, price)`
     - `getPriceHistory(poolId)` - For chart data
   - Integration options:
     - Jupiter Price API
     - Birdeye API
     - Pyth Network (on-chain oracle)

### Phase 3: Storage Integration (Shadow Drive)
6. **Setup Shadow Drive for Decentralized Storage**
   - **Why Shadow Drive?**
     - Native Solana integration (pay in SOL/SHDW)
     - Production-ready mainnet
     - Cost-effective: ~$0.002-$0.008/GB/month
     - Simple TypeScript SDK

   - **Install SDK:**
     ```bash
     npm install @shadow-drive/sdk
     ```

   - **Use Cases in SOLPVE:**
     - AI model payload/proof data (stored at `ai.payload_url`)
     - Pool resolution proof data (stored at `proof.url`)
     - Each file: ~1KB-100KB JSON
     - Total storage needed: ~100-500 MB/year (~$5-10/year)

   - **Implementation:**
     - Create `lib/storage-service.ts`
     - Initialize Shadow Drive client with wallet
     - Upload JSON files, get back immutable URLs
     - Store URLs in database

   - **Fallback Strategy (Optional):**
     - For critical proofs: Dual upload to Shadow Drive + Arweave
     - Arweave for permanent backup ($25/GB one-time)
     - Shadow Drive as primary fast-access layer

### Phase 4: Solana Integration
7. **Setup Solana Program (Smart Contract)**
   - Option A: Write custom Anchor program
     - Accounts: Pool PDA, User Entry PDA, Vault PDA
     - Instructions: enter_pool, claim_winnings, resolve_pool
   - Option B: Use escrow program pattern

8. **Implement Transaction Builders**
   - Create `lib/solana-service.ts`
   - Functions:
     - `buildEnterTransaction(poolId, side, lamports, userPubkey)` → Replace `api/tx/enter/route.ts:3-9`
     - `buildClaimTransaction(poolId, userPubkey)` → Replace `api/tx/claim/route.ts:3-9`
   - Use `@solana/web3.js` (already in package.json v1.98.4)

9. **Transaction Processing Webhook/Listener**
   - Listen for confirmed transactions
   - Update database when entry is confirmed
   - Update pool totals in real-time
   - Methods:
     - WebSocket subscription to Solana RPC
     - Helius/QuickNode webhooks
     - Polling confirmed signatures

### Phase 5: Pool Lifecycle Automation
10. **Status Transition Cron Jobs**
    - Create `scripts/pool-automation.ts`
    - Jobs:
      - **Lock Pools:** Check `lock_ts`, set OPEN → LOCKED
      - **Resolve Pools:** Check `end_ts`, fetch final price, determine winner, set LOCKED → RESOLVED
      - **Create Daily Pools:** Auto-create new pools for popular tokens

11. **Oracle/Resolution Service**
    - Create `lib/oracle-service.ts`
    - Functions:
      - `resolvePool(poolId)` - Get final price, calculate winner
      - `determineWinner(startPrice, endPrice, lineBps)` - Business logic
      - `generateProof(poolId)` - Create cryptographic proof
      - `storeProof(poolId, hash, url)` - Save to Shadow Drive (not IPFS/S3)

### Phase 6: Entry & Claim Logic
12. **Entry Validation**
    - Create `lib/entry-service.ts`
    - Pre-transaction checks:
      - Pool must be OPEN status
      - Current time < lock_ts
      - Amount > minimum threshold
      - User hasn't exceeded max entries (optional)

13. **Claim Validation**
    - Functions:
      - `calculateUserPayout(poolId, userPubkey)` - Check if user won, calculate amount
      - `canClaim(poolId, userPubkey)` - Check eligibility
      - `markClaimed(entryId, txSignature)` - Prevent double-claims

### Phase 7: Admin & Monitoring
14. **Admin API Routes**
    - `POST /api/admin/pools/create` - Create new pool
    - `POST /api/admin/pools/:id/resolve` - Manual resolution
    - `GET /api/admin/pools/:id/entries` - View all entries
    - `GET /api/admin/stats` - Platform statistics

15. **Monitoring & Alerts**
    - Pool resolution failures
    - Transaction confirmation delays
    - Price feed failures
    - Low vault balance warnings
    - Shadow Drive upload failures

---

## Critical Implementation Notes

### 1. Lamports Everywhere in Backend
- **ALWAYS** store amounts in lamports (integer)
- **NEVER** store SOL amounts (float) - precision loss risk
- Convert to SOL only for frontend display using `lamportsToSol()`

### 2. Fee Handling
```typescript
// In entry processing
userInputLamports = 5_000_000_000  // 5 SOL from user
feeLamports = Math.floor((userInputLamports * 75) / 10000)  // 3,750,000 lamports
netLamports = userInputLamports - feeLamports  // 4,996,250,000 lamports

// Store in database
entry.amount_lamports = netLamports  // What goes to user's side
entry.fee_lamports = feeLamports     // Platform revenue

// Update pool totals
if (side === "Over") {
  pool.total_over_lamports += netLamports
} else {
  pool.total_under_lamports += netLamports
}
```

### 3. Payout Calculation
```typescript
// When user claims
const pool = await getPool(poolId)
const userEntry = await getEntry(poolId, userPubkey)

if (pool.winner !== userEntry.side) {
  return 0  // User lost
}

const totalPool = pool.total_over_lamports + pool.total_under_lamports
const totalWinner = pool.winner === "Over"
  ? pool.total_over_lamports
  : pool.total_under_lamports

const userPayout = Math.floor(
  (userEntry.amount_lamports * totalPool) / totalWinner
)

// Important: userPayout will be >= userEntry.amount_lamports
// The gain comes from the losing side's pool
```

### 4. Race Conditions to Handle
- **Multiple entries at once:** Use database transactions
- **Pool status transitions:** Atomic updates with WHERE status = 'OPEN'
- **Claim double-spend:** Check `claimed = false` in WHERE clause
- **Concurrent total updates:** Use database-level incrementing

### 5. Time Synchronization
- All timestamps in Unix seconds (not milliseconds)
- Server time must be accurate (NTP sync)
- Consider clock skew in lock_ts/end_ts checks (±1 minute buffer)

### 6. Price Data Reliability
- Store price source in database
- Have fallback price feeds
- Validate price data (sanity checks, outlier detection)
- Never resolve pool if price feed failed

### 7. Transaction Confirmation
- Don't update database until transaction is **confirmed** (not just sent)
- Use `confirmed` or `finalized` commitment level
- Handle transaction failures gracefully
- Implement retry logic for failed transactions

---

## Environment Variables Needed

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/solpve"

# Solana
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_PROGRAM_ID="YourProgramPublicKey"
SOLANA_VAULT_KEYPAIR="path/to/vault-keypair.json"

# Price Feeds
JUPITER_API_KEY="your_key"
BIRDEYE_API_KEY="your_key"

# Storage (Shadow Drive for proofs)
SHADOW_DRIVE_STORAGE_ACCOUNT="your_storage_account_pubkey"
SHADOW_DRIVE_WALLET_PRIVATE_KEY="your_wallet_private_key_base58"
# Optional: Arweave for permanent backup
ARWEAVE_WALLET_JSON="path/to/arweave-wallet.json"

# App
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
FEE_BPS="75"
MIN_ENTRY_LAMPORTS="100000000"  # 0.1 SOL minimum
```

---

## Testing Strategy

### Unit Tests
- Fee calculation edge cases (0, very large amounts)
- Payout calculation (various pool ratios)
- Status transition logic
- Time boundary conditions

### Integration Tests
- Full entry flow (transaction → confirmation → database update)
- Pool resolution flow
- Claim flow (eligible vs ineligible users)

### Devnet Testing
- Deploy to Solana devnet
- Use devnet SOL for testing
- Test with real price feeds
- Simulate full pool lifecycle

---

## Security Considerations

1. **Wallet Integration**
   - Never store private keys
   - All transactions signed client-side
   - Validate all transaction details before signing

2. **Admin Routes**
   - Implement authentication (API keys, JWT)
   - Rate limiting
   - IP whitelisting for critical operations

3. **Input Validation**
   - Validate all user inputs (amounts, pubkeys, pool IDs)
   - Prevent SQL injection (use parameterized queries)
   - Sanitize all inputs

4. **Financial Safety**
   - Implement maximum entry limits
   - Circuit breakers for unusual activity
   - Manual resolution override capability
   - Audit logging for all financial operations

---

## Performance Optimizations

1. **Caching**
   - Cache active pools list (Redis, 30s TTL)
   - Cache price data (1-5 min TTL depending on volatility)
   - Cache user entry history

2. **Database Indexes**
   - All foreign keys indexed
   - Compound indexes on (pool_id, user_pubkey)
   - Index on status for frequent queries

3. **Batch Operations**
   - Batch price fetches for all active pools
   - Batch status updates in cron jobs
   - Connection pooling for database

---

## Deployment Checklist

- [ ] Database schema migrated to production
- [ ] Environment variables configured
- [ ] Solana program deployed to mainnet
- [ ] Price feed APIs tested and configured
- [ ] Cron jobs scheduled and monitored
- [ ] Admin dashboard accessible
- [ ] Error monitoring (Sentry, DataDog) configured
- [ ] Backup and recovery procedures documented
- [ ] Load testing completed
- [ ] Security audit conducted

---

## Quick Start Development Workflow

1. **Setup Database**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   # Edit prisma/schema.prisma with tables above
   npx prisma migrate dev --name init
   npx prisma generate
   ```

2. **Create Pool Service**
   - Copy dummy data from `app/api/pools/top/route.ts:3-94` to seed script
   - Implement `lib/pool-service.ts` with database queries
   - Replace dummy returns with actual queries

3. **Implement Transaction Builder**
   - Create `lib/solana-service.ts`
   - Build basic transfer transaction first (test)
   - Then implement program interactions

4. **Test Locally**
   - Use devnet
   - Seed database with test pools
   - Test full flow: create pool → enter → resolve → claim

5. **Add Automation**
   - Create simple cron script
   - Run every minute, check for status transitions
   - Add resolution logic

---

## Next Steps After This Guide

1. Read Solana documentation: https://docs.solana.com/
2. Learn Anchor framework: https://www.anchor-lang.com/
3. Study Prisma ORM: https://www.prisma.io/docs
4. Review Solana Web3.js: https://solana-labs.github.io/solana-web3.js/

---

## Appendix: Example Code Snippets

### Example: Pool Service with Prisma
```typescript
// lib/pool-service.ts
import { PrismaClient } from '@prisma/client'
import type { PoolListItem } from '@/types/pve'

const prisma = new PrismaClient()

export async function getTopPools(): Promise<PoolListItem[]> {
  const pools = await prisma.pool.findMany({
    where: {
      status: { in: ['OPEN', 'LOCKED'] }
    },
    orderBy: [
      { total_over_lamports: 'desc' },
      { total_under_lamports: 'desc' }
    ],
    take: 6
  })

  return pools.map(pool => ({
    id: pool.id,
    token: pool.token,
    mint: pool.mint,
    logo: pool.logo_url,
    line_bps: pool.line_bps,
    confidence: pool.ai_confidence,
    lock_ts: Number(pool.lock_ts),
    end_ts: Number(pool.end_ts),
    totals: {
      over: Number(pool.total_over_lamports),
      under: Number(pool.total_under_lamports)
    },
    status: pool.status as Status,
    ai: {
      confidence: pool.ai_confidence,
      model: pool.ai_model,
      commit: pool.ai_commit,
      payload_url: pool.ai_payload_url
    }
  }))
}
```

### Example: Entry Transaction Builder
```typescript
// lib/solana-service.ts
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

export async function buildEnterTransaction(
  poolId: number,
  side: 'Over' | 'Under',
  lamports: number,
  userPubkey: string
): Promise<string> {
  const connection = new Connection(process.env.SOLANA_RPC_URL!)
  const user = new PublicKey(userPubkey)
  const vault = new PublicKey(process.env.SOLANA_VAULT_PUBKEY!)

  // Build transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: vault,
      lamports
    })
  )

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = user

  // Serialize (don't sign - user will sign)
  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  })

  return serialized.toString('base64')
}
```

### Example: Shadow Drive Storage Service
```typescript
// lib/storage-service.ts
import { ShdwDrive } from '@shadow-drive/sdk'
import { Connection, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

let drive: ShdwDrive | null = null

async function initShadowDrive() {
  if (drive) return drive

  const connection = new Connection(process.env.SOLANA_RPC_URL!)
  const wallet = Keypair.fromSecretKey(
    bs58.decode(process.env.SHADOW_DRIVE_WALLET_PRIVATE_KEY!)
  )

  drive = await new ShdwDrive(connection, wallet).init()
  return drive
}

export async function uploadProof(
  poolId: number,
  proofData: any
): Promise<string> {
  const drive = await initShadowDrive()
  const storageAccount = process.env.SHADOW_DRIVE_STORAGE_ACCOUNT!

  // Convert proof data to JSON buffer
  const jsonBuffer = Buffer.from(JSON.stringify(proofData, null, 2))
  const fileName = `proof-pool-${poolId}-${Date.now()}.json`

  // Create File object from buffer
  const file = new File([jsonBuffer], fileName, { type: 'application/json' })

  // Upload to Shadow Drive
  const uploadResponse = await drive.uploadFile(storageAccount, file)

  // Return the Shadow Drive URL
  return uploadResponse.finalized_locations[0]
}

export async function uploadAIPayload(
  poolId: number,
  aiData: any
): Promise<string> {
  const drive = await initShadowDrive()
  const storageAccount = process.env.SHADOW_DRIVE_STORAGE_ACCOUNT!

  const jsonBuffer = Buffer.from(JSON.stringify(aiData, null, 2))
  const fileName = `ai-payload-pool-${poolId}-${Date.now()}.json`
  const file = new File([jsonBuffer], fileName, { type: 'application/json' })

  const uploadResponse = await drive.uploadFile(storageAccount, file)
  return uploadResponse.finalized_locations[0]
}

export async function getProofFromUrl(url: string): Promise<any> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch proof: ${response.statusText}`)
  }
  return response.json()
}
```

### Example: Using Storage Service in Oracle
```typescript
// lib/oracle-service.ts
import { uploadProof } from './storage-service'
import crypto from 'crypto'

export async function resolvePool(poolId: number) {
  // 1. Fetch final price
  const finalPrice = await fetchFinalPrice(poolId)

  // 2. Determine winner
  const pool = await getPool(poolId)
  const winner = determineWinner(pool.start_price, finalPrice, pool.line_bps)

  // 3. Create proof data
  const proofData = {
    pool_id: poolId,
    start_price: pool.start_price,
    final_price: finalPrice,
    line_bps: pool.line_bps,
    winner,
    resolved_at: Math.floor(Date.now() / 1000),
    oracle_version: 'v1.0.0',
    price_sources: ['jupiter', 'birdeye'],
  }

  // 4. Calculate proof hash
  const proofHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex')

  // 5. Upload to Shadow Drive
  const proofUrl = await uploadProof(poolId, proofData)

  // 6. Update database
  await updatePoolResolution(poolId, {
    status: 'RESOLVED',
    winner,
    proof_hash: `0x${proofHash}`,
    proof_url: proofUrl,
  })

  return { winner, proofUrl, proofHash }
}

function determineWinner(
  startPrice: number,
  finalPrice: number,
  lineBps: number
): 'Over' | 'Under' | 'Void' {
  const changePercent = ((finalPrice - startPrice) / startPrice) * 10000

  if (Math.abs(changePercent - lineBps) < 1) {
    // Too close to call
    return 'Void'
  }

  return changePercent > lineBps ? 'Over' : 'Under'
}
```

---

## Storage Cost Comparison for SOLPVE

Based on actual needs:
- **Estimated Files:** ~1,000 pools/year × 2 files (AI payload + proof) = 2,000 files
- **Average File Size:** 50 KB
- **Total Storage:** 100 MB/year

### Annual Costs:
- **Shadow Drive:** ~$0.002/GB/month × 0.1 GB × 12 = **$0.024/year** (~$0.02)
- **Arweave (backup):** $25/GB × 0.1 GB = **$2.50 one-time**
- **Traditional S3:** $0.023/GB/month × 0.1 GB × 12 = **$0.28/year**

**Recommendation:** Start with Shadow Drive only. Add Arweave backup for mainnet launch.

---

**End of Guide**

This document serves as your comprehensive reference for implementing the SOLPVE backend. Follow the phases sequentially, and refer back to this guide for data structures, business logic, and critical implementation details.
