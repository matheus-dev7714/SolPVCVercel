/**
 * Transaction Listener Service
 * Monitors Solana transactions and updates database when confirmed
 */

import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js'
import { Program, BorshEventCoder } from '@coral-xyz/anchor'
import { getConnection } from './solana-service'
import { updatePoolTotals } from './pool-service'
import { prisma } from './prisma'
import { fetchCurrentPrice } from './price-service'
import { prisma } from './prisma'
import { IDL, Solpve } from './idl/solpve'
import type { Side } from '@/types/pve'

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '11111111111111111111111111111111'
)

// Event coder for parsing program events
const eventCoder = new BorshEventCoder(IDL)

/**
 * Process a confirmed transaction
 * Parses events and updates database accordingly
 */
export async function processConfirmedTransaction(
  signature: string
): Promise<void> {
  const connection = getConnection()

  try {
    // Fetch transaction details
    const tx = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })

    if (!tx) {
      console.error(`Transaction ${signature} not found`)
      return
    }

    if (tx.meta?.err) {
      console.error(`Transaction ${signature} failed:`, tx.meta.err)
      return
    }

    // Parse program logs for events
    const logs = tx.meta?.logMessages || []

    for (const log of logs) {
      // Check if this is a program event log
      if (log.includes('Program log:') && log.includes('EntryCreated')) {
        await handleEntryCreated(signature, logs, tx)
      } else if (log.includes('Program log:') && log.includes('WinningsClaimed')) {
        await handleWinningsClaimed(signature, logs, tx)
      } else if (log.includes('Program log:') && log.includes('PoolResolved')) {
        await handlePoolResolved(signature, logs, tx)
      } else if (log.includes('Program log:') && log.includes('PoolLocked')) {
        await handlePoolLocked(signature, logs, tx)
      }
    }
  } catch (error) {
    console.error(`Failed to process transaction ${signature}:`, error)
  }
}

/**
 * Handle EntryCreated event
 */
async function handleEntryCreated(
  signature: string,
  logs: string[],
  tx: ParsedTransactionWithMeta
): Promise<void> {
  try {
    // Parse event from logs
    const event = parseEventFromLogs(logs, 'EntryCreated')
    if (!event) return

    const { pool, user, side, amount, fee } = event.data

    // Determine pool ID from pool pubkey
    // Note: In production, you'd query the pool account or maintain a mapping
    const poolId = await getPoolIdFromPubkey(pool)
    if (!poolId) {
      console.error(`Could not determine pool ID for pubkey ${pool.toBase58()}`)
      return
    }

    // Convert side enum to string
    const sideStr: Side = side.over ? 'Over' : 'Under'

    // Check if entry already exists
    const existingEntry = await prisma.entry.findFirst({
      where: {
        poolId,
        userPubkey: user.toBase58(),
      },
    })

    // Snapshot current price and AI line (if any)
    let priceAtEntry: number | null = null
    let aiLineBpsAtEntry: number | null = null
    try {
      const poolRecord = await prisma.pool.findUnique({ where: { id: poolId }, include: { aiLineHistory: { orderBy: { timestamp: 'desc' }, take: 1 } } })
      if (poolRecord) {
        const price = await fetchCurrentPrice(poolRecord.mint)
        priceAtEntry = price.price
        aiLineBpsAtEntry = poolRecord.aiLineHistory?.[0]?.lineBps ?? poolRecord.lineBps
      }
    } catch (e) {
      // non-fatal: keep going without snapshots
    }

    if (existingEntry) {
      // Update existing entry
      await prisma.entry.update({
        where: { id: existingEntry.id },
        data: {
          amountLamports: BigInt(amount.toString()),
          feeLamports: BigInt(fee.toString()),
          txSignature: signature,
          priceAtEntry: priceAtEntry ?? undefined,
          aiLineBpsAtEntry: aiLineBpsAtEntry ?? undefined,
        },
      })
    } else {
      // Create new entry
      await prisma.entry.create({
        data: {
          poolId,
          userPubkey: user.toBase58(),
          side: sideStr,
          amountLamports: BigInt(amount.toString()),
          feeLamports: BigInt(fee.toString()),
          claimed: false,
          txSignature: signature,
          priceAtEntry: priceAtEntry ?? undefined,
          aiLineBpsAtEntry: aiLineBpsAtEntry ?? undefined,
        },
      })
    }

    // Update pool totals
    await updatePoolTotals(poolId, sideStr, BigInt(amount.toString()))

    console.log(
      `✅ Processed entry for pool ${poolId}, user ${user.toBase58()}, side ${sideStr}, amount ${amount.toString()}`
    )
  } catch (error) {
    console.error('Failed to handle EntryCreated event:', error)
  }
}

/**
 * Handle WinningsClaimed event
 */
async function handleWinningsClaimed(
  signature: string,
  logs: string[],
  tx: ParsedTransactionWithMeta
): Promise<void> {
  try {
    // Parse event from logs
    const event = parseEventFromLogs(logs, 'WinningsClaimed')
    if (!event) return

    const { pool, user, amount } = event.data

    // Determine pool ID from pool pubkey
    const poolId = await getPoolIdFromPubkey(pool)
    if (!poolId) {
      console.error(`Could not determine pool ID for pubkey ${pool.toBase58()}`)
      return
    }

    // Mark entry as claimed
    await prisma.entry.updateMany({
      where: {
        poolId,
        userPubkey: user.toBase58(),
      },
      data: {
        claimed: true,
        claimTxSignature: signature,
      },
    })

    console.log(
      `✅ Processed claim for pool ${poolId}, user ${user.toBase58()}, amount ${amount.toString()}`
    )
  } catch (error) {
    console.error('Failed to handle WinningsClaimed event:', error)
  }
}

/**
 * Handle PoolResolved event
 */
async function handlePoolResolved(
  signature: string,
  logs: string[],
  tx: ParsedTransactionWithMeta
): Promise<void> {
  try {
    // Parse event from logs
    const event = parseEventFromLogs(logs, 'PoolResolved')
    if (!event) return

    const { pool, winner, proofHash } = event.data

    // Determine pool ID from pool pubkey
    const poolId = await getPoolIdFromPubkey(pool)
    if (!poolId) {
      console.error(`Could not determine pool ID for pubkey ${pool.toBase58()}`)
      return
    }

    // Convert winner enum to string
    let winnerStr: 'Over' | 'Under' | 'Void' | null
    if (winner.over) winnerStr = 'Over'
    else if (winner.under) winnerStr = 'Under'
    else if (winner.void) winnerStr = 'Void'
    else winnerStr = null

    // Convert proof hash to hex string
    const proofHashHex = '0x' + Buffer.from(proofHash).toString('hex')

    // Update pool status
    await prisma.pool.update({
      where: { id: poolId },
      data: {
        status: 'RESOLVED',
        winner: winnerStr,
        proofHash: proofHashHex,
      },
    })

    // Note: Resolution record is created by oracle-service.ts
    // The transaction listener only updates the on-chain confirmation

    console.log(
      `✅ Processed resolution for pool ${poolId}, winner ${winnerStr}`
    )
  } catch (error) {
    console.error('Failed to handle PoolResolved event:', error)
  }
}

/**
 * Handle PoolLocked event
 */
async function handlePoolLocked(
  signature: string,
  logs: string[],
  tx: ParsedTransactionWithMeta
): Promise<void> {
  try {
    // Parse event from logs
    const event = parseEventFromLogs(logs, 'PoolLocked')
    if (!event) return

    const { pool } = event.data

    // Determine pool ID from pool pubkey
    const poolId = await getPoolIdFromPubkey(pool)
    if (!poolId) {
      console.error(`Could not determine pool ID for pubkey ${pool.toBase58()}`)
      return
    }

    // Update pool status
    await prisma.pool.update({
      where: { id: poolId },
      data: {
        status: 'LOCKED',
      },
    })

    console.log(`✅ Processed lock for pool ${poolId}`)
  } catch (error) {
    console.error('Failed to handle PoolLocked event:', error)
  }
}

/**
 * Parse event from program logs
 */
function parseEventFromLogs(logs: string[], eventName: string): any {
  try {
    // Find the log line with the event data
    const eventLog = logs.find((log) => log.includes(`Program data: `))
    if (!eventLog) return null

    // Extract base64 data
    const dataMatch = eventLog.match(/Program data: (.+)/)
    if (!dataMatch) return null

    const dataBase64 = dataMatch[1]
    const dataBuffer = Buffer.from(dataBase64, 'base64')

    // Decode event
    const event = eventCoder.decode(dataBuffer.toString('hex'))
    if (event?.name === eventName) {
      return event
    }

    return null
  } catch (error) {
    console.error(`Failed to parse ${eventName} event:`, error)
    return null
  }
}

/**
 * Get pool ID from pool pubkey
 * Queries the pool account and extracts the pool_id field
 */
async function getPoolIdFromPubkey(
  poolPubkey: PublicKey
): Promise<number | null> {
  try {
    const connection = getConnection()
    const accountInfo = await connection.getAccountInfo(poolPubkey)
    if (!accountInfo) return null

    // Parse account data (simplified - assumes pool_id is at a known offset)
    // In production, use Anchor's account parser
    // For now, query database by contract_url containing the pool pubkey
    const pool = await prisma.pool.findFirst({
      where: {
        contractUrl: {
          contains: poolPubkey.toBase58(),
        },
      },
    })

    return pool?.id || null
  } catch (error) {
    console.error('Failed to get pool ID from pubkey:', error)
    return null
  }
}

/**
 * Monitor transactions for a specific signature
 * Polls until confirmed, then processes
 */
export async function monitorTransaction(
  signature: string,
  maxRetries = 30,
  retryDelayMs = 1000
): Promise<boolean> {
  const connection = getConnection()

  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await connection.getSignatureStatus(signature)

      if (status.value?.confirmationStatus === 'confirmed' ||
          status.value?.confirmationStatus === 'finalized') {
        // Transaction confirmed, process it
        await processConfirmedTransaction(signature)
        return true
      }

      if (status.value?.err) {
        console.error(`Transaction ${signature} failed:`, status.value.err)
        return false
      }
    } catch (error) {
      console.error(
        `Failed to check transaction status (attempt ${i + 1}):`,
        error
      )
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
  }

  console.error(`Transaction ${signature} confirmation timeout`)
  return false
}

/**
 * Start listening to program logs (WebSocket)
 * This is for real-time monitoring in production
 */
export function startProgramLogListener(): number {
  const connection = getConnection()

  const subscriptionId = connection.onLogs(
    PROGRAM_ID,
    async (logs) => {
      if (logs.err) {
        console.error('Transaction failed:', logs.err)
        return
      }

      // Process the confirmed transaction
      await processConfirmedTransaction(logs.signature)
    },
    'confirmed'
  )

  console.log(
    `📡 Started listening to program logs (subscription ID: ${subscriptionId})`
  )

  return subscriptionId
}

/**
 * Stop listening to program logs
 */
export async function stopProgramLogListener(subscriptionId: number): Promise<void> {
  const connection = getConnection()
  await connection.removeOnLogsListener(subscriptionId)
  console.log(`🛑 Stopped listening to program logs (subscription ID: ${subscriptionId})`)
}
