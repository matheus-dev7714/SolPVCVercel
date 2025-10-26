# AI Price Chart System Documentation

## Overview

The AI Price Chart system visualizes prediction market data with two key components:
1. **Real Price Data** (solid blue line) - Historical and projected token prices
2. **AI Prediction Line** (dashed blue line) - AI's forecast for the entire pool duration
3. **NOW Marker** (yellow vertical line) - Current time indicator
4. **Entry Marker** (purple horizontal line) - User's entry price level

## Architecture

### Frontend Components

#### 1. PriceChart Component (`components/price-chart.tsx`)

**Purpose**: Renders the interactive price chart using Recharts library

**Key Props**:
```typescript
{
  data: ChartPoint[]           // Real price data points
  lineBps: number | null       // Legacy AI line basis points
  aiLineHistory?: Array<{t: number, line_bps: number}>  // Legacy AI history
  poolType?: 'PvMarket' | 'PvAI'  // Pool type for conditional rendering
  poolId?: number              // Pool ID for entry tracking
  aiPrediction?: ChartPoint[]  // NEW: AI prediction data points
}
```

**Data Structure**:
```typescript
interface ChartPoint {
  t: number  // Unix timestamp
  p: number  // Price value
}
```

**Chart Data Merging Logic**:
```typescript
const chartData = useMemo(() => {
  if (aiPrediction && aiPrediction.length > 0) {
    // Merge real price data and AI prediction by timestamp
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
        price: pricePoint?.p || null,
        aiPrediction: aiPoint?.p || null,
        timestamp: t,
      }
    })
  }
  // Fallback to legacy data structure
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
```

**Line Rendering**:
```typescript
{/* Real Price Line (Solid) */}
<Line
  type="monotone"
  dataKey="price"
  stroke="#00D4FF"
  strokeWidth={3}
  dot={false}
  activeDot={{ r: 5, fill: "#00D4FF" }}
  name="Price"
  connectNulls={true}  // Critical: prevents line gaps
/>

{/* AI Prediction Line (Dashed) */}
{aiPrediction && aiPrediction.length > 0 && (
  <Line
    type="monotone"
    dataKey="aiPrediction"
    stroke="#00D4FF"
    strokeWidth={2}
    strokeDasharray="5 5"  // Dashed pattern
    dot={false}
    name="AI Prediction"
    connectNulls={true}  // Critical: prevents line gaps
  />
)}
```

**NOW Marker Logic**:
```typescript
{/* Current Time vertical marker (NOW) */}
{aiPrediction && aiPrediction.length > 0 && (() => {
  const now = Date.now() / 1000
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
  
  return (
    <ReferenceLine
      x={closestPoint.time}
      stroke="#FFD700"
      strokeWidth={2}
      strokeDasharray="5 5"
      label={{
        value: 'NOW',
        fill: '#FFD700',
        fontSize: 12,
        fontFamily: 'JetBrains Mono',
        fontWeight: 'bold',
        position: 'top',
      }}
    />
  )
})()}
```

#### 2. VS AI Pool Page (`app/vsai/pool/[id]/page.tsx`)

**Purpose**: Client-side page component that fetches and displays VS AI pool data

**Key Features**:
- Client-side rendering to avoid server-client time mismatches
- Fetches pool data via API call
- Passes `aiPrediction` data to PriceChart component

**Data Flow**:
```typescript
const [pool, setPool] = useState<PoolDetail | null>(null)

useEffect(() => {
  const fetchPool = async () => {
    try {
      const response = await fetch(`/api/vsai/pool/${params.id}`)
      const data = await response.json()
      setPool(data)
    } catch (error) {
      console.error('Failed to fetch pool:', error)
    }
  }
  fetchPool()
}, [params.id])

// Pass aiPrediction to chart
<PriceChart 
  data={pool.chart} 
  lineBps={pool.line_bps} 
  aiLineHistory={pool.ai_line_history} 
  poolType={pool.pool_type} 
  poolId={pool.id} 
  aiPrediction={pool.ai_prediction}  // NEW: AI prediction data
/>
```

### Backend API System

#### 1. VS AI Pool API (`app/api/vsai/pool/[id]/route.ts`)

**Purpose**: Generates comprehensive pool data including both real price history and AI predictions

**Development Mode Logic**:
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const poolId = parseInt(params.id)
  const now = Math.floor(Date.now() / 1000)

  // Development mode: Use synthetic data
  if (process.env.NODE_ENV === 'development') {
    switch (poolId) {
      case 1: {
        // BONK Pool - 12 hour duration example
        const poolDuration = 12 * 3600 // 12 hours
        const startTs = now - 4 * 3600 // Started 4 hours ago
        const endTs = startTs + poolDuration // Ends in 8 hours (at 6 AM if pool started at 6 PM)
        const startPrice = 0.000021
        const currentPrice = 0.0000220 // Current price after 4 hours
        
        // Generate real historical price data that spans the full pool duration
        const historicalData = generateHistoricalPriceData(startPrice, startTs, endTs, 48)
        
        // Generate AI prediction for entire 12-hour period
        const aiPrediction = calculateAIPrediction(
          startPrice,
          currentPrice,
          34_000_000_000n, // totalOver
          29_000_000_000n, // totalUnder
          0.61, // AI confidence
          startTs,
          endTs,
          48 // 48 points for smooth curve (every 15 minutes)
        )
        
        return NextResponse.json({
          id: 1,
          token: "BONK",
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          pool_type: "PvAI",
          status: "OPEN",
          start_ts: startTs,
          end_ts: endTs,
          lock_ts: now + 4 * 3600, // Locks in 4 hours
          line_bps: 145, // 1.45%
          totals: { over: 34_000_000_000, under: 29_000_000_000 },
          chart: historicalData, // Real price history
          ai_prediction: aiPrediction, // AI's predicted price curve
          ai: {
            model: "GPT-4",
            confidence: 0.61,
            commit: "abc123def456"
          }
        })
      }
      // ... other pools
    }
  }
  
  // Production mode: Use database
  const pool = await getPoolById(poolId)
  return NextResponse.json(pool)
}
```

#### 2. AI Prediction Utility (`lib/ai-prediction.ts`)

**Purpose**: Calculates AI prediction curves and generates historical price data

##### `calculateAIPrediction()` Function

**Purpose**: Generates smooth AI prediction curves based on community sentiment and AI confidence

**Parameters**:
```typescript
function calculateAIPrediction(
  startPrice: number,     // Pool starting price
  currentPrice: number,   // Current real price
  totalOver: bigint,      // Total lamports bet on Over
  totalUnder: bigint,     // Total lamports bet on Under
  aiConfidence: number,   // AI confidence score (0-1)
  startTs: number,        // Pool start timestamp
  endTs: number,          // Pool end timestamp
  numPoints: number = 24  // Number of prediction points
): PricePoint[]
```

**Algorithm**:
1. **Calculate Community Sentiment**:
   ```typescript
   const total = Number(totalOver + totalUnder)
   const overRatio = Number(totalOver) / total
   const underRatio = Number(totalUnder) / total
   const sentimentBias = overRatio - underRatio // -1 (bearish) to +1 (bullish)
   ```

2. **Predict Price Change**:
   ```typescript
   const maxChangePercent = 0.15
   const predictedChangePercent = sentimentBias * aiConfidence * maxChangePercent
   const predictedEndPrice = currentPrice * (1 + predictedChangePercent)
   ```

3. **Generate Smooth Curve**:
   ```typescript
   for (let i = 0; i <= numPoints; i++) {
     const t = startTs + (i * interval)
     const progress = i / numPoints // 0 to 1
     
     // Create smooth S-curve transition
     const smoothProgress = smoothStep(progress)
     
     // Add realistic volatility (small waves)
     const volatility = Math.sin(progress * Math.PI * 4) * 0.01 * currentPrice
     
     // Interpolate from start to predicted end with smooth curve
     const basePrice = startPrice + (predictedEndPrice - startPrice) * smoothProgress
     const p = basePrice + volatility
     
     points.push({ t: Math.floor(t), p })
   }
   ```

##### `generateHistoricalPriceData()` Function

**Purpose**: Generates realistic price movement data spanning the full pool duration

**Parameters**:
```typescript
function generateHistoricalPriceData(
  startPrice: number,     // Starting price
  startTs: number,        // Start timestamp
  endTs: number,          // End timestamp (full pool duration)
  numPoints: number = 8   // Number of points
): PricePoint[]
```

**Algorithm**:
```typescript
const now = Math.floor(Date.now() / 1000)

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
```

#### 3. TypeScript Types (`types/pve.ts`)

**Updated PoolDetail Interface**:
```typescript
export interface PoolDetail {
  id: number
  token: string
  mint: string
  pool_type: 'PvAI' | 'PvMarket'
  status: 'OPEN' | 'LOCKED' | 'CLOSED'
  start_ts: number
  end_ts: number
  lock_ts: number
  line_bps: number
  totals: { over: bigint; under: bigint }
  chart: ChartPoint[]
  ai_line_history?: Array<{ t: number; line_bps: number }>
  ai_prediction?: ChartPoint[]  // NEW: AI prediction data
  ai?: AIChipData | null        // Made nullable for PvMarket pools
}

export interface ChartPoint {
  t: number  // Unix timestamp
  p: number  // Price value
}
```

## Data Flow Architecture

### 1. Initial Page Load
```
User visits /vsai/pool/1
    ↓
VS AI Pool Page (client-side)
    ↓
API Call: GET /api/vsai/pool/1
    ↓
VS AI Pool API Route
    ↓
Generate Historical Data (48 points)
    ↓
Generate AI Prediction (48 points)
    ↓
Return Combined Pool Data
    ↓
PriceChart Component
    ↓
Merge Data by Timestamp
    ↓
Render Chart with 4 Lines:
    - Solid Blue: Real Price
    - Dashed Blue: AI Prediction  
    - Yellow Vertical: NOW Marker
    - Purple Horizontal: Entry Marker
```

### 2. Data Synchronization
- **Historical Data**: Spans full pool duration (start → end)
- **AI Prediction**: Spans full pool duration (start → end)
- **NOW Marker**: Dynamically positioned at closest data point to current time
- **Entry Marker**: User's entry price level (y=n)

### 3. Key Technical Decisions

#### Why Both Lines Span Full Duration
- **Problem**: Original implementation had historical data only up to "now", causing line gaps
- **Solution**: Both datasets span full pool duration for seamless visualization
- **Result**: Continuous lines with `connectNulls={true}` prevents gaps

#### Why Client-Side Rendering
- **Problem**: Server-client time mismatches caused incorrect pool status
- **Solution**: Client-side data fetching ensures consistent time calculations
- **Result**: Reliable "NOW" marker positioning and pool status

#### Why 48 Data Points
- **Reason**: Provides smooth curves with 15-minute intervals
- **Benefit**: High resolution for both historical and prediction data
- **Trade-off**: Slightly larger payload but better visual quality

## Development Guidelines

### Adding New Pool Types

1. **Update API Route**: Add new case in `app/api/vsai/pool/[id]/route.ts`
2. **Configure Timing**: Set appropriate `startTs`, `endTs`, `lock_ts`
3. **Generate Data**: Use `generateHistoricalPriceData()` and `calculateAIPrediction()`
4. **Test Chart**: Verify both lines span full duration

### Modifying AI Prediction Algorithm

1. **Edit `lib/ai-prediction.ts`**: Modify `calculateAIPrediction()` logic
2. **Adjust Parameters**: Update sentiment calculation, confidence weighting
3. **Test Curves**: Verify smooth transitions and realistic volatility
4. **Update Documentation**: Document algorithm changes

### Debugging Chart Issues

**Common Problems**:
1. **Invisible Lines**: Check `connectNulls={true}` and data span
2. **Missing NOW Marker**: Verify timestamp matching logic
3. **Gaps in Data**: Ensure both datasets use same timeline
4. **Performance Issues**: Reduce `numPoints` if needed

**Debug Commands**:
```bash
# Test API response
curl http://localhost:3000/api/vsai/pool/1 | jq '{chart_points: (.chart | length), ai_pred_points: (.ai_prediction | length)}'

# Check data structure
curl http://localhost:3000/api/vsai/pool/1 | jq '.chart[0:3]'
curl http://localhost:3000/api/vsai/pool/1 | jq '.ai_prediction[0:3]'
```

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live price feeds
2. **Interactive Markers**: Clickable entry points with details
3. **Zoom/Pan**: Enhanced chart navigation
4. **Multiple Timeframes**: 1h, 4h, 12h, 24h views
5. **AI Confidence Visualization**: Color-coded prediction certainty

### Performance Optimizations
1. **Data Caching**: Redis cache for frequently accessed pools
2. **Lazy Loading**: Load chart data on demand
3. **Compression**: Gzip API responses
4. **CDN**: Static asset optimization

### Integration Points
1. **Oracle Service**: Real price feed integration
2. **Transaction Service**: Entry confirmation handling
3. **Notification Service**: Price alert system
4. **Analytics Service**: Chart interaction tracking

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team

