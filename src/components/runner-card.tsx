import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface RunnerCardProps {
  runner: {
    token: string
    roi: string
    volume: string
    status: "RESOLVED" | "OPEN" | "LOCKED"
  }
}

export function RunnerCard({ runner }: RunnerCardProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-[#1F2A44] rounded-xl shadow-lg hover:shadow-neon-green/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green/20 to-aqua/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-neon-green" />
          </div>
          <span className="font-bold tracking-tight">{runner.token}</span>
        </div>
        <span className="text-sm font-bold text-neon-green">{runner.roi}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Volume: {runner.volume}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50">{runner.status}</span>
      </div>
    </Card>
  )
}
