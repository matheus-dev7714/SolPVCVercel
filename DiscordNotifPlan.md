Discord Notifications Plan (Aligned to Current Codebase)

Overview

- This repo implements a Solana PvE prediction market (not a gacha system). On‑chain events exposed by the Anchor IDL are: `EntryCreated`, `WinningsClaimed`, `PoolResolved`, and `PoolLocked`.
- The persistence layer is Prisma with SQLite (see `prisma/schema.prisma`), not Supabase. There is no `transactions` table for “skin tokenization,” and there is no rarity or gacha-related schema.

What Exists Today (Exact Logic Points)

- On‑chain event parsing and routing
  - Parses confirmed transactions and dispatches handlers based on log contents: `lib/transaction-listener.ts:52-60`.
  - Event decoder uses the Anchor IDL: `lib/transaction-listener.ts:18-19`, `lib/idl/solpve.ts`.

- EntryCreated
  - Handler: `lib/transaction-listener.ts:70-135`.
  - Persists/updates `Entry` rows, updates pool totals.

- WinningsClaimed
  - Handler: `lib/transaction-listener.ts:140-177`.
  - Marks entries as claimed; exposes `amount` in event payload for thresholding.

- PoolResolved
  - Handler: `lib/transaction-listener.ts:182-220`.
  - Updates `Pool.status='RESOLVED'`, sets `winner` and `proofHash`.

- PoolLocked
  - Handler: `lib/transaction-listener.ts:226-259`.
  - Updates `Pool.status='LOCKED'`.

- Database schema (no rarity / tokenization)
  - Tables: `Pool`, `Entry`, `PriceHistory`, `Resolution` in `prisma/schema.prisma:1`.
  - No rarity fields, grading scale, or tokenization pipeline/state.

Implications for the Notification Types

1) “High‑Rarity Gacha Wins (Rarity 4+)”

- Not present. There is no gacha system, rarity enum, or 1–8 grading scale in code or DB.
- Replace with: High‑Value Winnings Claims.
  - Trigger source: `WinningsClaimed` event from chain.
  - Filter: `amount` ≥ configurable threshold (e.g., ≥ 1 SOL), or top‑N winnings per day.
  - Optional: include pool token (from `Pool.token`) and winner side (from `PoolResolved`) once known.

2) “Skin Tokenization Completions (Supabase transactions table)”

- Not present. The app uses Prisma + SQLite; there is no Supabase listener nor a `transactions` table.
- Replace with one of:
  - Pool Lifecycle Notifications: emit on `PoolLocked` and `PoolResolved` changes (fully supported today), or
  - Add Tokenization Pipeline (future): introduce a `Tokenization` table and emit on `status='COMPLETED'`.

Recommended Notification Triggers (Current Code)

- On‑chain, via existing listener
  - High‑Value Claim: When `WinningsClaimed.amount` ≥ THRESHOLD → send Discord embed.
  - Pool Resolved: When `PoolResolved` processed → send winner announcement with `winner`, `proofHash`.
  - Pool Locked: When `PoolLocked` processed → send lock notice with countdown to `endTs`.

- Database polling (optional, if you prefer DB‑level hooks)
  - Watch `Pool.status` transitions: OPEN → LOCKED → RESOLVED, and `winner` set.
  - Watch `Entry.claimed` transitions for claims without relying on the live log stream.

Discord Bot Integration Plan

1) Bot skeleton
   - Use `discord.js` v14 with a single channel ID env var: `DISCORD_CHANNEL_ID` and `DISCORD_BOT_TOKEN`.

2) Event bridge
   - Extend `lib/transaction-listener.ts` to publish internal events (e.g., via a tiny in‑process emitter) when handlers finish:
     - `onHighValueClaim({ poolId, user, amount, signature })` if amount ≥ THRESHOLD.
     - `onPoolResolved({ poolId, winner, proofHash })`.
     - `onPoolLocked({ poolId })`.

3) Message formatting
   - High‑Value Claim: show SOL amount, pool token, user pubkey (shortened), tx link.
   - Pool Resolved: show token, winner side, proof link (`proofUrl` if available), totals.
   - Pool Locked: show token, lock timestamp, time remaining to `endTs`.

4) Reliability
   - Keep the existing `startProgramLogListener()` (WebSocket) and add periodic reconciliation that scans recent confirmed signatures for missed events.
   - Optionally, poll DB every minute to backfill notifications based on `updatedAt` deltas.

Env and Config

- Add to `.env`:
  - `DISCORD_BOT_TOKEN=...`
  - `DISCORD_CHANNEL_ID=...`
  - `CLAIM_NOTIFY_THRESHOLD_LAMPORTS=1000000000` # 1 SOL default

Open Questions / Future Work

- If a gacha/rarity system is intended:
  - Define schema: `GachaRoll(id, user_pubkey, rarity, item_id, tx_signature, created_at)` with `rarity` as an enum/string (e.g., Common, Uncommon, Rare, Epic, Transcendent, Mythic, Legendary) rather than numeric grade.
  - Emit an on‑chain or off‑chain event (or DB row) on roll completion to trigger Discord notifications.
  - If using the provided drop rates, store them in config for front‑end/UI; they are not in code today.

- If “skin tokenization” is a requirement:
  - Either migrate Prisma datasource to Postgres (e.g., Supabase) and add a `Tokenization` table with a `status` column, or keep Prisma and add the table locally; in both cases, notify on `status='COMPLETED'`.

Summary of Changes from Original Plan

- Replace gacha rarity notifications with high‑value claim notifications (supported now).
- Remove `InstantResellEvent` (no such event in IDL) and Supabase transaction triggers (not present).
- Add Pool lifecycle notifications (`LOCKED`, `RESOLVED`) supported by current handlers.

