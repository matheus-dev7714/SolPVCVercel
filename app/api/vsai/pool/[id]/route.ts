import { NextResponse } from "next/server"
import { getPoolById } from "@/lib/pool-service"
import { calculateAIPrediction, generateHistoricalPriceData } from "@/lib/ai-prediction"

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
      // Dev fallback: VS AI pools only (PvAI type)
      const now = Math.floor(Date.now() / 1000)
      const mk = (p: any) => NextResponse.json(p)
      const aiHist = (points: Array<{ dtHours: number; bps: number }>) =>
        points.map((pt) => ({ t: now - pt.dtHours * 3600, line_bps: pt.bps }))

      const common = {
        logo: null,
        proof: { hash: null, url: null },
        contract_url: null,
      }

      switch (poolId) {
        case 1: {
          // BONK Pool - 12 hour duration example
          const poolDuration = 12 * 3600 // 12 hours
          const startTs = now - 4 * 3600 // Started 4 hours ago
          const endTs = startTs + poolDuration // Ends in 8 hours (at 6 AM if pool started at 6 PM)
          const startPrice = 0.000021
          const currentPrice = 0.0000220 // Current price after 4 hours
          
          // Generate real historical price data that spans the full pool duration
          // Extend historical data to match AI prediction timeline
          const historicalData = generateHistoricalPriceData(startPrice, startTs, endTs, 48)
          
          // Generate AI prediction for entire 12-hour period (48 points for very smooth curve)
          const aiPrediction = calculateAIPrediction(
            startPrice,
            currentPrice,
            34_000_000_000n, // totalOver
            29_000_000_000n, // totalUnder
            0.61, // AI confidence
            startTs,
            endTs,
            48 // 48 points for smooth curve (every 15 minutes)
          )
          
          return mk({
            id: 1,
            token: "BONK",
            mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
            pool_type: 'PvAI',
            start_ts: startTs,
            lock_ts: endTs - 3600, // Lock 1 hour before end
            end_ts: endTs,
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
            chart: historicalData, // Real price history
            ai_prediction: aiPrediction, // AI's predicted price curve
            ...common,
          })
        }
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
        case 8:
          return mk({
            id: 8,
            token: "TRUMP",
            mint: "TRUMP_MINT_DEV_00000000000000000000000001",
            pool_type: 'PvAI',
            start_ts: now - 3 * 24 * 3600,
            lock_ts: now - 3600, // 1 hour ago (LOCKED)
            end_ts: now + 2 * 3600,
            line_bps: 250,
            ai: { confidence: 0.68, model: "pve-v0.3.0", commit: "0xTRUMP1234ABCD", payload_url: null },
            totals: { over: 45_000_000_000, under: 30_000_000_000 },
            status: "OPEN", // Status is OPEN but lock_ts passed, so effectively LOCKED
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 72, bps: 240 },
              { dtHours: 48, bps: 245 },
              { dtHours: 24, bps: 250 },
              { dtHours: 12, bps: 255 },
              { dtHours: 4, bps: 250 },
            ]),
            chart: chart(0.035, 0.003),
            ...common,
          })
        case 9:
          return mk({
            id: 9,
            token: "TREMP",
            mint: "TREMP_MINT_DEV_00000000000000000000000002",
            pool_type: 'PvAI',
            start_ts: now - 3600,
            lock_ts: now + 8 * 3600, // 8 hours from now
            end_ts: now + 12 * 3600,
            line_bps: 420,
            ai: { confidence: 0.72, model: "pve-v0.3.0", commit: "0xTREMP5678EFGH", payload_url: null },
            totals: { over: 28_000_000_000, under: 22_000_000_000 },
            status: "OPEN",
            winner: null,
            ai_line_history: aiHist([
              { dtHours: 24, bps: 400 },
              { dtHours: 18, bps: 410 },
              { dtHours: 12, bps: 420 },
              { dtHours: 6, bps: 425 },
              { dtHours: 2, bps: 420 },
            ]),
            chart: chart(0.065, 0.005),
            ...common,
          })
      }

      return NextResponse.json({ error: "VS AI Pool not found" }, { status: 404 })
    }

    return NextResponse.json(pool)
  } catch (error) {
    console.error("Failed to fetch VS AI pool:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

