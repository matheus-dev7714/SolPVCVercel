"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EntryFormProps {
  side: "over" | "under"
  amount: string
  feeBps: number
  estPayout: number
  onAmountChange: (amount: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function EntryForm({ side, amount, feeBps, estPayout, onAmountChange, onSubmit, disabled }: EntryFormProps) {
  const fee = Number.parseFloat(amount) * (feeBps / 10000) || 0
  const sideColor = side === "over" ? "#00FFA3" : "#9945FF"

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-white font-medium">
          Amount (SOL)
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="bg-[#101826] border-gray-600 text-white focus:border-[#00D4FF] h-12 text-lg font-mono"
          disabled={disabled}
        />
        <p className="text-sm text-gray-400">
          Fee: {fee.toFixed(4)} SOL ({(feeBps / 100).toFixed(2)}%)
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-white font-medium">Estimated Payout if You Win</Label>
        <div className="p-4 bg-[#101826] rounded-xl border border-gray-600">
          <div className="text-2xl font-mono font-bold" style={{ color: sideColor }}>
            {estPayout.toFixed(4)} SOL
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {amount && Number.parseFloat(amount) > 0
              ? `${((estPayout / Number.parseFloat(amount)) * 100).toFixed(0)}% return`
              : "Enter amount to see potential return"}
          </div>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={disabled || !amount || Number.parseFloat(amount) <= 0}
        className="w-full h-12 text-lg font-semibold neon-glow-hover transition-all duration-200"
        style={{
          backgroundColor: sideColor,
          color: side === "over" ? "#0A0F1E" : "white",
        }}
      >
        Confirm Entry
      </Button>
    </div>
  )
}
