"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ClaimPanel({ poolId }: { poolId: number }) {
  const { toast } = useToast()

  const handleClaim = async () => {
    try {
      const response = await fetch("/api/tx/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool_id: poolId,
          user_pubkey: "PLACEHOLDER_PUBKEY",
        }),
      })

      const data = await response.json()
      toast({
        title: "Claim submitted",
        description: `Transaction: ${data.tx.slice(0, 20)}...`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit claim",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
        <p className="text-sm text-green-500">This pool has been resolved. If you won, you can claim your winnings.</p>
      </div>
      <Button onClick={handleClaim} className="w-full" size="lg">
        Claim Winnings
      </Button>
    </div>
  )
}
