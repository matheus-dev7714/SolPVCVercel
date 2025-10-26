"use client"

import type React from "react"

import type { PoolListItem } from "@/types/pve"
import { lamportsToSol, bpsToPct, pctSplit } from "@/lib/format"
import { isPoolOpenForEntry, getEffectiveStatus } from "@/lib/pool-utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"
import Link from "next/link"
import { Timer } from "./timer"
import { useState } from "react"

export function PoolCard({ pool }: { pool: PoolListItem }) {
  const { overPct, underPct } = pctSplit(pool.totals.over, pool.totals.under)
  const totalSol = lamportsToSol(pool.totals.over + pool.totals.under)
  const [copied, setCopied] = useState(false)
  
  const isOpen = isPoolOpenForEntry(pool.status, pool.lock_ts)
  const effectiveStatus = getEffectiveStatus(pool.status, pool.lock_ts, pool.end_ts)

  // Determine the correct route based on pool type
  const poolRoute = pool.pool_type === 'PvAI' ? `/vsai/pool/${pool.id}` : `/vsmarket/pool/${pool.id}`

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(pool.ai.commit)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Link href={poolRoute}>
      <Card className="p-6 bg-card border-[#1F2A44] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:ring-2 hover:ring-aqua/50 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple/20 to-aqua/20 flex items-center justify-center font-mono text-sm font-bold border border-border">
              {pool.token.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">{pool.token}</h3>
            </div>
          </div>
          <Badge
            variant={isOpen ? "default" : effectiveStatus === "LOCKED" ? "secondary" : "outline"}
            className={
              isOpen
                ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                : effectiveStatus === "LOCKED"
                  ? "bg-yellow/10 text-yellow border-yellow/20"
                  : "bg-muted/10 text-muted-foreground border-muted/20"
            }
          >
            {effectiveStatus}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          {pool.pool_type === 'PvAI' ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI Line</span>
                <span className="font-bold font-mono text-aqua">{bpsToPct(pool.line_bps)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-bold font-mono">{(pool.confidence * 100).toFixed(0)}%</span>
              </div>

              <div className="text-xs text-muted-foreground">Model {pool.ai?.model || 'N/A'}</div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-bold font-mono text-neon-green">VS Market</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pool Size</span>
                <span className="font-bold font-mono">{totalSol} SOL</span>
              </div>
            </>
          )}
        </div>

        <div className="mb-4">
          <div className="flex h-8 rounded-md overflow-hidden mb-2 border border-border/50">
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
            <span className="font-mono text-muted-foreground">{totalSol} SOL</span>
            <span className="text-neon-purple font-semibold">Under Pool</span>
          </div>
        </div>

        {pool.pool_type === 'PvAI' && pool.ai?.commit && (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group/copy"
            >
              <span className="truncate max-w-[120px]">
                {pool.ai.commit.slice(0, 6)}...{pool.ai.commit.slice(-4)}
              </span>
              <Copy className="h-3 w-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
            </button>
            {copied && <span className="text-xs text-neon-green">Copied!</span>}
          </div>
        )}

        <Timer lockTs={pool.lock_ts} endTs={pool.end_ts} status={effectiveStatus} />
      </Card>
    </Link>
  )
}
