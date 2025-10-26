/**
 * Storage Service using Shadow Drive
 * For storing AI payloads and resolution proofs
 */

import { ShdwDrive } from '@shadow-drive/sdk'
import { Connection, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

let drive: ShdwDrive | null = null

/**
 * Initialize Shadow Drive client
 * Singleton pattern to reuse the same client
 */
async function initShadowDrive(): Promise<ShdwDrive> {
  if (drive) return drive

  const rpcUrl = process.env.SOLANA_RPC_URL
  const privateKey = process.env.SHADOW_DRIVE_WALLET_PRIVATE_KEY

  if (!rpcUrl || !privateKey) {
    throw new Error(
      'Missing SOLANA_RPC_URL or SHADOW_DRIVE_WALLET_PRIVATE_KEY environment variables'
    )
  }

  const connection = new Connection(rpcUrl)
  const wallet = Keypair.fromSecretKey(bs58.decode(privateKey))

  drive = await new ShdwDrive(connection, wallet).init()
  return drive
}

/**
 * Upload pool resolution proof to Shadow Drive
 * @param poolId - Pool ID
 * @param proofData - Proof data object
 * @returns Shadow Drive URL
 */
export async function uploadProof(
  poolId: number,
  proofData: any
): Promise<string> {
  const drive = await initShadowDrive()
  const storageAccount = process.env.SHADOW_DRIVE_STORAGE_ACCOUNT

  if (!storageAccount) {
    throw new Error('Missing SHADOW_DRIVE_STORAGE_ACCOUNT environment variable')
  }

  // Convert proof data to JSON buffer
  const jsonBuffer = Buffer.from(JSON.stringify(proofData, null, 2))
  const fileName = `proof-pool-${poolId}-${Date.now()}.json`

  // Create File object from buffer (Node.js compatible)
  const file = new File([jsonBuffer], fileName, { type: 'application/json' })

  try {
    // Upload to Shadow Drive
    const uploadResponse = await drive.uploadFile(storageAccount, file)

    // Return the Shadow Drive URL
    return uploadResponse.finalized_locations[0]
  } catch (error) {
    console.error('Shadow Drive upload failed:', error)
    throw new Error(`Failed to upload proof for pool ${poolId}: ${error}`)
  }
}

/**
 * Upload AI model payload to Shadow Drive
 * @param poolId - Pool ID
 * @param aiData - AI model data
 * @returns Shadow Drive URL
 */
export async function uploadAIPayload(
  poolId: number,
  aiData: any
): Promise<string> {
  const drive = await initShadowDrive()
  const storageAccount = process.env.SHADOW_DRIVE_STORAGE_ACCOUNT

  if (!storageAccount) {
    throw new Error('Missing SHADOW_DRIVE_STORAGE_ACCOUNT environment variable')
  }

  const jsonBuffer = Buffer.from(JSON.stringify(aiData, null, 2))
  const fileName = `ai-payload-pool-${poolId}-${Date.now()}.json`
  const file = new File([jsonBuffer], fileName, { type: 'application/json' })

  try {
    const uploadResponse = await drive.uploadFile(storageAccount, file)
    return uploadResponse.finalized_locations[0]
  } catch (error) {
    console.error('Shadow Drive upload failed:', error)
    throw new Error(`Failed to upload AI payload for pool ${poolId}: ${error}`)
  }
}

/**
 * Retrieve proof data from Shadow Drive URL
 * @param url - Shadow Drive URL
 * @returns Proof data object
 */
export async function getProofFromUrl(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch proof:', error)
    throw new Error(`Failed to fetch proof from ${url}: ${error}`)
  }
}

/**
 * Retrieve AI payload from Shadow Drive URL
 * @param url - Shadow Drive URL
 * @returns AI payload object
 */
export async function getAIPayloadFromUrl(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch AI payload:', error)
    throw new Error(`Failed to fetch AI payload from ${url}: ${error}`)
  }
}

/**
 * Optional: Dual upload to Shadow Drive + Arweave for critical proofs
 * @param poolId - Pool ID
 * @param proofData - Proof data
 * @returns Object with both URLs
 */
export async function uploadProofDual(
  poolId: number,
  proofData: any
): Promise<{ shadowDriveUrl: string; arweaveUrl?: string }> {
  // Primary upload to Shadow Drive
  const shadowDriveUrl = await uploadProof(poolId, proofData)

  // Optional: Arweave backup (implement when needed)
  // const arweaveUrl = await uploadToArweave(poolId, proofData)

  return {
    shadowDriveUrl,
    // arweaveUrl,
  }
}
