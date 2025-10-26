import type { ChartPoint } from "@/types/pve"
import { bpsToPct } from "@/lib/format"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts"
import { useEffect, useMemo, useState } from "react"

/**
 * Generate mock price data for visualization
 * Creates realistic price movements over 24 hours
 */
function generateMockPriceData(lineBps: number, dataPoints = 48): ChartPoint[] {
  const now = Math.floor(Date.now() / 1000)
  const startTime = now - 24 * 60 * 60 // 24 hours ago
  const interval = (24 * 60 * 60) / dataPoints

  // Base price (simulating a token price)
  const basePrice = 0.00123456
  const data: ChartPoint[] = []

  // Create a random walk with trend
  let currentPrice = basePrice
  const targetChange = lineBps / 10000 // Target percentage change
  const trendPerPoint = (basePrice * targetChange) / dataPoints

  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startTime + i * interval

    // Add some random volatility (-0.5% to +0.5%)
    const volatility = (Math.random() - 0.5) * 0.01 * currentPrice

    // Add the trend component
    currentPrice = currentPrice + trendPerPoint + volatility

    // Ensure price doesn't go negative
    currentPrice = Math.max(currentPrice, basePrice * 0.5)

    data.push({
      t: timestamp,
      p: currentPrice,
    })
  }

  return data
}

export function PriceChart({
  data,
  lineBps,
  aiLineHistory,
  poolType,
  poolId,
  aiPrediction,
}: {
  data: ChartPoint[]
  lineBps: number | null
  aiLineHistory?: { t: number; line_bps: number }[]
  poolType?: 'PvMarket' | 'PvAI'
  poolId?: number
  aiPrediction?: ChartPoint[] // AI's predicted price curve
}) {
  // Use real data if available, otherwise generate mock data
  const priceData = useMemo(() => {
    if (data && data.length >= 2) {
      return data
    }
    // Generate mock data for visualization
    return generateMockPriceData(lineBps)
  }, [data, lineBps])

  // Local state for dynamic AI line (updates on interval and entry events)
  const [aiHistoryState, setAiHistoryState] = useState(aiLineHistory)
  const [lineBpsState, setLineBpsState] = useState(lineBps)

  // Entry marker state - initialize as null (no entry until user actually enters)
  const [entryY, setEntryY] = useState<number | null>(null)
  const [entrySide, setEntrySide] = useState<'Over' | 'Under' | null>(null)

  // Helper to load entry marker from localStorage
  const loadEntryFromStorage = () => {
    if (!poolId || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(`solpve:entry:${poolId}`)
      if (!raw) {
        setEntryY(null) // Clear entry if no data
        setEntrySide(null)
        return
      }
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.priceAtEntry === 'number') {
        setEntryY(parsed.priceAtEntry)
        setEntrySide(parsed.side === 'Over' || parsed.side === 'Under' ? parsed.side : null)
      } else {
        setEntryY(null) // Clear entry if invalid data
        setEntrySide(null)
      }
    } catch {
      setEntryY(null) // Clear entry on parse error
      setEntrySide(null)
    }
  }

  // Feature flag: allow disabling AI refresh via env
  const disableAiRefresh = process.env.NEXT_PUBLIC_DISABLE_AI_REFRESH === '1'

  // Set up 30-minute refresh and entry event listeners
  useEffect(() => {
    if (poolType !== 'PvAI' || !poolId || disableAiRefresh) {
      // Still try to load entry marker even for PvMarket
      loadEntryFromStorage()
      return
    }

    let active = true

    const refreshPool = async () => {
      try {
        const res = await fetch(`/api/pool/${poolId}`, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        if (!active) return
        if (json?.ai_line_history) setAiHistoryState(json.ai_line_history)
        if (typeof json?.line_bps === 'number') setLineBpsState(json.line_bps)
      } catch (_) {
        // ignore fetch errors in UI
      }
    }

    // Initial load
    refreshPool()
    loadEntryFromStorage()

    // 30-minute cadence
    const interval = window.setInterval(refreshPool, 30 * 60 * 1000)

    // Listen for entry placed events to refresh immediately
    const onEntry = (e: Event) => {
      const detail = (e as CustomEvent).detail as { poolId?: number }
      if (detail?.poolId === poolId) {
        loadEntryFromStorage()
        refreshPool()
      }
    }
    window.addEventListener('solpve:entry-placed', onEntry as EventListener)

    // Also respond to storage changes (multi-tab)
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === `solpve:entry:${poolId}`) loadEntryFromStorage()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('solpve:entry-placed', onEntry as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [poolId, poolType, disableAiRefresh])

  // Calculate the AI line price
  const startPrice = priceData[0]?.p || 0
  const computeLinePriceAt = (t: number) => {
    const history = aiHistoryState
    if (poolType === 'PvAI' && history && history.length > 0) {
      // find latest history <= t
      let bps = lineBpsState
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].t <= t) {
          bps = history[i].line_bps
          break
        }
      }
      return startPrice * (1 + bps / 10000)
    }
    return startPrice * (1 + lineBpsState / 10000)
  }
  const linePrice = computeLinePriceAt(priceData[priceData.length - 1]?.t || 0)
  const currentPrice = priceData[priceData.length - 1]?.p || 0

  // Combine real price data and AI prediction data for chart
  const chartData = useMemo(() => {
    // If we have AI prediction data, merge it with price data by timestamp
    if (aiPrediction && aiPrediction.length > 0) {
      const allTimestamps = new Set([
        ...priceData.map(p => p.t),
        ...aiPrediction.map(p => p.t)
      ])
      
      return Array.from(allTimestamps).sort((a, b) => a - b).map(t => {
        const pricePoint = priceData.find(p => p.t === t)
        const aiPoint = aiPrediction.find(p => p.t === t)
        
        return {
          time: new Date(t * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: pricePoint?.p || null, // null if no real data at this time
          aiPrediction: aiPoint?.p || null, // null if no AI prediction at this time
          timestamp: t,
        }
      })
    }
    
    // Fallback to old behavior for backward compatibility
    return priceData.map((point) => ({
      time: new Date(point.t * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: point.p,
      aiLine: lineBps ? computeLinePriceAt(point.t) : null,
      timestamp: point.t,
    }))
  }, [priceData, aiPrediction, lineBps])

  // Calculate if price is currently over or under the line
  const isOverLine = currentPrice > linePrice
  const priceDiff = ((currentPrice - linePrice) / linePrice) * 100

  return (
    <div className="w-full h-[300px]">
      {data.length === 0 && (
        <div className="mb-2 text-xs text-muted-foreground italic">
          Using simulated data for visualization
        </div>
      )}
      <div className="mb-2 flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Current: </span>
          <span className="font-mono font-bold text-neon-green">
            ${currentPrice.toFixed(8)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">AI Line: </span>
          <span className="font-mono font-bold text-aqua">
            ${linePrice.toFixed(8)}
          </span>
        </div>
        <div>
          <span className={`font-mono font-bold ${isOverLine ? 'text-neon-green' : 'text-rose-400'}`}>
            {isOverLine ? '↗' : '↘'} {Math.abs(priceDiff).toFixed(2)}%
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" opacity={0.3} />
          <XAxis
            dataKey="time"
            stroke="#9FB0C9"
            style={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
            tick={{ fill: '#9FB0C9' }}
          />
          <YAxis
            stroke="#9FB0C9"
            style={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
            tickFormatter={(value) => value.toFixed(8)}
            domain={['auto', 'auto']}
            tick={{ fill: '#9FB0C9' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              border: "1px solid #1F2A44",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
            }}
            labelStyle={{ color: "#E6F0FF" }}
            formatter={(value: any, name: string) => {
              if (name === 'price') {
                return [`$${Number(value).toFixed(8)}`, 'Price']
              }
              if (name === 'aiLine') {
                return [`$${Number(value).toFixed(8)}`, 'AI Target']
              }
              return [value, name]
            }}
          />
          {/* AI Line as a reference (for PvMarket show static ref line) */}
          {poolType !== 'PvAI' && (
            <ReferenceLine
              y={linePrice}
              stroke="#00D4FF"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `AI Target ${bpsToPct(lineBpsState)}`,
                fill: "#00D4FF",
                fontSize: 12,
                fontFamily: "JetBrains Mono",
                fontWeight: "bold",
                position: "right",
              }}
            />
          )}
          {/* Current Time vertical marker (NOW) - Always show for debugging */}
          {chartData.length > 0 && (() => {
            const now = Date.now() / 1000
            const currentTimeString = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            
            // Find the closest data point to current time
            let closestPoint = chartData[0]
            let minDiff = Math.abs(chartData[0].timestamp - now)
            
            for (const point of chartData) {
              const diff = Math.abs(point.timestamp - now)
              if (diff < minDiff) {
                minDiff = diff
                closestPoint = point
              }
            }
            
            // Debug: Log the NOW line positioning (commented out for production)
            // console.log('NOW Line Debug:', {
            //   currentTime: currentTimeString,
            //   closestPointTime: closestPoint.time,
            //   timeDiff: Math.abs(closestPoint.timestamp - now),
            //   chartDataLength: chartData.length,
            //   aiPredictionLength: aiPrediction?.length || 0
            // })
            
            // Use the closest point's time, or fallback to middle of chart
            const nowLineTime = closestPoint ? closestPoint.time : chartData[Math.floor(chartData.length / 2)].time
            
            return (
              <ReferenceLine
                x={nowLineTime}
                stroke="#FFD700"
                strokeWidth={3}
                strokeDasharray="5 5"
                label={{
                  value: 'NOW',
                  fill: '#FFD700',
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold',
                  position: 'top',
                }}
              />
            )
          })()}
          {/* Entry Area Highlighting */}
          {entryY != null && entrySide && (
            <ReferenceArea
              y1={entrySide === 'Over' ? entryY : undefined}
              y2={entrySide === 'Under' ? entryY : undefined}
              fill={entrySide === 'Over' ? '#00D4FF' : '#8B5CF6'}
              fillOpacity={0.1}
              stroke="none"
            />
          )}
          {/* Entry Placed horizontal marker */}
          {entryY != null && (
            <ReferenceLine
              y={entryY}
              stroke={entrySide === 'Over' ? '#00D4FF' : '#8B5CF6'}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: 'Entry Placed',
                fill: entrySide === 'Over' ? '#00D4FF' : '#8B5CF6',
                fontSize: 12,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'bold',
                position: 'right',
              }}
            />
          )}
          {/* Real Price Line (Solid) */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00D4FF"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: "#00D4FF" }}
            name="Price"
            connectNulls={true}
          />
          {/* AI Prediction Line (Dashed) */}
          {aiPrediction && aiPrediction.length > 0 && (
            <Line
              type="monotone"
              dataKey="aiPrediction"
              stroke="#00D4FF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="AI Prediction"
              connectNulls={true}
            />
          )}
          {/* Legacy AI Line for backward compatibility */}
          {!aiPrediction && lineBps != null && (
            <Line
              type="monotone"
              dataKey="aiLine"
              stroke="#00D4FF"
              strokeWidth={poolType === 'PvAI' ? 2 : 0}
              dot={false}
              name="AI Target"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
