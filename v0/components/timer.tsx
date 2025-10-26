"use client"

import { useEffect, useState } from "react"

interface TimerProps {
  now: Date
  lockTs: Date
  endTs: Date
}

export function Timer({ now, lockTs, endTs }: TimerProps) {
  const [currentTime, setCurrentTime] = useState(now)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00"
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const lockTime = lockTs.getTime() - currentTime.getTime()
  const endTime = endTs.getTime() - currentTime.getTime()

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <span className="text-gray-300 text-sm">Locks in</span>
        <div className="font-mono text-[#FFD60A] bg-[#101826] px-3 py-1.5 rounded-lg border border-[#FFD60A]/30 pulse-glow">
          {formatTime(lockTime)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-300 text-sm">Ends in</span>
        <div className="font-mono text-[#00D4FF] bg-[#101826] px-3 py-1.5 rounded-lg border border-[#00D4FF]/30">
          {formatTime(endTime)}
        </div>
      </div>
    </div>
  )
}
