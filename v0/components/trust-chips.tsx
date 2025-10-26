"use client"

import { ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface TrustChipsProps {
  aiCommit: string
  proofHash?: string
  contractUrl: string
}

export function TrustChips({ aiCommit, proofHash, contractUrl }: TrustChipsProps) {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className="bg-[var(--color-panel)] border-[var(--color-neon-green)] text-[var(--color-neon-green)]"
        >
          AI Commit
        </Badge>
        <span className="font-mono text-[var(--color-text-muted)]">{aiCommit}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-neon-green)]"
          onClick={() => handleCopy(aiCommit, "AI Commit hash")}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <span className="text-[var(--color-text-muted)]">•</span>

      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className="bg-[var(--color-panel)] border-[var(--color-neon-purple)] text-[var(--color-neon-purple)]"
        >
          Proof
        </Badge>
        <span className="font-mono text-[var(--color-text-muted)]">{proofHash || "pending"}</span>
        {proofHash && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-neon-purple)]"
            onClick={() => handleCopy(proofHash, "Proof hash")}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>

      <span className="text-[var(--color-text-muted)]">•</span>

      <div className="flex items-center gap-1">
        <Badge
          variant="outline"
          className="bg-[var(--color-panel)] border-[var(--color-neon-aqua)] text-[var(--color-neon-aqua)]"
        >
          Contract
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-neon-aqua)]"
          onClick={() => window.open(contractUrl, "_blank")}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
