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
      // Dev fallback: VS Market pools only (PvMarket type)
      const now = Math.floor(Date.now() / 1000)
      const mk = (p: any) => NextResponse.json(p)

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
        case 2:
          return mk({
            id: 2,
            token: "WIF",
            mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
            pool_type: 'PvMarket',
            start_ts: now - 3 * 3600,
            lock_ts: now - 1800, // 30 minutes ago (LOCKED)
            end_ts: now + 3600,
            line_bps: null, // No AI line for VS Market
            ai: null, // No AI for VS Market
            totals: { over: 18_000_000_000, under: 24_000_000_000 },
            status: "OPEN", // Status is OPEN but lock_ts passed, so effectively LOCKED
            winner: null,
            ai_line_history: null,
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
            line_bps: null,
            ai: null,
            totals: { over: 52_000_000_000, under: 48_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: null,
            chart: chart(0.85, 0.05),
            ...common,
          })
        case 4:
          return mk({
            id: 4,
            token: "MEW",
            mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
            pool_type: 'PvMarket',
            start_ts: now - 3600,
            lock_ts: now + 2 * 3600, // 2 hours from now (OPEN)
            end_ts: now + 5 * 3600,
            line_bps: null,
            ai: null,
            totals: { over: 24_000_000_000, under: 26_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: null,
            chart: chart(0.0042, 0.0002),
            ...common,
          })
        case 6:
          return mk({
            id: 6,
            token: "POPCAT",
            mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
            pool_type: 'PvMarket',
            start_ts: now - 3600,
            lock_ts: now + 6 * 3600, // 6 hours from now
            end_ts: now + 10 * 3600,
            line_bps: null,
            ai: null,
            totals: { over: 15_000_000_000, under: 18_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: null,
            chart: chart(0.86, 0.03),
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
            line_bps: null,
            ai: null,
            totals: { over: 50_000_000_000, under: 950_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: null,
            chart: chart(3.0, 0.2),
            ...common,
          })
      }

      return NextResponse.json({ error: "VS Market Pool not found" }, { status: 404 })
    }

    return NextResponse.json(pool)
  } catch (error) {
    console.error("Failed to fetch VS Market pool:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


