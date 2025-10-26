"use client"

import { useEffect, useState } from "react"
import type { Status } from "@/types/pve"

export function Timer({
  lockTs,
  endTs,
  status,
  hideLabel = false,
}: {
  lockTs: number
  endTs: number
  status: Status
  hideLabel?: boolean
}) {
  const [timeLeft, setTimeLeft] = useState("")
  const [pulse, setPulse] = useState(false)
  const [label, setLabel] = useState<string>(status === "OPEN" ? "Locks in" : "Ends in")

  useEffect(() => {
    const toSeconds = (ts: number) => {
      // Normalize milliseconds to seconds if needed
      return ts > 1_000_000_000_000 ? Math.floor(ts / 1000) : Math.floor(ts)
    }

    const nextMidnight = (nowSec: number) => {
      const d = new Date((nowSec + 1) * 1000)
      d.setDate(d.getDate() + 1)
      d.setHours(0, 0, 0, 0)
      return Math.floor(d.getTime() / 1000)
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const lockSec = toSeconds(lockTs)
      const endSec = toSeconds(endTs)

      let targetTs = endSec
      let nextLabel = "Ends in"

      if (status === "OPEN") {
        if (lockSec > now) {
          targetTs = lockSec
          nextLabel = "Locks in"
        } else if (endSec > now) {
          targetTs = endSec
          nextLabel = "Ends in"
        } else {
          // Past both lock and end — likely awaiting backend status update
          targetTs = now
          nextLabel = "Ends in"
        }
      } else if (status === "LOCKED") {
        if (endSec > now) {
          targetTs = endSec
          nextLabel = "Ends in"
        } else {
          targetTs = now
          nextLabel = "Ends in"
        }
      } else {
        // RESOLVED/VOID handled by early return below
        targetTs = now
      }

      let labelToUse = nextLabel
      let diff = targetTs - now

      if (diff <= 0) {
        // Fallback: count down to next midnight to avoid 00:00:00 in dev
        const midnight = nextMidnight(now)
        diff = Math.max(0, midnight - now)
        labelToUse = "Ends in"
      }

      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )

      setLabel(labelToUse)

      setPulse(true)
      setTimeout(() => setPulse(false), 100)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [lockTs, endTs, status])

  if (status === "RESOLVED" || status === "VOID") {
    return null
  }

  // Show static dashes for locked pools
  if (status === "LOCKED") {
    return (
      <div className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {hideLabel ? "" : "Locked"}
          </span>
          <span className="text-lg font-mono font-bold text-muted-foreground">
            --:--:--
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-3 border-t border-border/50">
      <div className="flex items-center justify-between text-sm">
        {!hideLabel && (
          <span className="text-muted-foreground text-xs pr-3 whitespace-nowrap">{label}</span>
        )}
        <span className={`font-mono font-bold text-aqua transition-all pl-3 whitespace-nowrap ${pulse ? "scale-105" : "scale-100"}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}
