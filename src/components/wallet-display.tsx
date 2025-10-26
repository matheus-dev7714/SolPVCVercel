import { useApp } from "@/lib/app-context"
import { Button } from "@/components/ui/button"

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
      <Button className="bg-gradient-to-r from-aqua to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity">
        Connect Wallet
      </Button>
    </div>
  )
}

