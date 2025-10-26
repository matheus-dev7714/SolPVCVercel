import { NextResponse } from "next/server"
import { PublicKey } from "@solana/web3.js"
import {
  buildClaimTransaction,
  serializeTransaction,
  estimateTransactionFee,
} from "@/lib/solana-service"
import { getPoolById } from "@/lib/pool-service"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/tx/claim
 * Build transaction for claiming winnings from a resolved pool
 *
 * Request body:
 * {
 *   pool_id: number,
 *   user_pubkey: string (base58)
 * }
 *
 * Response:
 * {
 *   transaction: string (base64),
 *   pool_pda: string (base58),
 *   entry_pda: string (base58),
 *   fee_estimate: string (lamports as string),
 *   payout_estimate: string (lamports as string)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pool_id, user_pubkey } = body

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

    // Verify pool exists and is resolved
    const pool = await getPoolById(pool_id)
    if (!pool) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      )
    }

    if (pool.status !== "RESOLVED") {
      return NextResponse.json(
        { error: `Pool is ${pool.status}, not resolved yet` },
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

    // Check if user has entry in this pool
    const entry = await prisma.entry.findFirst({
      where: {
        poolId: pool_id,
        userPubkey: user_pubkey,
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "No entry found for this user in this pool" },
        { status: 404 }
      )
    }

    if (entry.claimed) {
      return NextResponse.json(
        { error: "Winnings already claimed" },
        { status: 400 }
      )
    }

    // Check if user won
    const userWon =
      (entry.side === "Over" && pool.winner === "Over") ||
      (entry.side === "Under" && pool.winner === "Under") ||
      pool.winner === "Void"

    if (!userWon) {
      return NextResponse.json(
        { error: "User did not win this pool" },
        { status: 400 }
      )
    }

    // Calculate estimated payout
    let payoutEstimate: bigint
    if (pool.winner === "Void") {
      // Void: return original amount
      payoutEstimate = entry.amountLamports
    } else {
      // Winner: proportional share of total pool
      const winningSideTotal =
        pool.winner === "Over" ? pool.total_over : pool.total_under
      const totalPool = pool.total_over + pool.total_under

      // payout = (user_amount / winning_side_total) * total_pool
      payoutEstimate =
        (entry.amountLamports * totalPool) / winningSideTotal
    }

    // Build transaction
    const { transaction, poolPda, entryPda } = await buildClaimTransaction(
      pool_id,
      userPubkey
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
      payout_estimate: payoutEstimate.toString(),
    })
  } catch (error) {
    console.error("Failed to build claim transaction:", error)
    return NextResponse.json(
      {
        error: "Failed to build transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
