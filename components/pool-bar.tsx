"use client"

import { pctSplit } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export function PoolBar({
  overLamports,
  underLamports,
}: {
  overLamports: number
  underLamports: number
}) {
  const { overPct, underPct } = pctSplit(overLamports, underLamports)
  const isSkewed = overPct > 80 || underPct > 80

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Pool Distribution</h3>
        {isSkewed && (
          <Badge variant="outline" className="text-xs">
            Skewed
          </Badge>
        )}
        {!isSkewed && (
          <Badge variant="secondary" className="text-xs">
            Balanced
          </Badge>
        )}
      </div>

      <div className="flex h-8 rounded-md overflow-hidden border border-border/50">
        <div
          className="bg-aqua/20 border-r-2 border-aqua flex items-center justify-center text-xs font-semibold text-aqua"
          style={{ width: `${overPct}%` }}
        >
          {overPct > 15 && `${overPct}%`}
        </div>
        <div
          className="bg-neon-purple/20 border-l-2 border-neon-purple flex items-center justify-center text-xs font-semibold text-neon-purple"
          style={{ width: `${underPct}%` }}
        >
          {underPct > 15 && `${underPct}%`}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-aqua font-semibold">Over Pool</span>
        <span className="text-neon-purple font-semibold">Under Pool</span>
      </div>
    </div>
  )
}
