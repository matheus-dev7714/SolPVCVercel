# Reference: Home Page Example Data

This reference defines the example pools that should appear on the home page, split into two sections: Versus AI (PvAI) and Versus Market (PvMarket). Use this as the source of truth when seeding and validating the UI.

## Sections

- Versus AI (PvAI)
  - Dynamic AI target that updates pre-lock on a schedule and/or events
  - Chart: dashed AI line series that steps at each update
  - Example pools that MUST appear:
    - BONK (OPEN)
      - Type: PvAI
      - AI Line: ~+3.00% (line_bps: 300)
      - Confidence: ~0.61
      - Totals: Over ~34 SOL, Under ~29 SOL
      - AI Line History: ~5 points over the last 24h
    - BODEN (OPEN)
      - Type: PvAI
      - AI Line: ~+3.80% (line_bps: 380)
      - Confidence: ~0.59
      - Totals: Over ~12 SOL, Under ~9 SOL
      - AI Line History: ~4 points over the last 24h
    - POPCAT EXTREME (OPEN; “extreme over”)
      - Type: PvAI
      - AI Line: ~+2.50% (line_bps: 250)
      - Confidence: ~0.91
      - Totals: Over ~990 SOL, Under ~10 SOL (skewed)
      - Purpose: visibly test the bar split and payout intuition

- Versus Market (PvMarket)
  - Static AI target (single reference line)
  - Chart: single dashed reference line at target
  - Example pools that MUST appear:
    - WIF (OPEN)
      - Type: PvMarket
      - AI Line: ~+2.20% (line_bps: 220)
      - Confidence: ~0.55
      - Totals: Over ~18 SOL, Under ~24 SOL
    - POPCAT (LOCKED)
      - Type: PvMarket
      - AI Line: ~+4.50% (line_bps: 450)
      - Confidence: ~0.58
      - Totals: Over ~52 SOL, Under ~48 SOL
      - Purpose: show LOCKED state and non-enterable UI
    - WIF EXTREME (OPEN; “extreme under”)
      - Type: PvMarket
      - AI Line: ~+0.50% (line_bps: 50)
      - Confidence: ~0.23
      - Totals: Over ~50 SOL, Under ~950 SOL (skewed)

## IDs and Routing

- After a full reset/seed, pool IDs should be assigned in creation order. Expected IDs:
  1. BONK (PvAI, OPEN)
  2. WIF (PvMarket, OPEN)
  3. POPCAT (PvMarket, LOCKED)
  4. MEW (PvMarket, RESOLVED)
  5. BODEN (PvAI, OPEN)
  6. POPCAT EXTREME (PvAI, OPEN)
  7. WIF EXTREME (PvMarket, OPEN)

- Clickthrough check:
  - /pool/1 → BONK detail page
  - /pool/3 → POPCAT detail page (LOCKED) — should NOT 404
  - /pool/6 → POPCAT EXTREME (PvAI)
  - /pool/7 → WIF EXTREME (PvMarket)

## Timers

- Timers count down to lock (OPEN) or end (LOCKED). To avoid 00:00:00 in dev, timers fall back to next midnight temporarily.
- Detail header shows only the numeric countdown under “Time Remaining”.

## Distribution Bars

- Over = aqua; Under = neon-purple
- Bars show a split line and percent values where width > 15%
- Cards and Pool Distribution component share the same visual logic

## UI Expectations

- Home page must show:
  - “Versus AI” section with at least 2 PvAI pools (BONK, BODEN) and one extreme (POPCAT EXTREME)
  - “Versus Market” section with at least 2 PvMarket pools (WIF, POPCAT) and one extreme (WIF EXTREME)
- Clicking any card should navigate to its detail page without error
- Charts:
  - PvAI: dynamic dashed line, reading from `ai_line_history`
  - PvMarket: static dashed reference line

## Dev Notes

- Use `npm run db:reset && npm run db:seed` to ensure the above pools exist with the expected IDs and data.
- If IDs drift, verify via Prisma studio or a quick query and update the expectations accordingly.
