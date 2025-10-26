import { useEffect, useRef, useState } from "react"
import type { Side } from "@/types/pve"
import { SideSelector } from "./side-selector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { lamportsToSol, estimatePayoutWin } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/lib/app-context"

const FEE_BPS = 75 // 0.75%

export function EntryForm({
  poolId,
  totalOver,
  totalUnder,
}: {
  poolId: number
  totalOver: number
  totalUnder: number
}) {
  const [side, setSide] = useState<Side>("Over")
  const [amount, setAmount] = useState("")
  const { toast } = useToast()
  const { state, deductBalance } = useApp()

  const STEP_SOL = 0.1
  const parsedAmount = Number.isFinite(Number.parseFloat(amount)) ? Number.parseFloat(amount) : 0
  const amountLamports = parsedAmount * 1_000_000_000
  const feeLamports = Math.floor((amountLamports * FEE_BPS) / 10000)
  const netLamports = amountLamports - feeLamports

  const totalWinner = side === "Over" ? totalOver : totalUnder
  const estimatedPayout = estimatePayoutWin(
    netLamports,
    totalWinner + netLamports,
    side === "Over" ? totalOver + netLamports : totalOver,
    side === "Under" ? totalUnder + netLamports : totalUnder,
  )

  // Implied current return multiples (no fees, before your entry)
  const poolTotal = totalOver + totalUnder
  const impliedOver = totalOver > 0 ? (poolTotal / totalOver) : 0
  const impliedUnder = totalUnder > 0 ? (poolTotal / totalUnder) : 0

  const handleSubmit = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    // Validate against wallet balance
    if (parsedAmount > state.walletBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${state.walletBalance.toFixed(2)} SOL available`,
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/tx/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool_id: poolId,
          side,
          amount_lamports: Math.floor(amountLamports).toString(),
          user_pubkey: "GjwcWFQYzemBtpUoN5fMAP2FZviTtMRWCmrppGuTthJS", // Valid test Solana pubkey
        }),
      })

      const data = await response.json()
      
      // Check if the response was successful
      if (!response.ok) {
        toast({
          title: "Entry failed",
          description: data.error || "Failed to submit entry",
          variant: "destructive",
        })
        return
      }
      
      // Deduct from wallet balance
      deductBalance(parsedAmount)
      
      toast({
        title: "Entry submitted ✅",
        description: data.dev_mode 
          ? `${parsedAmount.toFixed(2)} SOL on ${side} (Dev Mode)` 
          : `Transaction prepared successfully`,
      })

      // After a successful entry, record an "Entry Placed" marker
      try {
        const poolRes = await fetch(`/api/pool/${poolId}`, { cache: 'no-store' })
        if (poolRes.ok) {
          const poolJson = await poolRes.json()
          const lastPoint = Array.isArray(poolJson?.chart) && poolJson.chart.length > 0
            ? poolJson.chart[poolJson.chart.length - 1]
            : null
          const priceAtEntry = lastPoint?.p
          if (typeof priceAtEntry === 'number') {
            const entryRecord = {
              t: Math.floor(Date.now() / 1000),
              priceAtEntry,
              side,
              lamports: amountLamports,
            }
            try {
              window.localStorage.setItem(`solpve:entry:${poolId}`, JSON.stringify(entryRecord))
            } catch {}
            // Notify any listeners (e.g., chart) to update immediately
            window.dispatchEvent(new CustomEvent('solpve:entry-placed', { detail: { poolId } }))
          }
        }
      } catch (_) {
        // ignore any failure to record marker
      }
      
      // Clear the amount after successful entry
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit entry",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Choose Side:</Label>
        <SideSelector selected={side} onSelect={setSide} />
      </div>

      <div>
        <Label htmlFor="amount" className="text-sm font-semibold">
          Enter SOL amount
        </Label>
        <div className="mt-2 relative">
          <Input
            id="amount"
            type="number"
            step="0.1"
            min="0"
            placeholder="5.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => {
              if (amount === "") return
              const v = Number.parseFloat(amount)
              if (!Number.isFinite(v) || v < 0) {
                setAmount("")
              } else {
                setAmount(v.toFixed(1))
              }
            }}
            className="font-mono text-lg pr-12"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Stepper
              onStepUp={() => setAmount(Math.max(0, parsedAmount + STEP_SOL).toFixed(1))}
              onStepDown={() => setAmount(Math.max(0, parsedAmount - STEP_SOL).toFixed(1))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex justify-between text-muted-foreground">
          <span>Your balance</span>
          <span className="font-mono font-semibold text-neon-green">{state.walletBalance.toFixed(2)} SOL</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>0.75% transaction fee applied</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Estimated payout if win</span>
          <span className="text-neon-green font-mono">{lamportsToSol(estimatedPayout)} SOL</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Implied return (current)</span>
          <div className="flex items-center gap-3">
            <span className="text-aqua font-semibold">Over {impliedOver.toFixed(2)}x</span>
            <span className="text-neon-purple font-semibold">Under {impliedUnder.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={parsedAmount <= 0 || parsedAmount > state.walletBalance}
        className="w-full h-12 bg-neon-green text-black font-bold hover:opacity-90 transition-opacity text-base border border-neon-green disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {parsedAmount > state.walletBalance ? 'Insufficient Balance' : 'Confirm Entry'}
      </Button>
    </div>
  )
}

function Stepper({
  onStepUp,
  onStepDown,
}: {
  onStepUp: () => void
  onStepDown: () => void
}) {
  const holdTimerRef = useRef<number | null>(null)
  const accelTimerRef = useRef<number | null>(null)
  const currentActionRef = useRef<null | 'up' | 'down'>(null)
  const intervalRef = useRef<number>(200)

  const startHold = (action: 'up' | 'down') => {
    stopHold()
    currentActionRef.current = action
    // initial single step for responsiveness
    action === 'up' ? onStepUp() : onStepDown()

    const tick = () => {
      if (currentActionRef.current === 'up') onStepUp()
      else if (currentActionRef.current === 'down') onStepDown()
    }

    holdTimerRef.current = window.setInterval(tick, intervalRef.current)
    // accelerate after 1s
    accelTimerRef.current = window.setTimeout(() => {
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current)
      intervalRef.current = 75
      holdTimerRef.current = window.setInterval(tick, intervalRef.current)
    }, 1000)
  }

  const stopHold = () => {
    if (holdTimerRef.current) window.clearInterval(holdTimerRef.current)
    if (accelTimerRef.current) window.clearTimeout(accelTimerRef.current)
    holdTimerRef.current = null
    accelTimerRef.current = null
    currentActionRef.current = null
    intervalRef.current = 200
  }

  useEffect(() => {
    return () => stopHold()
  }, [])

  return (
    <div className="flex flex-col select-none items-center">
      <button
        type="button"
        aria-label="Increase amount"
        className="h-4 w-6 flex items-center justify-center rounded-t-sm text-neon-green hover:bg-neon-green/10"
        onMouseDown={() => startHold('up')}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold('up')}
        onTouchEnd={stopHold}
        onClick={(e) => { e.preventDefault(); onStepUp() }}
      >
        <span className="font-mono text-xl leading-none">^</span>
      </button>
      <button
        type="button"
        aria-label="Decrease amount"
        className="h-4 w-6 flex items-center justify-center rounded-b-sm text-neon-green hover:bg-neon-green/10"
        onMouseDown={() => startHold('down')}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold('down')}
        onTouchEnd={stopHold}
        onClick={(e) => { e.preventDefault(); onStepDown() }}
      >
        <span className="font-mono text-xl leading-none rotate-180 inline-block">^</span>
      </button>
    </div>
  )
}
