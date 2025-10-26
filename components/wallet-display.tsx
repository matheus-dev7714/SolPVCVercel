"use client"

import { useApp } from "@/lib/app-context"

export function WalletDisplay() {
  const { state } = useApp()

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30">
        <span className="text-xs text-muted-foreground">Balance:</span>
        <span className="font-mono font-bold text-neon-green">
          {state.walletBalance.toFixed(2)} SOL
        </span>
      </div>
      <span className="text-xs px-2 py-1 rounded-md bg-yellow/10 text-yellow border border-yellow/20">
        DEVNET
      </span>
      <button
        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg border border-solid border-white/10 cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black-10"
        type="button"
        aria-label="Connect wallet"
      >
        <span className="font-semibold text-white text-sm text-center tracking-[-0.30px] leading-tight whitespace-nowrap">
          Connect Wallet
        </span>
      </button>
    </div>
  )
}


