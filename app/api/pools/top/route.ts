import { NextResponse } from "next/server"
import { getTopPools } from "@/lib/pool-service"

export async function GET() {
  try {
    const pools = await getTopPools(12)
    if (pools.length > 0) {
      return NextResponse.json(pools)
    }
    const now = Math.floor(Date.now() / 1000)
    const fallback = [
      // OPEN POOLS
      {
        id: 1,
        token: 'BONK',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        logo: null,
        line_bps: 300,
        confidence: 0.61,
        lock_ts: now + 4 * 3600, // 4 hours from now - OPEN
        end_ts: now + 8 * 3600,
        totals: { over: 34_000_000_000, under: 29_000_000_000 },
        status: 'OPEN',
        pool_type: 'PvAI',
        ai: { confidence: 0.61, model: 'pve-v0.3.0', commit: '0xA1B2...ABCD', payload_url: null },
      },
      {
        id: 9,
        token: 'WIF',
        mint: 'WIF_DEV_AI_MINT_000000000000000000009',
        logo: null,
        line_bps: 180,
        confidence: 0.62,
        lock_ts: now + 3 * 3600, // 3 hours from now - OPEN
        end_ts: now + 7 * 3600,
        totals: { over: 8_000_000_000, under: 7_000_000_000 },
        status: 'OPEN',
        pool_type: 'PvAI',
        ai: { confidence: 0.62, model: 'pve-v0.3.0', commit: '0xWIF_AI_FALLBACK', payload_url: null },
      },
      {
        id: 6,
        token: 'POPCAT',
        mint: 'POPCAT_DEV_EXTREME_MINT_000000000000000001',
        logo: null,
        line_bps: 250,
        confidence: 0.91,
        lock_ts: now + 6 * 3600, // 6 hours from now - OPEN
        end_ts: now + 12 * 3600,
        totals: { over: 990_000_000_000, under: 10_000_000_000 },
        status: 'OPEN',
        pool_type: 'PvMarket',
        ai: { confidence: 0.91, model: 'pve-v0.3.0', commit: '0xPOPCATDEADBEEF1234', payload_url: null },
      },
      {
        id: 7,
        token: 'WIF',
        mint: 'WIF_DEV_EXTREME_MINT_000000000000000000002',
        logo: null,
        line_bps: 50,
        confidence: 0.23,
        lock_ts: now + 4 * 3600, // 4 hours from now - OPEN
        end_ts: now + 10 * 3600,
        totals: { over: 50_000_000_000, under: 950_000_000_000 },
        status: 'OPEN',
        pool_type: 'PvMarket',
        ai: { confidence: 0.23, model: 'pve-v0.3.0', commit: '0xWIFDEADBEEF5678', payload_url: null },
      },
      // LOCKED POOLS
      {
        id: 8,
        token: 'POPCAT',
        mint: 'POPCAT_DEV_AI_MINT_000000000000000000008',
        logo: null,
        line_bps: 260,
        confidence: 0.88,
        lock_ts: now - 1200, // 20 mins ago - LOCKED
        end_ts: now + 2 * 3600,
        totals: { over: 12_000_000_000, under: 11_000_000_000 },
        status: 'OPEN', // Status OPEN but time passed = effectively LOCKED
        pool_type: 'PvAI',
        ai: { confidence: 0.88, model: 'pve-v0.3.0', commit: '0xPOPCAT_AI_FALLBACK', payload_url: null },
      },
      {
        id: 2,
        token: 'WIF',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        logo: null,
        line_bps: 220,
        confidence: 0.55,
        lock_ts: now - 1800, // 30 mins ago - LOCKED
        end_ts: now + 3600,
        totals: { over: 18_000_000_000, under: 24_000_000_000 },
        status: 'OPEN', // Status OPEN but time passed = effectively LOCKED
        pool_type: 'PvMarket',
        ai: { confidence: 0.55, model: 'pve-v0.3.0', commit: '0x1234...90AB', payload_url: null },
      },
    ]
    return NextResponse.json(fallback)
  } catch (error) {
    console.error("Failed to fetch top pools:", error)
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    )
  }
}

// Enable ISR with 30 second revalidation
export const revalidate = 30
