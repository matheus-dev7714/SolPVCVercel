# SOLPVE - Solana PvE Prediction Markets

## Overview

SOLPVE is a decentralized prediction market platform built on Solana where users bet on whether token prices will move "Over" or "Under" an AI-predicted line. The platform features two distinct pool types:

- **VS AI Pools (PvAI)**: Dynamic AI-driven prediction markets with real-time AI line updates
- **VS Market Pools (PvMarket)**: Community-driven prediction markets with static reference lines

The application combines a modern web frontend (Vite + React + TypeScript) with a Solana smart contract backend (Anchor/Rust), using Prisma ORM with PostgreSQL for off-chain data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 18, 2025 - Vercel to Replit Migration
- **Environment**: Migrated from Vercel to Replit
- **Vite Configuration**: Updated server to bind to `0.0.0.0:5000` for Replit compatibility
- **Database**: Migrated from SQLite to PostgreSQL (Replit managed)
  - Updated Prisma schema datasource provider
  - Ran database migrations via `prisma db push`
- **TailwindCSS**: Fixed v3/v4 syntax incompatibility (changed from `@import "tailwindcss"` to `@tailwind` directives)
- **Deployment**: Configured autoscale deployment with Vite preview server
- **Status**: App running successfully on Replit dev server

## System Architecture

### Frontend Stack

**Build System**: Vite with React 18 and TypeScript
- Fast development server with hot module replacement
- Optimized production builds
- SWC for faster TypeScript compilation

**Routing**: React Router DOM v6
- Client-side routing with explicit route definitions
- Separated routes by pool type (`/vsai/pool/:id` vs `/vsmarket/pool/:id`)
- Main routes: Home (`/`), Pool Detail, VS AI Pool Detail, VS Market Pool Detail

**UI Framework**: Tailwind CSS + shadcn/ui components
- HSL color system for consistent theming
- Dark mode with deep space blue background (`#0a0f1e`)
- Custom gradient utilities (aqua `#14F195`, neon purple `#9945FF`)
- Radix UI primitives for accessible components

**State Management**:
- React Context API for global app state (wallet balance, navigation)
- TanStack React Query for server state management and data fetching
- Local storage for client-side persistence (wallet balance, entry markers)

**Data Visualization**: Recharts library
- Real-time price charts with historical data
- AI prediction lines (solid for historical, dashed for predictions)
- Entry markers showing user bet entry points
- "NOW" marker indicating current time

### Backend Architecture

**Smart Contract**: Solana Anchor Program (Rust)
- Program ID-based escrow system using PDAs (Program Derived Addresses)
- Five core instructions:
  - `initialize_pool`: Create new prediction pool
  - `enter_pool`: Place bet with automatic 0.75% fee
  - `lock_pool`: Prevent new entries
  - `resolve_pool`: Set winner based on oracle data
  - `claim_winnings`: Distribute proportional payouts

**Database Layer**: Prisma ORM with PostgreSQL
- Four main tables: `Pool`, `Entry`, `PriceHistory`, `Resolution`
- Additional tables: `AILineHistory` (tracks AI prediction changes)
- Supports both SQLite (development) and PostgreSQL (production)

**Services Architecture**:
- **Pool Service** (`lib/pool-service.ts`): Database CRUD operations for pools
- **Price Service** (`lib/price-service.ts`): Fetches token prices from Jupiter/Birdeye APIs
- **Oracle Service** (`lib/oracle-service.ts`): Resolves pools and generates proofs
- **Solana Service** (`lib/solana-service.ts`): Builds Solana transactions
- **Storage Service** (`lib/storage-service.ts`): Shadow Drive integration for proof storage
- **Transaction Listener** (`lib/transaction-listener.ts`): Monitors on-chain events

### Pool Lifecycle

1. **OPEN**: Pool accepts entries, AI line may update (PvAI only)
2. **LOCKED**: Entry period ended, awaiting price resolution
3. **RESOLVED**: Winner determined, payouts available
4. **VOID**: Pool cancelled, refunds issued

**Time-Based Status Logic**:
- Frontend checks both database status AND current time vs `lock_ts`
- Effective status computed client-side to handle real-time transitions
- Pools auto-lock when `current_time >= lock_ts` even if DB status is "OPEN"

### AI Prediction System

**VS AI Pools** (`pool_type: 'PvAI'`):
- Dynamic AI line that updates every 30 minutes
- Immediate refresh on new entries
- AI predictions based on:
  - Current token price
  - Community sentiment (over/under ratio)
  - AI confidence score (0-1)
  - Smooth S-curve interpolation with volatility

**VS Market Pools** (`pool_type: 'PvMarket'`):
- Static reference line for entire pool duration
- No AI updates or predictions
- Pure community-driven betting

### Data Flow

**Entry Submission**:
1. User selects side (Over/Under) and amount in frontend
2. Frontend validates wallet balance (testnet devnet balance)
3. API endpoint `/api/tx/enter` builds Solana transaction
4. Transaction includes 0.75% fee calculation
5. On confirmation, event listener updates database
6. Entry marker appears on price chart

**Pool Resolution**:
1. Oracle service fetches final price from Jupiter/Birdeye
2. Compares price change to AI line (`line_bps`)
3. Generates SHA256 proof and uploads to Shadow Drive
4. Updates pool status to RESOLVED with winner
5. Users can claim proportional winnings

**Price Chart Updates**:
- Historical data: Stored in `PriceHistory` table
- AI predictions: Calculated on-demand using `lib/ai-prediction.ts`
- Chart merges real data and predictions by timestamp
- Entry markers: Stored in localStorage with event-driven updates

## External Dependencies

### Blockchain & Web3

**Solana Web3.js** (`@solana/web3.js`): Core Solana SDK
- Connection management to Solana RPC
- Transaction building and signing
- Account and PDA derivation

**Anchor Framework** (`@coral-xyz/anchor`): Solana program framework
- IDL-based program interaction
- Type-safe instruction building
- Event parsing from transaction logs

**SPL Token** (`@solana/spl-token`): Token program interaction
- Token account management (future use)

### Data Storage

**Prisma ORM** (`@prisma/client`): Type-safe database client
- PostgreSQL (production) or SQLite (development)
- Auto-generated TypeScript types
- Migration management

**Shadow Drive SDK** (`@shadow-drive/sdk`): Decentralized storage
- Upload AI payloads and resolution proofs
- Permanent storage on Solana

### External APIs

**Jupiter Price API** (`https://price.jup.ag/v6/price`): Primary price source
- Real-time token price feeds
- DEX aggregator pricing

**Birdeye API** (`https://public-api.birdeye.so/defi/price`): Fallback price source
- Alternative price oracle
- Used when Jupiter unavailable

### UI & Styling

**Tailwind CSS** (`tailwindcss`): Utility-first CSS framework
- Custom color system (HSL-based)
- Dark mode support
- Responsive design utilities

**Radix UI** (multiple packages): Unstyled accessible components
- Dialog, Dropdown, Tooltip, etc.
- Full keyboard navigation
- ARIA compliance

**Recharts** (`recharts`): React charting library
- Line charts for price visualization
- Custom tooltips and reference lines

**Lucide React** (`lucide-react`): Icon library
- Modern icon set
- Tree-shakeable

### Developer Tools

**TypeScript** (`typescript`): Type safety
- Strict mode enabled
- Path aliases (`@/*` → `./src/*`)

**ESLint** (`eslint`): Code quality
- Next.js config adapted for Vite
- React hooks rules

**Vite** (`vite`, `@vitejs/plugin-react-swc`): Build tool
- Fast dev server (port 5000)
- SWC for compilation
- Optimized production builds

### Utilities

**date-fns** (`date-fns`): Date manipulation
- Timestamp formatting
- Time calculations

**bs58** (`bs58`): Base58 encoding
- Solana keypair encoding

**BN.js** (`bn.js`): Big number arithmetic
- Lamports calculations
- Anchor program compatibility

**clsx** + **tailwind-merge**: Class name utilities
- Conditional classes
- Tailwind class merging