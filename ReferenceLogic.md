Reference: VS AI Chart & Entry Marker Logic

Overview
- The price chart now supports a dynamic AI target line and a user “Entry Placed” marker.
- AI line updates on a 30‑minute cadence and immediately on entry events.
- The entry marker uses the same purple hue as the Under pool in the distribution bar.

Files Touched
- components/price-chart.tsx
- components/entry-form.tsx
- app/pool/[id]/page.tsx

AI Line Behavior
- Origin: The AI line originates from the first visible price point on the chart (`startPrice`).
- PvAI behavior: For `pool_type = 'PvAI'`, the AI line is computed per data point using the most recent `ai_line_history` entry whose timestamp is <= the point’s time.
- PvMarket behavior: A static reference line is shown at the computed line price using the current `line_bps`.
- Update cadence: For PvAI pools, `components/price-chart.tsx` periodically refreshes the pool from `/api/pool/:id` every 30 minutes and updates:
  - `ai_line_history`
  - `line_bps`
- Immediate refresh on events: The chart also refreshes instantly when an entry is placed (see “Entry Marker Behavior”).

Entry Marker Behavior
- Purpose: After a successful entry, a horizontal line marks the price at the moment of entry (`y = [N]`).
- Color: Stroke and label color `#9945FF` to match the Under purple hue used in the Pool Distribution bar.
- Storage: On successful entry, we store a record in `localStorage` under key `solpve:entry:<poolId>` with the following shape:
  - `t`: unix seconds when the entry was recorded
  - `priceAtEntry`: the last price from the pool’s chart at that time
  - `side`: "Over" | "Under"
  - `lamports`: entry lamports amount
- Event: After storing, a browser event is dispatched to allow immediate UI updates:
  - Event name: `solpve:entry-placed`
  - Detail: `{ poolId }`
- Chart integration: `PriceChart` loads the entry marker from `localStorage` on mount, listens to the `solpve:entry-placed` event and `storage` events (multi-tab), and renders a `ReferenceLine` at `y = priceAtEntry` with label "Entry Placed".

Prop/API Changes
- `PriceChart` new props:
  - `poolId?: number` – required for live refresh and entry marker binding.
  - Existing props (`data`, `lineBps`, `aiLineHistory`, `poolType`) unchanged semantically.
- `app/pool/[id]/page.tsx` now passes `pool.id` to `PriceChart` via the new `poolId` prop.

UX Notes
- Tooltips: The AI line is also provided as a series (`aiLine`) so the tooltip shows the target value at hovered timestamps.
- PvAI vs PvMarket:
  - PvAI pools show the AI target as a changing series (follows history + refresh cadence).
  - PvMarket pools show a static, dashed reference line computed at the latest timestamp.
- If backend AI logic reacts to pool entries, the immediate refresh on `solpve:entry-placed` will surface those updates in the chart without waiting for the 30‑minute timer.

Developer Hooks
- Update frequency can be tuned in `components/price-chart.tsx` by changing the `setInterval` duration.
- To programmatically set/clear entry markers, write/delete `localStorage['solpve:entry:<poolId>']` and dispatch `solpve:entry-placed` with the matching `poolId`.

