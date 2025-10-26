"use client"

import { Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface AIChipProps {
  lineBps: number
  confidence: number
  modelVersion: string
  commitHash: string
  payloadUrl?: string
}

export function AIChip({ lineBps, confidence, modelVersion, commitHash, payloadUrl }: AIChipProps) {
  const handleCopyHash = () => {
    navigator.clipboard.writeText(commitHash)
    toast({
      title: "Copied to clipboard",
      description: "AI commit hash copied successfully",
    })
  }

  const handleViewPayload = () => {
    if (payloadUrl) {
      window.open(payloadUrl, "_blank")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-white">
          AI Line: <span className="text-[#00FFA3] font-mono font-bold text-base">+{(lineBps / 100).toFixed(1)}%</span>
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-white">
          Confidence: <span className="text-[#00D4FF] font-semibold">{confidence}%</span>
        </span>
        <span className="text-gray-400">•</span>
        <span className="text-white">
          Model <span className="text-[#9945FF] font-mono">{modelVersion}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-[#101826]/50 border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/10 cursor-pointer transition-all duration-200 font-mono text-xs"
          onClick={handleCopyHash}
        >
          AI Commit: {commitHash}
          <Copy className="h-3 w-3 ml-1" />
        </Badge>
        {payloadUrl && (
          <Badge
            variant="outline"
            className="bg-[#101826]/50 border-[#9945FF]/30 text-[#9945FF] hover:bg-[#9945FF]/10 cursor-pointer transition-all duration-200"
            onClick={handleViewPayload}
          >
            View Payload
          </Badge>
        )}
      </div>
    </div>
  )
}
