"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ClaimPanelProps {
  eligible: boolean
  estPayout: number
  onClaim: () => void
  proofUrl?: string
}

export function ClaimPanel({ eligible, estPayout, onClaim, proofUrl }: ClaimPanelProps) {
  if (!eligible) {
    return (
      <div className="text-center p-6 bg-[var(--color-panel)] rounded-lg border border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)]">No winnings to claim</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6 bg-[var(--color-panel)] rounded-lg border border-[var(--color-neon-green)]/30">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[var(--color-neon-green)] mb-2">Congratulations! 🎉</h3>
        <p className="text-2xl font-mono text-[var(--color-neon-green)]">{estPayout.toFixed(4)} SOL</p>
      </div>

      <Button
        onClick={onClaim}
        className="w-full bg-[var(--color-neon-green)] text-[var(--color-background)] neon-glow-hover"
      >
        Claim {estPayout.toFixed(2)} SOL
      </Button>

      {proofUrl && (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[var(--color-neon-aqua)] text-[var(--color-neon-aqua)] hover:bg-[var(--color-neon-aqua)]/10 bg-transparent"
          onClick={() => window.open(proofUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Proof
        </Button>
      )}
    </div>
  )
}
