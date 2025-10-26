/**
 * Entry Service
 * Database operations for entries using Supabase
 */

import { getSupabaseServer } from './supabase'

export interface Entry {
  id: number
  pool_id: number
  user_pubkey: string
  side: string
  amount_lamports: string
  fee_lamports: string
  tx_signature: string | null
  claimed: boolean
  claim_tx_signature: string | null
  price_at_entry: number | null
  ai_line_bps_at_entry: number | null
  created_at: string
}

/**
 * Get entry by pool and user
 */
export async function getEntry(poolId: number, userPubkey: string): Promise<Entry | null> {
  const supabase = getSupabaseServer()
  
  const { data: entry, error } = await supabase
    .from('entries')
    .select('*')
    .eq('pool_id', poolId)
    .eq('user_pubkey', userPubkey)
    .single()

  if (error || !entry) return null
  return entry as Entry
}

/**
 * Get all entries for a pool
 */
export async function getPoolEntries(poolId: number): Promise<Entry[]> {
  const supabase = getSupabaseServer()
  
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('pool_id', poolId)

  if (error) return []
  return (entries || []) as Entry[]
}

/**
 * Create a new entry
 */
export async function createEntry(data: {
  pool_id: number
  user_pubkey: string
  side: string
  amount_lamports: string
  fee_lamports: string
  tx_signature?: string
  price_at_entry?: number
  ai_line_bps_at_entry?: number
}): Promise<Entry> {
  const supabase = getSupabaseServer()
  
  const { data: entry, error } = await supabase
    .from('entries')
    .insert({
      pool_id: data.pool_id,
      user_pubkey: data.user_pubkey,
      side: data.side,
      amount_lamports: data.amount_lamports,
      fee_lamports: data.fee_lamports,
      tx_signature: data.tx_signature || null,
      price_at_entry: data.price_at_entry || null,
      ai_line_bps_at_entry: data.ai_line_bps_at_entry || null,
      claimed: false,
    })
    .select()
    .single()

  if (error) throw error
  return entry as Entry
}

/**
 * Mark entry as claimed
 */
export async function markEntryClaimed(
  entryId: number,
  txSignature: string
): Promise<void> {
  const supabase = getSupabaseServer()
  
  const { error } = await supabase
    .from('entries')
    .update({
      claimed: true,
      claim_tx_signature: txSignature,
    })
    .eq('id', entryId)

  if (error) throw error
}

