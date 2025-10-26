export const LAMPORTS_PER_SOL = 1_000_000_000

export function lamportsToSol(l: number, digits = 2) {
  return (l / LAMPORTS_PER_SOL).toFixed(digits)
}

export function bpsToPct(bps: number, digits = 2) {
  return (bps / 100).toFixed(digits) + "%"
}

export function pctSplit(overLamports: number, underLamports: number) {
  const total = overLamports + underLamports
  if (total === 0) return { overPct: 0, underPct: 0 }
  return {
    overPct: Math.round((overLamports / total) * 100),
    underPct: Math.round((underLamports / total) * 100),
  }
}

export function estimatePayoutWin(userNetLamports: number, totalWinner: number, totalOver: number, totalUnder: number) {
  const totalPool = totalOver + totalUnder
  if (totalWinner === 0) return 0
  return Math.floor((userNetLamports * totalPool) / totalWinner)
}
