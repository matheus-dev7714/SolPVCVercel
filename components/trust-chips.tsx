"use client"

import type { AIChipData, ProofData } from "@/types/pve"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function TrustChips({
  ai,
  proof,
  contractUrl,
}: {
  ai: AIChipData
  proof: ProofData
  contractUrl?: string | null
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyCommit = () => {
    navigator.clipboard.writeText(ai.commit)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied",
      description: "AI commit hash copied to clipboard",
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card/50 rounded-xl border border-border/50">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trust:</span>

      <button
        onClick={copyCommit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
      >
        <span className="text-xs font-mono text-foreground">
          {ai.commit.slice(0, 6)}...{ai.commit.slice(-4)}
        </span>
        <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {ai.payload_url && (
        <a
          href={ai.payload_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs text-aqua hover:text-aqua/80"
        >
          View Payload <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
        <span className="text-xs text-muted-foreground">Proof:</span>
        {proof.hash ? (
          <span className="text-xs font-mono text-foreground">{proof.hash.slice(0, 8)}...</span>
        ) : (
          <Badge variant="outline" className="text-xs bg-yellow/10 text-yellow border-yellow/20">
            Pending
          </Badge>
        )}
      </div>

      {contractUrl && (
        <a
          href={contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs text-aqua hover:text-aqua/80"
        >
          Solscan <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
