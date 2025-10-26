"use client"

import type { PoolDetail } from "@/types/pve"
import { AIChip } from "@/components/ai-chip"
import { Timer } from "@/components/timer"
import { PriceChart } from "@/components/price-chart"
import { PoolBar } from "@/components/pool-bar"
import { EntryForm } from "@/components/entry-form"
import { ClaimPanel } from "@/components/claim-panel"
import { TrustChips } from "@/components/trust-chips"
import { lamportsToSol } from "@/lib/format"
import { isPoolOpenForEntry, getLockReason, getEffectiveStatus } from "@/lib/pool-utils"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { WalletDisplay } from "@/components/wallet-display"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function VSAIPoolDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [pool, setPool] = useState<PoolDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPool() {
      try {
        const response = await fetch(`/api/vsai/pool/${id}`, { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          setPool(data)
        }
      } catch (error) {
        console.error("Failed to fetch pool:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPool()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading VS AI pool...</div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Pool not found</div>
      </div>
    )
  }

  const totalSol = lamportsToSol(pool.totals.over + pool.totals.under)
  const isOpen = isPoolOpenForEntry(pool.status, pool.lock_ts)
  const effectiveStatus = getEffectiveStatus(pool.status, pool.lock_ts, pool.end_ts)
  const lockReason = getLockReason(pool.status, pool.lock_ts)

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-semibold">solPVE</span>
            </Link>
            <WalletDisplay />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 p-6 bg-card rounded-2xl border-2 border-transparent bg-gradient-to-br from-aqua/20 via-transparent to-neon-purple/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple/30 to-aqua/30 flex items-center justify-center font-mono text-xl font-bold border-2 border-border">
                {pool.token.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {pool.token} <span className="text-muted-foreground text-xl">VS AI</span>
                </h1>
                <p className="text-sm text-aqua font-semibold mt-1">
                  O/DU Price +{(pool.line_bps / 100).toFixed(1)}% (AI Set)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-yellow font-semibold">Time Remaining:</p>
              <Timer lockTs={pool.lock_ts} endTs={pool.end_ts} status={effectiveStatus} hideLabel />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-4">
            <AIChip lineBps={pool.line_bps} ai={pool.ai} />
            <div className="text-sm">
              <span className="text-muted-foreground">Pool Size: </span>
              <span className="font-bold font-mono">{totalSol} SOL</span>
            </div>
          </div>

          
        </div>

        {/* Locked Banner */}
        {lockReason && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <p className="text-sm text-yellow-500">
              {lockReason}
            </p>
          </div>
        )}

        {/* Winner Banner */}
        {pool.status === "RESOLVED" && pool.winner && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/50 rounded-lg">
            <p className="text-sm">
              Winner: <span className="font-semibold text-primary">{pool.winner}</span>
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <h2 className="text-lg font-bold tracking-tight mb-4">Price vs AI Line</h2>
              <PriceChart data={pool.chart} lineBps={pool.line_bps} aiLineHistory={pool.ai_line_history} poolType={pool.pool_type} poolId={pool.id} aiPrediction={pool.ai_prediction} />
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <h2 className="text-lg font-bold tracking-tight mb-4">Pool Distribution</h2>
              <PoolBar overLamports={pool.totals.over} underLamports={pool.totals.under} />
            </div>

            <TrustChips ai={pool.ai} proof={pool.proof} contractUrl={pool.contract_url} />
          </div>

          {/* Right Column - Entry/Claim */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sticky top-24">
              <h2 className="text-lg font-bold tracking-tight mb-4">
                {isOpen ? "Enter Pool" : effectiveStatus === "RESOLVED" ? "Claim Winnings" : "Pool Locked"}
              </h2>

              {isOpen && (
                <EntryForm poolId={pool.id} totalOver={pool.totals.over} totalUnder={pool.totals.under} />
              )}

              {effectiveStatus === "RESOLVED" && <ClaimPanel poolId={pool.id} />}

              {!isOpen && effectiveStatus !== "RESOLVED" && (
                <p className="text-sm text-muted-foreground">
                  {lockReason || "This pool is locked. Please wait for resolution."}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

