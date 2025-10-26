/**
 * Pool utility functions for frontend
 */

import type { Status } from '@/types/pve'

/**
 * Check if a pool is actually open for entries
 * A pool is open if:
 * 1. Status is "OPEN"
 * 2. Current time is before lock_ts
 */
export function isPoolOpenForEntry(status: Status, lock_ts: number): boolean {
  if (status !== 'OPEN') {
    return false
  }
  
  const now = Math.floor(Date.now() / 1000)
  return now < lock_ts
}

/**
 * Get effective status of a pool
 * Returns the actual status considering both database status and time
 */
export function getEffectiveStatus(status: Status, lock_ts: number, end_ts: number): Status {
  const now = Math.floor(Date.now() / 1000)
  
  // If already resolved or void, keep that status
  if (status === 'RESOLVED' || status === 'VOID') {
    return status
  }
  
  // If status is OPEN but lock time has passed, it's effectively locked
  if (status === 'OPEN' && now >= lock_ts) {
    return 'LOCKED'
  }
  
  // If status is LOCKED and end time has passed, it should be resolving
  if (status === 'LOCKED' && now >= end_ts) {
    return 'LOCKED' // Keep as LOCKED until oracle resolves it
  }
  
  return status
}

/**
 * Get a message explaining why a pool is locked
 */
export function getLockReason(status: Status, lock_ts: number): string | null {
  const now = Math.floor(Date.now() / 1000)
  
  if (status === 'LOCKED') {
    return 'This pool is locked. No new entries allowed. Waiting for resolution.'
  }
  
  if (status === 'OPEN' && now >= lock_ts) {
    return 'Entry period has ended. This pool is now locked and awaiting resolution.'
  }
  
  return null
}


