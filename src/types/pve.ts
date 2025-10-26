export type Side = "Over" | "Under"
export type Status = "OPEN" | "LOCKED" | "RESOLVED" | "VOID"

export interface Totals {
  over: number // lamports
  under: number // lamports
}

export interface AIChipData {
  confidence: number // 0..1
  model: string // e.g., "pve-v0.3.0"
  commit: string // hex sha256, e.g., "0xA1B...7C"
  payload_url?: string | null
}

export interface PoolListItem {
  id: number
  token: string // "BONK"
  mint: string // mint address
  logo?: string | null // token logo URL (optional)
  line_bps: number // e.g., 300 => +3.00%
  confidence: number // duplicate for card speed
  lock_ts: number // unix seconds
  end_ts: number // unix seconds
  totals: Totals
  status: Status
  pool_type?: 'PvMarket' | 'PvAI'
  ai: AIChipData // Added ai property to match PoolCard usage
}

export interface ChartPoint {
  t: number // unix seconds
  p: number // price (number)
}

export interface ProofData {
  hash: string | null // hex sha256 or null when pending
  url: string | null // link to JSON (S3/IPFS) or null
}

export interface PoolDetail {
  id: number
  token: string
  mint: string
  logo?: string | null
  start_ts: number
  lock_ts: number
  end_ts: number
  line_bps: number
  pool_type?: 'PvMarket' | 'PvAI'
  ai: AIChipData | null
  totals: Totals
  status: Status
  winner: Side | "Void" | null
  proof: ProofData
  chart: ChartPoint[] // Real historical price data
  ai_prediction?: ChartPoint[] // AI's predicted price curve (VS AI pools only)
  ai_line_history?: { t: number; line_bps: number; source?: string; note?: string | null }[]
  contract_url?: string | null // Solscan link placeholder
}
