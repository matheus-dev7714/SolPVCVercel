/**
 * AI Prediction Line Calculation
 * Generates a smooth predicted price curve based on:
 * - Current price
 * - Community sentiment (over/under ratio)
 * - AI confidence
 */

interface PricePoint {
  t: number // Unix timestamp
  p: number // Price
}

/**
 * Calculate AI prediction line for the entire pool duration
 * 
 * @param startPrice - Pool starting price
 * @param currentPrice - Current real price
 * @param totalOver - Total lamports bet on Over
 * @param totalUnder - Total lamports bet on Under
 * @param aiConfidence - AI confidence score (0-1)
 * @param startTs - Pool start timestamp
 * @param endTs - Pool end timestamp
 * @param numPoints - Number of prediction points (default 24 for hourly)
 * @returns Array of predicted price points
 */
export function calculateAIPrediction(
  startPrice: number,
  currentPrice: number,
  totalOver: bigint,
  totalUnder: bigint,
  aiConfidence: number,
  startTs: number,
  endTs: number,
  numPoints: number = 24
): PricePoint[] {
  const total = Number(totalOver + totalUnder)
  
  // Handle edge case: no entries yet
  if (total === 0) {
    // Default to slight upward trend with low confidence
    return generateNeutralPrediction(startPrice, startTs, endTs, numPoints)
  }
  
  // Calculate community sentiment
  const overRatio = Number(totalOver) / total
  const underRatio = Number(totalUnder) / total
  const sentimentBias = overRatio - underRatio // -1 (bearish) to +1 (bullish)
  
  // AI's predicted price change based on sentiment and confidence
  // More confident AI = stronger prediction following sentiment
  // Max change: ±15% of current price
  const maxChangePercent = 0.15
  const predictedChangePercent = sentimentBias * aiConfidence * maxChangePercent
  const predictedEndPrice = currentPrice * (1 + predictedChangePercent)
  
  // Generate smooth curve from start to predicted end
  const points: PricePoint[] = []
  const duration = endTs - startTs
  const interval = duration / numPoints
  
  for (let i = 0; i <= numPoints; i++) {
    const t = startTs + (i * interval)
    const progress = i / numPoints // 0 to 1
    
    // Create smooth S-curve transition
    // Start at startPrice, curve towards predictedEndPrice
    const smoothProgress = smoothStep(progress)
    
    // Add some realistic volatility (small waves)
    const volatility = Math.sin(progress * Math.PI * 4) * 0.01 * currentPrice
    
    // Interpolate from start to predicted end with smooth curve
    const basePrice = startPrice + (predictedEndPrice - startPrice) * smoothProgress
    const p = basePrice + volatility
    
    points.push({ t: Math.floor(t), p })
  }
  
  return points
}

/**
 * Generate neutral prediction when no entries exist yet
 */
function generateNeutralPrediction(
  startPrice: number,
  startTs: number,
  endTs: number,
  numPoints: number
): PricePoint[] {
  const points: PricePoint[] = []
  const duration = endTs - startTs
  const interval = duration / numPoints
  
  // Slight upward trend (2-3%)
  const endPrice = startPrice * 1.025
  
  for (let i = 0; i <= numPoints; i++) {
    const t = startTs + (i * interval)
    const progress = i / numPoints
    
    // Smooth curve with minor volatility
    const volatility = Math.sin(progress * Math.PI * 3) * 0.005 * startPrice
    const basePrice = startPrice + (endPrice - startPrice) * progress
    const p = basePrice + volatility
    
    points.push({ t: Math.floor(t), p })
  }
  
  return points
}

/**
 * Smooth step function for natural curve
 * Uses smoothstep algorithm: 3t² - 2t³
 */
function smoothStep(t: number): number {
  const clampedT = Math.max(0, Math.min(1, t))
  return clampedT * clampedT * (3 - 2 * clampedT)
}

/**
 * Generate realistic historical price data with random walk
 * 
 * @param startPrice - Starting price
 * @param startTs - Start timestamp
 * @param endTs - End timestamp (full pool duration)
 * @param numPoints - Number of points
 * @returns Array of historical price points
 */
export function generateHistoricalPriceData(
  startPrice: number,
  startTs: number,
  endTs: number,
  numPoints: number = 8
): PricePoint[] {
  const points: PricePoint[] = []
  const duration = endTs - startTs
  const interval = duration / (numPoints - 1)
  const now = Math.floor(Date.now() / 1000)
  
  let currentPrice = startPrice
  
  for (let i = 0; i < numPoints; i++) {
    const t = startTs + (i * interval)
    const isHistorical = t <= now // Real data up to now
    
    if (isHistorical) {
      // Historical data: random walk with slight upward bias
      const randomChange = (Math.random() - 0.48) * 0.02 // -2% to +2% with slight upward bias
      currentPrice = currentPrice * (1 + randomChange)
    } else {
      // Future data: continue with more conservative movement
      const randomChange = (Math.random() - 0.5) * 0.01 // -1% to +1% more conservative
      currentPrice = currentPrice * (1 + randomChange)
    }
    
    points.push({ t: Math.floor(t), p: currentPrice })
  }
  
  return points
}

