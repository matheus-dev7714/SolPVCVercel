# Pool Logic & Structure Guidelines

## Pool Type Separation

### Route Structure
To improve organization and clarity, pools should be separated by market type:

- **VS AI Pools**: `/vsai/pool/[id]`
  - AI-driven prediction markets
  - Dynamic AI line that updates based on events and entries
  - AI confidence scores and model information displayed
  
- **VS Market Pools**: `/vsmarket/pool/[id]`
  - Community-driven prediction markets
  - No AI involvement
  - Pure peer-to-peer betting

### Current Structure (To Be Refactored)
Currently all pools use: `/pool/[id]`

This makes it difficult to:
- Distinguish pool types at a glance
- Apply type-specific logic and UI
- Organize API routes and components
- Scale different pool types independently

### Proposed Structure

```
app/
  vsai/
    pool/
      [id]/
        page.tsx          # VS AI pool detail page
  vsmarket/
    pool/
      [id]/
        page.tsx          # VS Market pool detail page
  api/
    vsai/
      pool/
        [id]/
          route.ts        # VS AI pool data endpoint
    vsmarket/
      pool/
        [id]/
          route.ts        # VS Market pool data endpoint
```

## Pool Status Logic

### Status Types
- `OPEN`: Pool is accepting entries, current time < lock_ts
- `LOCKED`: Entry period ended, waiting for resolution
- `RESOLVED`: Winner determined by oracle
- `VOID`: Pool cancelled, entries refunded

### Effective Status Calculation
The displayed status should consider both database `status` and time-based logic:

```typescript
function getEffectiveStatus(status: Status, lock_ts: number, end_ts: number): Status {
  const now = Math.floor(Date.now() / 1000)
  
  // If already resolved or void, keep that status
  if (status === 'RESOLVED' || status === 'VOID') {
    return status
  }
  
  // If status is OPEN but lock time has passed, it's effectively locked
  if (status === 'OPEN' && now >= lock_ts) {
    return 'LOCKED'
  }
  
  return status
}
```

### Entry Validation
A pool is open for entries if:
1. Database status is `OPEN`
2. Current time < `lock_ts`
3. Pool has valid configuration

## VS AI Pool Specifics

### AI Line Behavior
- **Initial Line**: AI generates a starting prediction line based on historical data
- **Dynamic Updates**: Line adjusts every 30 minutes based on:
  - Market events (news, price movements)
  - User entry patterns and volumes
  - Real-time price data
  - AI model confidence changes

### AI Line History
Track historical AI line changes for transparency:
```typescript
{
  ai_line_history: [
    { t: timestamp, line_bps: 300 },  // 24 hours ago
    { t: timestamp, line_bps: 310 },  // 12 hours ago
    { t: timestamp, line_bps: 305 },  // current
  ]
}
```

### Entry Placed Marker
When a user enters a VS AI pool:
- Display a horizontal line (`y = entry_price`) on the chart
- Use purple color (`#9945FF`) matching the "Under" bar
- Label as "Entry Placed"
- Store in localStorage for persistence across sessions

## VS Market Pool Specifics

### No AI Involvement
- No AI line displayed
- No AI confidence scores
- Pure price chart with entry markers
- Community-driven prediction only

### Entry Distribution
Display over/under ratio more prominently since there's no AI to compete against.

## Development vs Production

### Development Mode
- Use synthetic pool data (switch statement fallbacks)
- Bypass database queries
- Mock transaction building
- Default wallet balance: 10 SOL

### Production Mode
- Query Prisma database for pool data
- Build real Solana transactions
- Connect to actual Solana network
- Real wallet integration

## Timer Display Rules

### Active Pools (OPEN)
- Show countdown to `lock_ts`
- Format: `HH:MM:SS`
- Update every second

### Locked Pools
- No countdown timer
- Display: `--:--:--`
- Show status badge: "LOCKED"
- Display lock reason message

### Resolved/Void Pools
- No timer
- Show winner (if resolved)
- Display final stats

## Pool Data Structure

### Core Fields (All Pool Types)
```typescript
{
  id: number
  token: string           // e.g., "BONK"
  mint: string           // Solana token mint address
  pool_type: 'PvAI' | 'PvMarket'
  status: Status
  start_ts: number       // Unix timestamp
  lock_ts: number        // Entry cutoff time
  end_ts: number         // Resolution time
  totals: {
    over: bigint         // Lamports
    under: bigint        // Lamports
  }
  winner: 'Over' | 'Under' | null
  chart: Array<{t: number, p: number}>  // Price history
}
```

### VS AI Specific Fields
```typescript
{
  line_bps: number              // AI line in basis points
  ai: {
    confidence: number          // 0.0 to 1.0
    model: string              // Model version
    commit: string             // Git commit hash
    payload_url: string | null // Model artifact URL
  }
  ai_line_history: Array<{
    t: number                  // Timestamp
    line_bps: number          // Line value at that time
  }>
}
```

## Frontend Components

### Shared Components
- `PoolCard`: List view card (used on homepage)
- `Timer`: Countdown or locked state display
- `PriceChart`: Token price visualization
- `EntryForm`: Entry submission form
- `ClaimPanel`: Claim winnings after resolution

### VS AI Specific Components
- `AIChip`: Display AI confidence
- `AILineChart`: Show AI line with history
- `EntryPlacedMarker`: User entry indicator

### VS Market Specific Components
- `MarketStats`: Community entry distribution
- `SimpleChart`: Basic price chart without AI line

## API Routes

### Current Routes (To Be Refactored)
- `GET /api/pool/[id]` - Get pool detail
- `GET /api/pools/top` - Get top pools
- `POST /api/tx/enter` - Build entry transaction
- `POST /api/tx/claim` - Build claim transaction

### Proposed Routes
- `GET /api/vsai/pool/[id]` - VS AI pool detail
- `GET /api/vsmarket/pool/[id]` - VS Market pool detail
- `GET /api/pools/vsai` - List VS AI pools
- `GET /api/pools/vsmarket` - List VS Market pools
- `POST /api/vsai/enter` - Enter VS AI pool
- `POST /api/vsmarket/enter` - Enter VS Market pool

## Testing Guidelines

### Development Pool Configuration
For consistent testing, use these pool states:

**Open Pools** (lock_ts in future):
- Pool 1: BONK (PvAI) - 4 hours remaining
- Pool 3: POPCAT (PvMarket) - 3 hours remaining
- Pool 4: MEW (PvMarket) - 2 hours remaining
- Pool 5: BODEN (PvAI) - 5 hours remaining
- Pool 6: POPCAT (PvMarket) - 6 hours remaining
- Pool 7: WIF (PvMarket) - 4 hours remaining
- Pool 9: TREMP (PvAI) - 8 hours remaining

**Locked Pools** (lock_ts in past):
- Pool 2: WIF (PvMarket) - Locked 30 min ago
- Pool 8: TRUMP (PvAI) - Locked 1 hour ago

### Test Scenarios
1. **Entry Flow**: Open pool → Enter amount → Confirm → Success
2. **Locked State**: Try to enter locked pool → Show error
3. **Timer Display**: Open pool shows countdown, locked shows `--:--:--`
4. **Balance Management**: Entry deducts from wallet, claim adds back
5. **AI Line Updates**: VS AI pools show dynamic line changes

## Migration Plan

### Phase 1: Create New Structure (Current Phase)
- Document current logic in `PoolLogic.md` ✅
- Plan route separation strategy
- Identify shared vs type-specific components

### Phase 2: Implement Separation
- Create `/vsai/pool/[id]` and `/vsmarket/pool/[id]` routes
- Duplicate and customize pool detail pages
- Create type-specific API routes
- Update navigation and links

### Phase 3: Component Refactoring
- Split components into shared and type-specific
- Extract common logic into hooks
- Optimize bundle size

### Phase 4: Testing & Rollout
- Test both pool types thoroughly
- Update documentation
- Deprecate old `/pool/[id]` route
- Set up redirects

## Notes

- Keep pool IDs unique across both types
- Use `pool_type` field to distinguish in database
- Maintain backward compatibility during migration
- Consider SEO implications of route changes


