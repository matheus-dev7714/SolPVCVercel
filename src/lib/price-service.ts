/**
 * Price Service
 * Fetch token prices from DEX aggregators (Jupiter/Birdeye)
 */

import { storePricePoint } from './pool-service'

export interface PriceData {
  price: number
  timestamp: number
  source: string
}

/**
 * Fetch current price from Jupiter Price API
 * https://price.jup.ag/v6/price?ids=<mint_address>
 */
async function fetchPriceFromJupiter(mint: string): Promise<PriceData | null> {
  try {
    const url = `https://price.jup.ag/v6/price?ids=${mint}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Jupiter API error: ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (!data.data || !data.data[mint]) {
      console.error('Jupiter: No price data for mint', mint)
      return null
    }

    return {
      price: data.data[mint].price,
      timestamp: Math.floor(Date.now() / 1000),
      source: 'jupiter',
    }
  } catch (error) {
    console.error('Jupiter price fetch failed:', error)
    return null
  }
}

/**
 * Fetch current price from Birdeye API
 * https://public-api.birdeye.so/defi/price?address=<mint_address>
 */
async function fetchPriceFromBirdeye(
  mint: string
): Promise<PriceData | null> {
  try {
    const apiKey = process.env.BIRDEYE_API_KEY
    if (!apiKey) {
      console.warn('BIRDEYE_API_KEY not configured')
      return null
    }

    const url = `https://public-api.birdeye.so/defi/price?address=${mint}`
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      console.error(`Birdeye API error: ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (!data.data || !data.data.value) {
      console.error('Birdeye: No price data for mint', mint)
      return null
    }

    return {
      price: data.data.value,
      timestamp: Math.floor(Date.now() / 1000),
      source: 'birdeye',
    }
  } catch (error) {
    console.error('Birdeye price fetch failed:', error)
    return null
  }
}

/**
 * Fetch current price with fallback
 * Tries Jupiter first, then Birdeye
 */
export async function fetchCurrentPrice(mint: string): Promise<PriceData> {
  // Try Jupiter first (free, no API key required)
  let priceData = await fetchPriceFromJupiter(mint)

  // Fallback to Birdeye
  if (!priceData) {
    priceData = await fetchPriceFromBirdeye(mint)
  }

  // If both fail, throw error
  if (!priceData) {
    throw new Error(`Failed to fetch price for mint ${mint}`)
  }

  return priceData
}

/**
 * Fetch and store price point for a pool
 */
export async function fetchAndStorePrice(
  poolId: number,
  mint: string
): Promise<void> {
  const priceData = await fetchCurrentPrice(mint)

  await storePricePoint(
    poolId,
    BigInt(priceData.timestamp),
    priceData.price,
    priceData.source
  )
}

/**
 * Fetch prices for multiple pools in batch
 */
export async function fetchAndStorePricesForPools(
  pools: Array<{ id: number; mint: string }>
): Promise<void> {
  const promises = pools.map((pool) =>
    fetchAndStorePrice(pool.id, pool.mint).catch((error) => {
      console.error(`Failed to fetch price for pool ${pool.id}:`, error)
    })
  )

  await Promise.all(promises)
}

/**
 * Calculate price change in basis points
 */
export function calculatePriceChangeBps(
  startPrice: number,
  finalPrice: number
): number {
  if (startPrice === 0) return 0
  const changePercent = ((finalPrice - startPrice) / startPrice) * 10000
  return Math.round(changePercent)
}

/**
 * Determine winner based on price change vs line
 */
export function determineWinner(
  startPrice: number,
  finalPrice: number,
  lineBps: number
): 'Over' | 'Under' | 'Void' {
  const changeBps = calculatePriceChangeBps(startPrice, finalPrice)

  // If change is within 1 bps of line, call it void (too close to call)
  if (Math.abs(changeBps - lineBps) < 1) {
    return 'Void'
  }

  // If actual change is greater than predicted line, Over wins
  // If actual change is less than predicted line, Under wins
  return changeBps > lineBps ? 'Over' : 'Under'
}

/**
 * Get historical price for a specific timestamp (for backtesting)
 * This is a placeholder - in production you'd query historical data APIs
 */
export async function getHistoricalPrice(
  mint: string,
  timestamp: number
): Promise<number | null> {
  // TODO: Implement historical price fetching
  // Options:
  // 1. Birdeye historical data API
  // 2. Store price snapshots in database
  // 3. Query on-chain oracle (Pyth, Switchboard)

  console.warn('Historical price fetching not yet implemented')
  return null
}
