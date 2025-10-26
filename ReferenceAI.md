Reference: VS AI – Behavior, Updates, and Error Handling

Scope
- Documents the VS AI line behavior and provides an Error Handling section to prevent and remediate breakages.

AI Line Behavior (Summary)
- Origin at the first visible chart price (startPrice).
- PvAI: AI line follows latest applicable entry from ai_line_history per point, refreshed every 30 minutes and immediately after entries.
- PvMarket: Shows a static dashed reference line computed from current line_bps.
- Entry Placed marker: Horizontal line at the price captured at entry time, styled in Under purple (#9945FF).

Feature Flags
- NEXT_PUBLIC_DISABLE_AI_REFRESH=1
  - Disables the 30‑minute AI refresh and entry-trigger refresh in the chart. The AI line still renders from whatever ai_line_history/line_bps is already present in props.

Error Handling

### Build & Infrastructure Issues

**⚠️ CRITICAL: Corrupted Next.js Build Cache**
- Symptom: `Cannot find module './vendor-chunks/lodash.js'` or similar module not found errors
- Symptom: Invalid hook call errors: `Cannot read properties of null (reading 'useContext')`
- Symptom: Pool detail pages show 500 errors or fail to load
- Root cause: Webpack build cache is corrupted, referencing chunks that don't exist
- **NUCLEAR FIX (works 99% of the time):**
  ```powershell
  # Windows PowerShell
  Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
  Remove-Item -Recurse -Force .next
  Remove-Item -Recurse -Force node_modules\.cache
  npm run dev
  ```
  ```bash
  # macOS/Linux
  pkill -9 node
  rm -rf .next node_modules/.cache
  npm run dev
  ```
- **Then in browser:** Hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**⚠️ Database Schema Out of Sync**
- Symptom: `Unknown field 'aiLineHistory' for include statement on model Pool`
- Symptom: Prisma errors about missing tables or fields
- Root cause: Prisma schema updated but database not migrated
- **FIX:**
  ```bash
  npx prisma db push       # Sync schema to database
  npx prisma generate      # Regenerate Prisma Client
  npm run dev              # Restart server
  ```

**⚠️ Multiple Dev Servers Running**
- Symptom: "Port 3000 is in use, trying 3001 instead"
- Symptom: Fetch errors to localhost:3000 when server is on 3001
- Root cause: Old dev servers not properly killed
- **FIX:**
  ```powershell
  # Windows PowerShell
  Get-Process -Name node | Stop-Process -Force
  ```
  ```bash
  # macOS/Linux
  pkill -9 node
  ```

### React Hydration & Suspense Issues

**⚠️ Suspense Hydration Errors**
- Symptom: `Cannot read properties of null (reading 'useContext')` in react-dom
- Symptom: `updateDehydratedSuspenseComponent` errors in console
- Symptom: "Invalid hook call. Hooks can only be called inside of the body of a function component"
- Root cause: Suspense boundaries in layout.tsx or page.tsx causing SSR/client hydration mismatches
- **FIX:**
  - Remove `<Suspense>` from `app/layout.tsx` (Next.js 14 App Router doesn't need it for basic loading)
  - Remove `<Suspense>` from page components - use direct async rendering instead
  - Example fix in `app/layout.tsx`:
    ```tsx
    // ❌ BAD - causes hydration errors
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    
    // ✅ GOOD - direct rendering
    {children}
    ```
  - Example fix in pages: render async server components directly without Suspense wrappers

### Chart & UI Issues

- Symptom: Browser console shows 404s for _next static chunks (e.g., /_next/static/chunks/app/pool/%5Bid%5D/page.js) and the page fails to load.
  - Root cause: The dev/prod server is running an old build or the app chunk failed to compile, so the requested chunk file was never emitted.
  - Quick fixes:
    1) Full restart (dev): stop Next, then run
       - rm -rf .next
       - npm run dev
    2) Full rebuild (prod):
       - rm -rf .next
       - npm run build && npm run start
    3) Hard reload the browser to clear any cached chunk paths.

- Symptom: Route compiles but the chart crashes during render after an entry is placed.
  - Root cause: Client-only logic running before the browser is ready, or bad localStorage payload.
  - Quick fixes:
    - Ensure PriceChart remains a client component ("use client").
    - Delete the faulty local key and reload: localStorage.removeItem('solpve:entry:<poolId>').
    - Temporarily disable refresh: set NEXT_PUBLIC_DISABLE_AI_REFRESH=1 and reload.

- Symptom: Build stalls or flakes (e.g., SWC download issues) and then requests 404.
  - Quick fixes:
    - Re-run npm run build or npm run dev after network stabilizes.
    - Clear .next before retrying.

Operational Checklist (to avoid regressions)
- After editing components/price-chart.tsx or app/pool/[id]/page.tsx:
  - Restart the dev server or rebuild prod so chunk files are regenerated.
  - Verify /api/pool/:id responds (dev: http://localhost:3000/api/pool/1).
  - If using PvAI pools, confirm ai_line_history exists; otherwise the AI line will fall back to line_bps.
  - If issues persist, set NEXT_PUBLIC_DISABLE_AI_REFRESH=1 to isolate refresh code.

Rollback Plan
- If any new behavior affects stability, revert PriceChart to static (PvMarket-style) by:
  - Setting NEXT_PUBLIC_DISABLE_AI_REFRESH=1 (no code changes), and
  - Commenting out the Entry Placed ReferenceLine block if needed.

