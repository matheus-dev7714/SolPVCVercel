/**
 * Pool Service
 * Database operations for pools
 */

import { prisma } from './prisma'
import type { PoolListItem, PoolDetail, Status, Side } from '@/types/pve'
import type { Prisma } from '@prisma/client'

/**
 * Get top pools by volume for homepage
 * Returns active (OPEN/LOCKED) pools sorted by total volume
 */
export async function getTopPools(limit = 6): Promise<PoolListItem[]> {
  const pools = await prisma.pool.findMany({
    where: {
      status: {
        in: ['OPEN', 'LOCKED'],
      },
    },
    orderBy: [
      {
        totalOverLamports: 'desc',
      },
      {
        totalUnderLamports: 'desc',
      },
    ],
    take: limit,
  })

  return pools.map(poolToListItem)
}

/**
 * Get pool by ID with full details
 */
export async function getPoolById(id: number): Promise<PoolDetail | null> {
  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      priceHistory: {
        orderBy: {
          timestamp: 'asc',
        },
      },
      aiLineHistory: {
        orderBy: {
          timestamp: 'asc',
        },
      },
    },
  })

  if (!pool) return null

  return poolToDetail(pool)
}

/**
 * Create a new pool
 */
export async function createPool(data: {
  token: string
  mint: string
  logoUrl?: string | null
  startTs: bigint
  lockTs: bigint
  endTs: bigint
  lineBps: number
  aiConfidence: number
  aiModel: string
  aiCommit: string
  aiPayloadUrl?: string | null
  contractAddress?: string | null
  contractUrl?: string | null
}): Promise<PoolDetail> {
  const pool = await prisma.pool.create({
    data: {
      ...data,
      status: 'OPEN',
    },
    include: {
      priceHistory: true,
    },
  })

  return poolToDetail(pool)
}

/**
 * Update pool totals when an entry is made
 */
export async function updatePoolTotals(
  poolId: number,
  side: Side,
  amountLamports: bigint
): Promise<void> {
  const field =
    side === 'Over' ? 'totalOverLamports' : 'totalUnderLamports'

  await prisma.pool.update({
    where: { id: poolId },
    data: {
      [field]: {
        increment: amountLamports,
      },
    },
  })
}

/**
 * Update pool status
 */
export async function updatePoolStatus(
  poolId: number,
  status: Status
): Promise<void> {
  await prisma.pool.update({
    where: { id: poolId },
    data: { status },
  })
}

/**
 * Update pool resolution data
 */
export async function updatePoolResolution(
  poolId: number,
  data: {
    status: 'RESOLVED' | 'VOID'
    winner: Side | 'Void'
    proofHash: string
    proofUrl: string
  }
): Promise<void> {
  await prisma.pool.update({
    where: { id: poolId },
    data,
  })
}

/**
 * Get pools that need to be locked (current time >= lock_ts)
 */
export async function getPoolsToLock(): Promise<PoolDetail[]> {
  const now = Math.floor(Date.now() / 1000)

  const pools = await prisma.pool.findMany({
    where: {
      status: 'OPEN',
      lockTs: {
        lte: BigInt(now),
      },
    },
    include: {
      priceHistory: true,
    },
  })

  return pools.map(poolToDetail)
}

/**
 * Get pools that need to be resolved (current time >= end_ts)
 */
export async function getPoolsToResolve(): Promise<PoolDetail[]> {
  const now = Math.floor(Date.now() / 1000)

  const pools = await prisma.pool.findMany({
    where: {
      status: 'LOCKED',
      endTs: {
        lte: BigInt(now),
      },
    },
    include: {
      priceHistory: true,
    },
  })

  return pools.map(poolToDetail)
}

/**
 * Get all pools (for admin)
 */
export async function getAllPools(): Promise<PoolListItem[]> {
  const pools = await prisma.pool.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return pools.map(poolToListItem)
}

/**
 * Store price history point
 */
export async function storePricePoint(
  poolId: number,
  timestamp: bigint,
  price: number,
  source: string
): Promise<void> {
  await prisma.priceHistory.create({
    data: {
      poolId,
      timestamp,
      price,
      source,
    },
  })
}

/**
 * Get price history for a pool
 */
export async function getPriceHistory(poolId: number) {
  return await prisma.priceHistory.findMany({
    where: { poolId },
    orderBy: {
      timestamp: 'asc',
    },
  })
}

// Helper functions to convert Prisma models to frontend types

function poolToListItem(pool: any): PoolListItem {
  return {
    id: pool.id,
    token: pool.token,
    mint: pool.mint,
    logo: pool.logoUrl,
    line_bps: pool.lineBps,
    confidence: Number(pool.aiConfidence),
    lock_ts: Number(pool.lockTs),
    end_ts: Number(pool.endTs),
    totals: {
      over: Number(pool.totalOverLamports),
      under: Number(pool.totalUnderLamports),
    },
    status: pool.status as Status,
    pool_type: pool.poolType,
    ai: {
      confidence: Number(pool.aiConfidence),
      model: pool.aiModel,
      commit: pool.aiCommit,
      payload_url: pool.aiPayloadUrl,
    },
  }
}

function poolToDetail(pool: any): PoolDetail {
  return {
    id: pool.id,
    token: pool.token,
    mint: pool.mint,
    logo: pool.logoUrl,
    start_ts: Number(pool.startTs),
    lock_ts: Number(pool.lockTs),
    end_ts: Number(pool.endTs),
    line_bps: pool.lineBps,
    pool_type: pool.poolType,
    ai: {
      confidence: Number(pool.aiConfidence),
      model: pool.aiModel,
      commit: pool.aiCommit,
      payload_url: pool.aiPayloadUrl,
    },
    totals: {
      over: Number(pool.totalOverLamports),
      under: Number(pool.totalUnderLamports),
    },
    status: pool.status as Status,
    winner: pool.winner as Side | 'Void' | null,
    proof: {
      hash: pool.proofHash,
      url: pool.proofUrl,
    },
    chart: (pool.priceHistory || []).map((point: any) => ({
      t: Number(point.timestamp),
      p: Number(point.price),
    })),
    ai_line_history: (pool.aiLineHistory || []).map((h: any) => ({
      t: Number(h.timestamp),
      line_bps: Number(h.lineBps),
      source: h.source,
      note: h.note,
    })),
    contract_url: pool.contractUrl,
  }
}
