import { NextResponse } from "next/server"
import { getPoolById } from "@/lib/pool-service"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const poolId = parseInt(id)
    if (isNaN(poolId)) {
      return NextResponse.json({ error: "Invalid pool ID" }, { status: 400 })
    }

    // Always use dev fallback pools for development
    const pool = null // await getPoolById(poolId)

    if (!pool) {
      // Dev fallback: synthetic pools per Reference.md
      const now = Math.floor(Date.now() / 1000)
      const mk = (p: any) => NextResponse.json(p)
      const aiHist = (points: Array<{ dtHours: number; bps: number }>) =>
        points.map((pt) => ({ t: now - pt.dtHours * 3600, line_bps: pt.bps }))

      const chart = (base = 1, drift = 0.02) => [
        { t: now - 6 * 3600, p: base },
        { t: now - 3 * 3600, p: base + drift },
        { t: now - 60, p: base + drift / 2 },
      ]

      const common = {
        logo: null,
        proof: { hash: null, url: null },
        contract_url: null,
      }

      switch (poolId) {
        case 1:
          return mk({
            id: 1,
            token: "BONK",
            mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            pool_type: 'PvAI',
            start_ts: now - 3600,
            lock_ts: now + 4 * 3600, // 4 hours from now
            end_ts: now + 8 * 3600,
            line_bps: 300,
            ai: { confidence: 0.61, model: "pve-v0.3.0", commit: "0xA1B2...ABCD", payload_url: null },
            totals: { over: 34_000_000_000, under: 29_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 24, bps: 280 },
              { dtHours: 18, bps: 290 },
              { dtHours: 12, bps: 310 },
              { dtHours: 6, bps: 300 },
              { dtHours: 2, bps: 305 },
            ]),
            chart: chart(0.000021, 0.0000005),
            ...common,
          })
        case 2:
          return mk({
            id: 2,
            token: "WIF",
            mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
            pool_type: 'PvMarket',
            start_ts: now - 3 * 3600,
            lock_ts: now - 1800, // 30 minutes ago (LOCKED)
            end_ts: now + 3600,
            line_bps: 220,
            ai: { confidence: 0.55, model: "pve-v0.3.0", commit: "0x1234...90AB", payload_url: null },
            totals: { over: 18_000_000_000, under: 24_000_000_000 },
            status: "OPEN", // Status is OPEN but lock_ts passed, so effectively LOCKED
            winner: null,
            chart: chart(2.45, 0.05),
            ...common,
          })
        case 3:
          return mk({
            id: 3,
            token: "POPCAT",
            mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
            pool_type: 'PvMarket',
            start_ts: now - 3600,
            lock_ts: now + 3 * 3600, // 3 hours from now (OPEN)
            end_ts: now + 6 * 3600,
            line_bps: 450,
            ai: { confidence: 0.58, model: "pve-v0.3.0", commit: "0xFEDC...8765", payload_url: null },
            totals: { over: 52_000_000_000, under: 48_000_000_000 },
            status: "OPEN",
            winner: null,
            chart: chart(0.85, 0.05),
            ...common,
          })
        case 4:
          return mk({
            id: 4,
            token: "MEW",
            mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
            pool_type: 'PvMarket',
            start_ts: now - 3 * 24 * 3600,
            lock_ts: now - 2 * 24 * 3600,
            end_ts: now - 24 * 3600,
            line_bps: 175,
            ai: { confidence: 0.52, model: "pve-v0.3.0", commit: "0x9876...10FE", payload_url: null },
            totals: { over: 24_000_000_000, under: 26_000_000_000 },
            status: "RESOLVED",
            winner: "Over",
            chart: chart(0.0042, 0.0002),
            ...common,
          })
        case 5:
          return mk({
            id: 5,
            token: "BODEN",
            mint: "3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o",
            pool_type: 'PvAI',
            start_ts: now - 3600,
            lock_ts: now + 5 * 3600, // 5 hours from now
            end_ts: now + 9 * 3600,
            line_bps: 380,
            ai: { confidence: 0.59, model: "pve-v0.3.0", commit: "0xABCD...3456", payload_url: null },
            totals: { over: 12_000_000_000, under: 9_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 24, bps: 360 },
              { dtHours: 16, bps: 370 },
              { dtHours: 8, bps: 380 },
              { dtHours: 4, bps: 375 },
            ]),
            chart: chart(0.18, 0.01),
            ...common,
          })
        case 6:
          return mk({
            id: 6,
            token: "POPCAT",
            mint: "POPCAT_DEV_EXTREME_MINT_000000000000000001",
            pool_type: 'PvMarket',
            start_ts: now - 3600,
            lock_ts: now + 6 * 3600, // 6 hours from now
            end_ts: now + 12 * 3600,
            line_bps: 250,
            ai: { confidence: 0.91, model: "pve-v0.3.0", commit: "0xPOPCATDEADBEEF1234", payload_url: null },
            totals: { over: 990_000_000_000, under: 10_000_000_000 },
            status: "OPEN",
            winner: null,
            chart: chart(1.0, 0.02),
            ...common,
          })
        case 8:
          return mk({
            id: 8,
            token: "POPCAT",
            mint: "POPCAT_DEV_AI_MINT_000000000000000000008",
            pool_type: 'PvAI',
            start_ts: now - 3 * 3600,
            lock_ts: now - 1200, // 20 minutes ago (LOCKED)
            end_ts: now + 2 * 3600,
            line_bps: 260,
            ai: { confidence: 0.88, model: "pve-v0.3.0", commit: "0xPOPCAT_AI_FALLBACK", payload_url: null },
            totals: { over: 12_000_000_000, under: 11_000_000_000 },
            status: "OPEN", // Status is OPEN but lock_ts passed, so effectively LOCKED
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 24, bps: 240 },
              { dtHours: 18, bps: 265 },
              { dtHours: 12, bps: 255 },
              { dtHours: 6, bps: 260 },
              { dtHours: 2, bps: 258 },
            ]),
            chart: chart(1.0, 0.02),
            ...common,
          })
        case 9:
          return mk({
            id: 9,
            token: "WIF",
            mint: "WIF_DEV_AI_MINT_000000000000000000009",
            pool_type: 'PvAI',
            start_ts: now - 3600,
            lock_ts: now + 3 * 3600, // 3 hours from now
            end_ts: now + 7 * 3600,
            line_bps: 180,
            ai: { confidence: 0.62, model: "pve-v0.3.0", commit: "0xWIF_AI_FALLBACK", payload_url: null },
            totals: { over: 8_000_000_000, under: 7_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 24, bps: 160 },
              { dtHours: 18, bps: 170 },
              { dtHours: 12, bps: 175 },
              { dtHours: 6, bps: 180 },
              { dtHours: 2, bps: 178 },
            ]),
            chart: chart(2.5, 0.05),
            ...common,
          })
        case 7:
          return mk({
            id: 7,
            token: "WIF",
            mint: "WIF_DEV_EXTREME_MINT_000000000000000000002",
            pool_type: 'PvMarket',
            start_ts: now - 3600,
            lock_ts: now + 4 * 3600, // 4 hours from now
            end_ts: now + 10 * 3600,
            line_bps: 50,
            ai: { confidence: 0.23, model: "pve-v0.3.0", commit: "0xWIFDEADBEEF5678", payload_url: null },
            totals: { over: 50_000_000_000, under: 950_000_000_000 },
            status: "OPEN",
            winner: null,
            chart: chart(3.0, 0.2),
            ...common,
          })
      }

      return NextResponse.json({ error: "Pool not found" }, { status: 404 })
    }

    return NextResponse.json(pool)
  } catch (error) {
    console.error(`Failed to fetch pool ${id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch pool" },
      { status: 500 }
    )
  }
}

// Enable ISR with 15 second revalidation
export const revalidate = 15
