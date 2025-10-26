import { NextResponse } from "next/server"
import { PublicKey } from "@solana/web3.js"
import {
  buildEnterTransaction,
  serializeTransaction,
  estimateTransactionFee,
} from "@/lib/solana-service"
import { getPoolById } from "@/lib/pool-service"
import type { Side } from "@/types/pve"

/**
 * POST /api/tx/enter
 * Build transaction for entering a prediction pool
 *
 * Request body:
 * {
 *   pool_id: number,
 *   user_pubkey: string (base58),
 *   amount_lamports: string (bigint as string),
 *   side: "Over" | "Under"
 * }
 *
 * Response:
 * {
 *   transaction: string (base64),
 *   pool_pda: string (base58),
 *   entry_pda: string (base58),
 *   fee_estimate: string (lamports as string)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pool_id, user_pubkey, amount_lamports, side } = body

    // Validate inputs
    if (!pool_id || typeof pool_id !== "number") {
      return NextResponse.json(
        { error: "Invalid pool_id" },
        { status: 400 }
      )
    }

    if (!user_pubkey || typeof user_pubkey !== "string") {
      return NextResponse.json(
        { error: "Invalid user_pubkey" },
        { status: 400 }
      )
    }

    if (!amount_lamports || typeof amount_lamports !== "string") {
      return NextResponse.json(
        { error: "Invalid amount_lamports (must be string)" },
        { status: 400 }
      )
    }

    if (!side || (side !== "Over" && side !== "Under")) {
      return NextResponse.json(
        { error: "Invalid side (must be Over or Under)" },
        { status: 400 }
      )
    }

    // DEV MODE: Use synthetic pool data instead of database
    const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    
    if (isDev) {
      // Use synthetic pool data for development
      const now = Math.floor(Date.now() / 1000)
      let pool
      
      switch (pool_id) {
        case 1:
          pool = { status: "OPEN", lock_ts: now + 4 * 3600 }
          break
        case 2:
          pool = { status: "OPEN", lock_ts: now - 1800 } // Locked
          break
        case 3:
          pool = { status: "OPEN", lock_ts: now + 3 * 3600 }
          break
        case 4:
          pool = { status: "OPEN", lock_ts: now + 2 * 3600 }
          break
        case 5:
          pool = { status: "OPEN", lock_ts: now + 5 * 3600 }
          break
        case 6:
          pool = { status: "OPEN", lock_ts: now + 6 * 3600 }
          break
        case 7:
          pool = { status: "OPEN", lock_ts: now + 4 * 3600 }
          break
        case 8:
          pool = { status: "OPEN", lock_ts: now - 3600 } // Locked
          break
        case 9:
          pool = { status: "OPEN", lock_ts: now + 8 * 3600 }
          break
        default:
          return NextResponse.json(
            { error: "Pool not found" },
            { status: 404 }
          )
      }
      
      if (pool.status !== "OPEN") {
        return NextResponse.json(
          { error: `Pool is ${pool.status}, not open for entries` },
          { status: 400 }
        )
      }

      // Check if pool is locked
      if (now >= pool.lock_ts) {
        return NextResponse.json(
          { error: "Pool is locked, no more entries allowed" },
          { status: 400 }
        )
      }
    } else {
      // Production mode: use database
      const pool = await getPoolById(pool_id)
      if (!pool) {
        return NextResponse.json(
          { error: "Pool not found" },
          { status: 404 }
        )
      }

      if (pool.status !== "OPEN") {
        return NextResponse.json(
          { error: `Pool is ${pool.status}, not open for entries` },
          { status: 400 }
        )
      }

      // Check if pool is locked
      if (now >= pool.lock_ts) {
        return NextResponse.json(
          { error: "Pool is locked, no more entries allowed" },
          { status: 400 }
        )
      }
    }

    // Validate amount (minimum 0.01 SOL = 10,000,000 lamports)
    const amountBigInt = BigInt(amount_lamports)
    if (amountBigInt < 10000000n) {
      return NextResponse.json(
        { error: "Minimum entry amount is 0.01 SOL" },
        { status: 400 }
      )
    }

    // Parse user public key
    let userPubkey: PublicKey
    try {
      userPubkey = new PublicKey(user_pubkey)
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user public key" },
        { status: 400 }
      )
    }

    if (isDev) {
      // Return mock transaction data for testing
      return NextResponse.json({
        transaction: "MOCK_TRANSACTION_DATA",
        pool_pda: "MOCK_POOL_PDA",
        entry_pda: "MOCK_ENTRY_PDA", 
        fee_estimate: "5000",
        dev_mode: true,
        message: "Entry simulated in dev mode"
      })
    }

    // Build real transaction (production mode)
    const { transaction, poolPda, entryPda } = await buildEnterTransaction(
      pool_id,
      userPubkey,
      amountBigInt,
      side as Side
    )

    // Estimate fee
    const feeEstimate = await estimateTransactionFee(transaction)

    // Serialize transaction to base64
    const serialized = serializeTransaction(transaction)

    return NextResponse.json({
      transaction: serialized,
      pool_pda: poolPda.toBase58(),
      entry_pda: entryPda.toBase58(),
      fee_estimate: feeEstimate.toString(),
    })
  } catch (error) {
    console.error("Failed to build enter transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to build transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
