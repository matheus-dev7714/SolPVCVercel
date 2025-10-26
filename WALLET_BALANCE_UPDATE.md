# Wallet Balance & Entry Form Update

## Summary
Updated the SOLPVE application to include a testnet wallet balance system and fixed the entry submission API issue.

## Changes Made

### 1. Wallet Balance System (`lib/app-context.tsx`)
- Added `walletBalance` state (default: 10 SOL)
- Implemented `deductBalance()` function to reduce balance on entry
- Implemented `resetBalance()` function to reset to 10 SOL
- Added localStorage persistence for wallet balance
- Balance is saved/loaded across page refreshes

### 2. Wallet Display Component (`components/wallet-display.tsx`)
- Created new component to show current wallet balance
- Displays balance in neon-green with DEVNET badge
- Shows "Connect Wallet" button placeholder

### 3. Entry Form Updates (`components/entry-form.tsx`)
- **FIXED API ISSUE**: Changed request field from `lamports` to `amount_lamports` (string)
- Added wallet balance validation before submission
- Shows user's balance in the entry form
- Deducts balance on successful entry
- Clears amount field after successful entry
- Added better error handling with API error messages
- Button disabled when insufficient balance or invalid amount
- Button text changes to "Insufficient Balance" when needed

### 4. Layout Updates (`app/layout.tsx`)
- Wrapped app in `AppProvider` for global state
- Added `Toaster` component for notifications

### 5. Page Updates
- `app/page.tsx`: Added `WalletDisplay` to homepage header
- `app/pool/[id]/page.tsx`: Added `WalletDisplay` to pool detail header

### 6. Entry Placed Line (Already Working)
- Purple line (`#9945FF`) appears on chart when user enters a pool
- Same purple hue as the "Under" bar in pool distribution
- Line shows `y = [N]` where N is the price at entry time
- Stored in localStorage and persists across refreshes
- Updates immediately via custom event system

### 7. AI Line for VS AI Pools (Already Working)
- AI line updates every 30 minutes via polling
- Dynamic line that changes based on `ai_line_history` data
- Line originates at pool start and updates based on events
- Pulls latest data from `/api/pool/[id]`

## API Fix Details

### The Problem
Entry form was sending:
```json
{
  "pool_id": 1,
  "side": "Over",
  "lamports": 1000000000,  // Wrong field name & type
  "user_pubkey": "PLACEHOLDER_PUBKEY"
}
```

### The Solution
Now sending:
```json
{
  "pool_id": 1,
  "side": "Over",
  "amount_lamports": "1000000000",  // Correct field name & string type
  "user_pubkey": "PLACEHOLDER_PUBKEY"
}
```

## How to Test

1. **Start the dev server**: `npm run dev`
2. **Visit homepage**: http://localhost:3000
3. **Check wallet balance**: Should show "10.00 SOL" in header
4. **Enter a VS AI pool** (e.g., BONK, POPCAT, or WIF)
5. **Try to enter with amount > 10 SOL**: Button should be disabled
6. **Enter with valid amount** (e.g., 2.5 SOL):
   - Entry should succeed
   - Balance should decrease to 7.50 SOL
   - Purple "Entry Placed" line should appear on chart
   - Toast notification should appear
7. **Refresh page**: Balance should persist
8. **Check chart updates**: AI line should update every 30 minutes (or on entry)

## Future Enhancements

1. Connect real Solana wallet instead of simulated balance
2. Add transaction signing and submission to blockchain
3. Add balance refresh from actual wallet
4. Add faucet for testnet SOL
5. Show transaction history
6. Add claiming functionality to return winnings to balance

## Technical Notes

- All wallet balance logic is client-side for now
- Uses localStorage key: `solpve:wallet:balance`
- Uses localStorage key: `solpve:entry:${poolId}` for entry markers
- Entry markers stored with: `{ t, priceAtEntry, side, lamports }`
- Custom event `solpve:entry-placed` triggers chart refresh
- AppContext provides global state management
- AI line polling disabled if `NEXT_PUBLIC_DISABLE_AI_REFRESH=1`

## Color Scheme Reference

- **Neon Green** (`#00ffa3`): Over side, balance display
- **Neon Purple** (`#9945ff`): Under side, entry placed line
- **Aqua** (`#00d4ff`): AI target line
- **Yellow** (`#ffd60a`): Warnings, DEVNET badge


