/**
 * Oracle Service
 * Resolves pools, generates proofs, and uploads to Shadow Drive
 */

import crypto from 'crypto'
import { uploadProof } from './storage-service'
import { updatePoolResolution, getPoolById, getPriceHistory } from './pool-service'
import { fetchCurrentPrice, determineWinner, calculatePriceChangeBps } from './price-service'
import { prisma } from './prisma'
import type { Side } from '@/types/pve'

export interface ResolutionProofData {
  pool_id: number
  token: string
  mint: string
  start_ts: number
  lock_ts: number
  end_ts: number
  line_bps: number
  start_price: number
  final_price: number
  price_change_bps: number
  winner: Side | 'Void'
  resolved_at: number
  oracle_version: string
  price_sources: string[]
  total_over_lamports: number
  total_under_lamports: number
}

/**
 * Resolve a pool by fetching final price and determining winner
 */
export async function resolvePool(poolId: number): Promise<{
  winner: Side | 'Void'
  proofUrl: string
  proofHash: string
}> {
  // 1. Get pool data
  const pool = await getPoolById(poolId)
  if (!pool) {
    throw new Error(`Pool ${poolId} not found`)
  }

  if (pool.status !== 'LOCKED') {
    throw new Error(`Pool ${poolId} is not locked (status: ${pool.status})`)
  }

  // 2. Get price history
  const priceHistory = await getPriceHistory(poolId)

  if (priceHistory.length === 0) {
    throw new Error(`No price history found for pool ${poolId}`)
  }

  // Get start price (earliest price point)
  const startPrice = Number(priceHistory[0].price)

  // 3. Fetch final price
  const finalPriceData = await fetchCurrentPrice(pool.mint)
  const finalPrice = finalPriceData.price

  // 4. Calculate price change
  const priceChangeBps = calculatePriceChangeBps(startPrice, finalPrice)

  // 5. Determine winner
  const winner = determineWinner(startPrice, finalPrice, pool.line_bps)

  // 6. Create proof data
  const proofData: ResolutionProofData = {
    pool_id: poolId,
    token: pool.token,
    mint: pool.mint,
    start_ts: pool.start_ts,
    lock_ts: pool.lock_ts,
    end_ts: pool.end_ts,
    line_bps: pool.line_bps,
    start_price: startPrice,
    final_price: finalPrice,
    price_change_bps: priceChangeBps,
    winner,
    resolved_at: Math.floor(Date.now() / 1000),
    oracle_version: 'v1.0.0',
    price_sources: [finalPriceData.source],
    total_over_lamports: pool.totals.over,
    total_under_lamports: pool.totals.under,
  }

  // 7. Calculate proof hash
  const proofHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex')

  // 8. Upload proof to Shadow Drive
  const proofUrl = await uploadProof(poolId, proofData)

  // 9. Update pool in database
  await updatePoolResolution(poolId, {
    status: 'RESOLVED',
    winner,
    proofHash: `0x${proofHash}`,
    proofUrl,
  })

  // 10. Store resolution in resolutions table
  await prisma.resolution.create({
    data: {
      poolId,
      resolverId: 'oracle-v1',
      finalPrice,
      startPrice,
      priceChangeBps,
      winnerSide: winner,
      proofData,
    },
  })

  return { winner, proofUrl, proofHash: `0x${proofHash}` }
}

/**
 * Batch resolve multiple pools
 */
export async function resolvePools(poolIds: number[]): Promise<void> {
  for (const poolId of poolIds) {
    try {
      const result = await resolvePool(poolId)
      console.log(`✅ Resolved pool ${poolId}: ${result.winner}`)
    } catch (error) {
      console.error(`❌ Failed to resolve pool ${poolId}:`, error)
    }
  }
}

/**
 * Void a pool (cancel/refund)
 */
export async function voidPool(
  poolId: number,
  reason: string
): Promise<void> {
  const pool = await getPoolById(poolId)
  if (!pool) {
    throw new Error(`Pool ${poolId} not found`)
  }

  // Create void proof
  const proofData = {
    pool_id: poolId,
    token: pool.token,
    mint: pool.mint,
    voided_at: Math.floor(Date.now() / 1000),
    reason,
    oracle_version: 'v1.0.0',
    total_over_lamports: pool.totals.over,
    total_under_lamports: pool.totals.under,
  }

  const proofHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(proofData))
    .digest('hex')

  const proofUrl = await uploadProof(poolId, proofData)

  await updatePoolResolution(poolId, {
    status: 'VOID',
    winner: 'Void',
    proofHash: `0x${proofHash}`,
    proofUrl,
  })

  await prisma.resolution.create({
    data: {
      poolId,
      resolverId: 'oracle-v1-void',
      finalPrice: 0,
      startPrice: 0,
      priceChangeBps: 0,
      winnerSide: 'Void',
      proofData,
    },
  })

  console.log(`Pool ${poolId} voided: ${reason}`)
}

/**
 * Verify a resolution proof
 */
export async function verifyProof(
  poolId: number,
  proofUrl: string,
  expectedHash: string
): Promise<boolean> {
  try {
    // Fetch proof from URL
    const response = await fetch(proofUrl)
    if (!response.ok) {
      return false
    }

    const proofData = await response.json()

    // Recalculate hash
    const calculatedHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(proofData))
      .digest('hex')

    // Compare hashes (remove 0x prefix if present)
    const cleanExpectedHash = expectedHash.startsWith('0x')
      ? expectedHash.slice(2)
      : expectedHash

    return calculatedHash === cleanExpectedHash
  } catch (error) {
    console.error('Proof verification failed:', error)
    return false
  }
}
