/**
 * Solana Service
 * Builds and manages Solana transactions for the PvE prediction market
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { AnchorProvider, Program, BN, web3 } from '@coral-xyz/anchor'
import { IDL, Solpve } from './idl/solpve'
import type { Side } from '@/types/pve'

// Configuration
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '11111111111111111111111111111111'
)
const RPC_URL =
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'

let connection: Connection | null = null
let program: Program<Solpve> | null = null

/**
 * Get Solana connection (singleton)
 */
export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed')
  }
  return connection
}

/**
 * Get program instance (for server-side use with dummy wallet)
 */
function getProgram(): Program<Solpve> {
  if (!program) {
    const connection = getConnection()
    // Dummy wallet for server-side operations (read-only)
    const dummyKeypair = web3.Keypair.generate()
    const wallet = {
      publicKey: dummyKeypair.publicKey,
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs,
    }
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    })
    program = new Program<Solpve>(IDL, PROGRAM_ID, provider)
  }
  return program
}

/**
 * Derive pool PDA
 */
export function getPoolPda(poolId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), new BN(poolId).toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID
  )
}

/**
 * Derive pool vault PDA
 */
export function getPoolVaultPda(poolPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool_vault'), poolPubkey.toBuffer()],
    PROGRAM_ID
  )
}

/**
 * Derive user entry PDA
 */
export function getEntryPda(
  poolPubkey: PublicKey,
  userPubkey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('entry'),
      poolPubkey.toBuffer(),
      userPubkey.toBuffer(),
    ],
    PROGRAM_ID
  )
}

// ============================================================================
// Transaction Builders
// ============================================================================

/**
 * Build transaction for entering a pool
 */
export async function buildEnterTransaction(
  poolId: number,
  userPubkey: PublicKey,
  amountLamports: bigint,
  side: Side
): Promise<{
  transaction: Transaction
  poolPda: PublicKey
  entryPda: PublicKey
}> {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)
  const [poolVaultPda] = getPoolVaultPda(poolPda)
  const [entryPda] = getEntryPda(poolPda, userPubkey)

  // Convert bigint to BN
  const amount = new BN(amountLamports.toString())

  // Convert TypeScript Side to program enum
  const sideEnum = side === 'Over' ? { over: {} } : { under: {} }

  // Build instruction
  const instruction = await program.methods
    .enterPool(amount, sideEnum as any)
    .accounts({
      pool: poolPda,
      poolVault: poolVaultPda,
      entry: entryPda,
      user: userPubkey,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  // Create transaction
  const transaction = new Transaction().add(instruction)

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await getConnection().getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = userPubkey

  return {
    transaction,
    poolPda,
    entryPda,
  }
}

/**
 * Build transaction for claiming winnings
 */
export async function buildClaimTransaction(
  poolId: number,
  userPubkey: PublicKey
): Promise<{
  transaction: Transaction
  poolPda: PublicKey
  entryPda: PublicKey
}> {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)
  const [poolVaultPda] = getPoolVaultPda(poolPda)
  const [entryPda] = getEntryPda(poolPda, userPubkey)

  // Build instruction
  const instruction = await program.methods
    .claimWinnings()
    .accounts({
      pool: poolPda,
      poolVault: poolVaultPda,
      entry: entryPda,
      user: userPubkey,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  // Create transaction
  const transaction = new Transaction().add(instruction)

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await getConnection().getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = userPubkey

  return {
    transaction,
    poolPda,
    entryPda,
  }
}

/**
 * Build transaction for resolving a pool (admin only)
 */
export async function buildResolveTransaction(
  poolId: number,
  authorityPubkey: PublicKey,
  winner: 'Over' | 'Under' | 'Void',
  proofHash: string
): Promise<Transaction> {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)

  // Convert winner to program enum
  let winnerEnum: any
  if (winner === 'Over') winnerEnum = { over: {} }
  else if (winner === 'Under') winnerEnum = { under: {} }
  else winnerEnum = { void: {} }

  // Convert proof hash (0x-prefixed hex string) to 32-byte array
  const proofHashBytes = Buffer.from(
    proofHash.startsWith('0x') ? proofHash.slice(2) : proofHash,
    'hex'
  )
  if (proofHashBytes.length !== 32) {
    throw new Error('Proof hash must be 32 bytes')
  }

  // Build instruction
  const instruction = await program.methods
    .resolvePool(winnerEnum, Array.from(proofHashBytes))
    .accounts({
      pool: poolPda,
      authority: authorityPubkey,
    })
    .instruction()

  // Create transaction
  const transaction = new Transaction().add(instruction)

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await getConnection().getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = authorityPubkey

  return transaction
}

/**
 * Build transaction for locking a pool (admin only)
 */
export async function buildLockPoolTransaction(
  poolId: number,
  authorityPubkey: PublicKey
): Promise<Transaction> {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)

  // Build instruction
  const instruction = await program.methods
    .lockPool()
    .accounts({
      pool: poolPda,
      authority: authorityPubkey,
    })
    .instruction()

  // Create transaction
  const transaction = new Transaction().add(instruction)

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await getConnection().getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = authorityPubkey

  return transaction
}

/**
 * Build transaction for initializing a new pool (admin only)
 */
export async function buildInitializePoolTransaction(
  poolId: number,
  authorityPubkey: PublicKey,
  startTs: number,
  lockTs: number,
  endTs: number,
  lineBps: number,
  aiCommit: string
): Promise<Transaction> {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)
  const [poolVaultPda] = getPoolVaultPda(poolPda)

  // Convert AI commit hash to 32-byte array
  const aiCommitBytes = Buffer.from(
    aiCommit.startsWith('0x') ? aiCommit.slice(2) : aiCommit,
    'hex'
  )
  if (aiCommitBytes.length !== 32) {
    throw new Error('AI commit hash must be 32 bytes')
  }

  // Build instruction
  const instruction = await program.methods
    .initializePool(
      new BN(poolId),
      new BN(startTs),
      new BN(lockTs),
      new BN(endTs),
      lineBps,
      Array.from(aiCommitBytes)
    )
    .accounts({
      pool: poolPda,
      poolVault: poolVaultPda,
      authority: authorityPubkey,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  // Create transaction
  const transaction = new Transaction().add(instruction)

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } =
    await getConnection().getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = authorityPubkey

  return transaction
}

// ============================================================================
// Account Fetchers
// ============================================================================

/**
 * Fetch pool account data from chain
 */
export async function fetchPoolAccount(poolId: number) {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)

  try {
    const poolAccount = await program.account.pool.fetch(poolPda)
    return poolAccount
  } catch (error) {
    console.error(`Failed to fetch pool ${poolId}:`, error)
    return null
  }
}

/**
 * Fetch entry account data from chain
 */
export async function fetchEntryAccount(
  poolId: number,
  userPubkey: PublicKey
) {
  const program = getProgram()
  const [poolPda] = getPoolPda(poolId)
  const [entryPda] = getEntryPda(poolPda, userPubkey)

  try {
    const entryAccount = await program.account.entry.fetch(entryPda)
    return entryAccount
  } catch (error) {
    console.error(
      `Failed to fetch entry for pool ${poolId}, user ${userPubkey.toBase58()}:`,
      error
    )
    return null
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Serialize transaction to base64 for sending to frontend
 */
export function serializeTransaction(transaction: Transaction): string {
  return transaction.serialize({ requireAllSignatures: false }).toString('base64')
}

/**
 * Deserialize transaction from base64
 */
export function deserializeTransaction(base64: string): Transaction {
  return Transaction.from(Buffer.from(base64, 'base64'))
}

/**
 * Calculate transaction fee estimate
 */
export async function estimateTransactionFee(
  transaction: Transaction
): Promise<bigint> {
  const connection = getConnection()
  const fee = await connection.getFeeForMessage(
    transaction.compileMessage(),
    'confirmed'
  )
  return BigInt(fee.value || 5000) // Default 5000 lamports if estimation fails
}

/**
 * Verify transaction signature
 */
export async function verifyTransaction(signature: string): Promise<boolean> {
  const connection = getConnection()
  try {
    const result = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    })
    return result.value?.confirmationStatus === 'confirmed' ||
           result.value?.confirmationStatus === 'finalized'
  } catch (error) {
    console.error('Failed to verify transaction:', error)
    return false
  }
}

/**
 * Wait for transaction confirmation
 */
export async function confirmTransaction(
  signature: string,
  maxRetries = 30,
  retryDelayMs = 1000
): Promise<boolean> {
  const connection = getConnection()

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await connection.getSignatureStatus(signature)
      if (result.value?.confirmationStatus === 'confirmed' ||
          result.value?.confirmationStatus === 'finalized') {
        return true
      }
      if (result.value?.err) {
        console.error('Transaction failed:', result.value.err)
        return false
      }
    } catch (error) {
      console.error(`Failed to check transaction status (attempt ${i + 1}):`, error)
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
  }

  console.error('Transaction confirmation timeout')
  return false
}
