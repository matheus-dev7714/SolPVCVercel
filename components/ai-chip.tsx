"use client"

import type { AIChipData } from "@/types/pve"
import { bpsToPct } from "@/lib/format"

export function AIChip({
  lineBps,
  ai,
}: {
  lineBps: number
  ai: AIChipData
}) {
  return (
    <div className="text-sm">
      <span className="text-muted-foreground">AI Line: </span>
      <span className="font-bold font-mono text-aqua">{bpsToPct(lineBps)}</span>
      <span className="text-muted-foreground"> • Confidence: </span>
      <span className="font-bold font-mono">{(ai.confidence * 100).toFixed(0)}%</span>
      <span className="text-muted-foreground"> • Model </span>
      <span className="font-mono text-xs">{ai.model_version}</span>
    </div>
  )
}
