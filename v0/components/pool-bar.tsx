import { Badge } from "@/components/ui/badge"

interface PoolBarProps {
  over: { amount: number; percentage: number }
  under: { amount: number; percentage: number }
}

export function PoolBar({ over, under }: PoolBarProps) {
  const total = over.amount + under.amount
  const isBalanced = Math.abs(over.percentage - under.percentage) < 10

  return (
    <div className="space-y-4">
      <div className="relative h-12 bg-[#101826] rounded-xl overflow-hidden border border-gray-700">
        <div
          className="absolute left-0 top-0 h-full pool-gradient-over flex items-center justify-center text-sm font-semibold text-black"
          style={{ width: `${over.percentage}%` }}
        >
          {over.percentage > 20 && `Over ${over.percentage}%`}
        </div>
        <div
          className="absolute right-0 top-0 h-full pool-gradient-under flex items-center justify-center text-sm font-semibold text-white"
          style={{ width: `${under.percentage}%` }}
        >
          {under.percentage > 20 && `Under ${under.percentage}%`}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex justify-between w-full">
          <span className="text-[#00FFA3] font-semibold">Over: {over.amount} SOL</span>
          <span className="text-[#9945FF] font-semibold">Under: {under.amount} SOL</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={`${
            isBalanced
              ? "bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]"
              : "bg-[#FFD60A]/10 border-[#FFD60A]/30 text-[#FFD60A]"
          } text-xs`}
        >
          {isBalanced ? "Balanced" : "Skewed"}
        </Badge>
      </div>
    </div>
  )
}
