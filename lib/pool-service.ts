/**
 * Pool Service
 * Database operations for pools using Supabase
 */

import { getSupabaseServer } from './supabase'
import type { PoolListItem, PoolDetail, Status, Side } from '@/types/pve'

/**
 * Get top pools by volume for homepage
 * Returns active (OPEN/LOCKED) pools sorted by total volume
 */
export async function getTopPools(limit = 6): Promise<PoolListItem[]> {
  const supabase = getSupabaseServer()
  
  const { data: pools, error } = await supabase
    .from('pools')
    .select('*')
    .in('status', ['OPEN', 'LOCKED'])
    .order('total_over_lamports', { ascending: false })
    .order('total_under_lamports', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top pools:', error)
    return []
  }

  return (pools || []).map(poolToListItem)
}

/**
 * Get pool by ID with full details
 */
export async function getPoolById(id: number): Promise<PoolDetail | null> {
  const supabase = getSupabaseServer()
  
  const { data: pool, error } = await supabase
    .from('pools')
    .select(`
      *,
      price_history:price_history(*),
      ai_line_history:ai_line_history(*)
    `)
    .eq('id', id)
    .single()

  if (error || !pool) {
    console.error('Error fetching pool:', error)
    return null
  }

  // Fetch price history
  const { data: priceHistory } = await supabase
    .from('price_history')
    .select('*')
    .eq('pool_id', id)
    .order('timestamp', { ascending: true })

  // Fetch AI line history
  const { data: aiLineHistory } = await supabase
    .from('ai_line_history')
    .select('*')
    .eq('pool_id', id)
    .order('timestamp', { ascending: true })

  return poolToDetail({ ...pool, price_history: priceHistory || [], ai_line_history: aiLineHistory || [] })
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
  const supabase = getSupabaseServer()
  
  const { data: pool, error } = await supabase
    .from('pools')
    .insert({
      ...data,
      logo_url: data.logoUrl,
      start_ts: data.startTs.toString(),
      lock_ts: data.lockTs.toString(),
      end_ts: data.endTs.toString(),
      line_bps: data.lineBps,
      pool_type: 'PvAI',
      status: 'OPEN',
      ai_confidence: data.aiConfidence,
      ai_model: data.aiModel,
      ai_commit: data.aiCommit,
      ai_payload_url: data.aiPayloadUrl,
      contract_address: data.contractAddress,
      contract_url: data.contractUrl,
    })
    .select()
    .single()

  if (error) throw error
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
  const supabase = getSupabaseServer()
  
  const field = side === 'Over' ? 'total_over_lamports' : 'total_under_lamports'

  const { error } = await supabase.rpc('increment_pool_total', {
    pool_id: poolId,
    field_name: field,
    increment_value: amountLamports.toString(),
  })

  if (error) {
    console.error('Error updating pool totals:', error)
    // Fallback to manual update
    const { data: pool } = await supabase
      .from('pools')
      .select(field)
      .eq('id', poolId)
      .single()

    if (pool) {
      const currentValue = BigInt(pool[field] || 0)
      const newValue = currentValue + amountLamports

      await supabase
        .from('pools')
        .update({ [field]: newValue.toString() })
        .eq('id', poolId)
    }
  }
}

/**
 * Update pool status
 */
export async function updatePoolStatus(
  poolId: number,
  status: Status
): Promise<void> {
  const supabase = getSupabaseServer()
  
  const { error } = await supabase
    .from('pools')
    .update({ status })
    .eq('id', poolId)

  if (error) throw error
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
  const supabase = getSupabaseServer()
  
  const { error } = await supabase
    .from('pools')
    .update({
      status: data.status,
      winner: data.winner,
      proof_hash: data.proofHash,
      proof_url: data.proofUrl,
    })
    .eq('id', poolId)

  if (error) throw error
}

/**
 * Get pools that need to be locked (current time >= lock_ts)
 */
export async function getPoolsToLock(): Promise<PoolDetail[]> {
  const supabase = getSupabaseServer()
  const now = Math.floor(Date.now() / 1000)

  const { data: pools, error } = await supabase
    .from('pools')
    .select('*')
    .eq('status', 'OPEN')
    .lte('lock_ts', now.toString())

  if (error || !pools) return []

  return pools.map(poolToDetail)
}

/**
 * Get pools that need to be resolved (current time >= end_ts)
 */
export async function getPoolsToResolve(): Promise<PoolDetail[]> {
  const supabase = getSupabaseServer()
  const now = Math.floor(Date.now() / 1000)

  const { data: pools, error } = await supabase
    .from('pools')
    .select('*')
    .eq('status', 'LOCKED')
    .lte('end_ts', now.toString())

  if (error || !pools) return []

  return pools.map(poolToDetail)
}

/**
 * Get all pools (for admin)
 */
export async function getAllPools(): Promise<PoolListItem[]> {
  const supabase = getSupabaseServer()
  
  const { data: pools, error } = await supabase
    .from('pools')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (pools || []).map(poolToListItem)
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
  const supabase = getSupabaseServer()
  
  const { error } = await supabase
    .from('price_history')
    .insert({
      pool_id: poolId,
      timestamp: timestamp.toString(),
      price,
      source,
    })

  if (error) console.error('Error storing price point:', error)
}

/**
 * Get price history for a pool
 */
export async function getPriceHistory(poolId: number) {
  const supabase = getSupabaseServer()
  
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('pool_id', poolId)
    .order('timestamp', { ascending: true })

  if (error) return []
  return data || []
}

// Helper functions to convert database models to frontend types

function poolToListItem(pool: any): PoolListItem {
  return {
    id: pool.id,
    token: pool.token,
    mint: pool.mint,
    logo: pool.logo_url,
    line_bps: pool.line_bps,
    confidence: Number(pool.ai_confidence),
    lock_ts: Number(pool.lock_ts),
    end_ts: Number(pool.end_ts),
    totals: {
      over: Number(pool.total_over_lamports),
      under: Number(pool.total_under_lamports),
    },
    status: pool.status as Status,
    pool_type: pool.pool_type,
    ai: {
      confidence: Number(pool.ai_confidence),
      model: pool.ai_model,
      commit: pool.ai_commit,
      payload_url: pool.ai_payload_url,
    },
  }
}

function poolToDetail(pool: any): PoolDetail {
  return {
    id: pool.id,
    token: pool.token,
    mint: pool.mint,
    logo: pool.logo_url,
    start_ts: Number(pool.start_ts),
    lock_ts: Number(pool.lock_ts),
    end_ts: Number(pool.end_ts),
    line_bps: pool.line_bps,
    pool_type: pool.pool_type,
    ai: {
      confidence: Number(pool.ai_confidence),
      model: pool.ai_model,
      commit: pool.ai_commit,
      payload_url: pool.ai_payload_url,
    },
    totals: {
      over: Number(pool.total_over_lamports),
      under: Number(pool.total_under_lamports),
    },
    status: pool.status as Status,
    winner: pool.winner as Side | 'Void' | null,
    proof: {
      hash: pool.proof_hash,
      url: pool.proof_url,
    },
    chart: (pool.price_history || []).map((point: any) => ({
      t: Number(point.timestamp),
      p: Number(point.price),
    })),
    ai_line_history: (pool.ai_line_history || []).map((h: any) => ({
      t: Number(h.timestamp),
      line_bps: Number(h.line_bps),
      source: h.source,
      note: h.note,
    })),
    contract_url: pool.contract_url,
  }
}
